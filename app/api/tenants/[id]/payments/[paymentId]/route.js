import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

// PUT - Update a payment
export async function PUT(request, { params }) {
  try {
    const session = await getSession(request);
    
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, paymentId } = params;
    const userId = new ObjectId(session.user_id);
    const body = await request.json();
    const { db } = await connectToDatabase();

    // Remove immutable fields
    const { _id, createdAt, ...updateData } = body;

    // Handle date conversions
    if (updateData.paymentDate) {
      updateData.paymentDate = new Date(updateData.paymentDate);
    }
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    // Convert numeric fields
    if (updateData.amount) {
      updateData.amount = parseFloat(updateData.amount);
    }
    if (updateData.lateFee) {
      updateData.lateFee = parseFloat(updateData.lateFee);
    }

    // Update payment in tenant's payments array
    const result = await db.collection('tenants').updateOne(
      {
        _id: new ObjectId(id),
        userId: userId,
        'payments._id': new ObjectId(paymentId)
      },
      {
        $set: Object.keys(updateData).reduce((acc, key) => {
          acc[`payments.$.${key}`] = updateData[key];
          return acc;
        }, {})
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Payment updated successfully'
    });

  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

// DELETE - Remove a payment
export async function DELETE(request, { params }) {
  try {
    const session = await getSession(request);
    
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, paymentId } = params;
    const userId = new ObjectId(session.user_id);
    const { db } = await connectToDatabase();

    // First get the payment details to adjust totals
    const tenant = await db.collection('tenants').findOne({
      _id: new ObjectId(id),
      userId: userId
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const payment = tenant.payments?.find(
      p => p._id.toString() === paymentId
    );

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const totalPayment = payment.amount + (payment.lateFee || 0);

    // Remove payment and update totals
    const result = await db.collection('tenants').updateOne(
      { _id: new ObjectId(id), userId: userId },
      {
        $pull: { payments: { _id: new ObjectId(paymentId) } },
        $inc: {
          'paymentHistory.totalPaid': -totalPayment,
          'rentStatus.balance': payment.amount
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete payment' }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Payment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}