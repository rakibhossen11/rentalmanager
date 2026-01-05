import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Add a new payment
export async function POST(request, { params }) {
  try {
    const session = await getSession(request);
    
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = new ObjectId(session.user_id);
    const body = await request.json();
    const { db } = await connectToDatabase();

    // Validate required fields
    if (!body.amount || !body.paymentDate || !body.month) {
      return NextResponse.json({ 
        error: 'Amount, payment date, and month are required' 
      }, { status: 400 });
    }

    // Check if tenant exists
    const tenant = await db.collection('tenants').findOne({
      _id: new ObjectId(id),
      userId: userId
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Prepare payment data
    const paymentData = {
      _id: new ObjectId(),
      amount: parseFloat(body.amount),
      paymentDate: new Date(body.paymentDate),
      dueDate: body.dueDate ? new Date(body.dueDate) : new Date(),
      paymentMethod: body.paymentMethod || 'cash',
      status: body.status || 'paid',
      month: body.month,
      year: body.year || new Date().getFullYear(),
      monthNumber: body.monthNumber || new Date().getMonth() + 1,
      notes: body.notes || '',
      receiptNumber: body.receiptNumber || `REC-${Date.now()}`,
      lateFee: parseFloat(body.lateFee) || 0,
      createdAt: new Date()
    };

    // Calculate total payment for this transaction
    const totalPayment = paymentData.amount + paymentData.lateFee;

    // Update tenant with new payment
    const result = await db.collection('tenants').updateOne(
      { _id: new ObjectId(id), userId: userId },
      {
        $push: { payments: paymentData },
        $inc: {
          'paymentHistory.totalPaid': totalPayment,
          'rentStatus.balance': -paymentData.amount
        },
        $set: {
          'paymentHistory.lastPaymentDate': paymentData.paymentDate,
          'paymentHistory.nextPaymentDate': new Date(
            new Date().setMonth(new Date().getMonth() + 1)
          ),
          'rentStatus.lastPayment': {
            amount: paymentData.amount,
            date: paymentData.paymentDate,
            method: paymentData.paymentMethod
          }
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to add payment' }, { status: 400 });
    }

    // Get updated tenant
    const updatedTenant = await db.collection('tenants').findOne({
      _id: new ObjectId(id),
      userId: userId
    });

    // Transform for response
    const transformedPayment = {
      ...paymentData,
      _id: paymentData._id.toString()
    };

    return NextResponse.json({
      message: 'Payment added successfully',
      payment: transformedPayment,
      tenant: {
        _id: updatedTenant._id.toString(),
        paymentHistory: updatedTenant.paymentHistory,
        rentStatus: updatedTenant.rentStatus
      }
    });

  } catch (error) {
    console.error('Error adding payment:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

// GET - Get all payments for a tenant
export async function GET(request, { params }) {
  try {
    const session = await getSession(request);
    
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = new ObjectId(session.user_id);
    const { db } = await connectToDatabase();

    const tenant = await db.collection('tenants').findOne(
      { _id: new ObjectId(id), userId: userId },
      { projection: { payments: 1, paymentHistory: 1 } }
    );

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const payments = tenant.payments || [];
    const paymentHistory = tenant.paymentHistory || {
      totalPaid: 0,
      totalDue: 0,
      lastPaymentDate: null,
      nextPaymentDate: null
    };

    // Sort payments by date (newest first)
    payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    return NextResponse.json({
      payments: payments.map(payment => ({
        ...payment,
        _id: payment._id.toString()
      })),
      paymentHistory,
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0)
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}