// components/PaymentsList.jsx
import { useState, useEffect } from 'react';
import { Plus, Download, Filter } from 'lucide-react';
import PaymentModal from './PaymentModal';

const PaymentsList = ({ tenant }) => {
  const [payments, setPayments] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/tenants/${tenant._id}/payments`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments);
        setPaymentHistory(data.paymentHistory);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [tenant._id]);

  const handlePaymentAdded = (newPayment) => {
    setPayments([newPayment, ...payments]);
    fetchPayments(); // Refresh data
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Month', 'Amount', 'Method', 'Status', 'Receipt No', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...payments.map(p => [
        new Date(p.paymentDate).toLocaleDateString(),
        p.month,
        p.amount,
        p.paymentMethod,
        p.status,
        p.receiptNumber,
        `"${p.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tenant.personalInfo.name}_payments.csv`;
    a.click();
  };

  if (loading) return <div>Loading payments...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Paid</div>
          <div className="text-2xl font-bold text-green-600">
            ${paymentHistory.totalPaid?.toLocaleString() || '0'}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Monthly Rent</div>
          <div className="text-2xl font-bold">
            ${tenant.rentStatus?.monthlyRent?.toLocaleString() || '0'}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Last Payment</div>
          <div className="text-lg font-semibold">
            {paymentHistory.lastPaymentDate ? 
              new Date(paymentHistory.lastPaymentDate).toLocaleDateString() : 
              'No payments yet'}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Next Due Date</div>
          <div className="text-lg font-semibold">
            {paymentHistory.nextPaymentDate ? 
              new Date(paymentHistory.nextPaymentDate).toLocaleDateString() : 
              'Not set'}
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payment History</h3>
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            className="flex items-center px-3 py-2 border rounded hover:bg-gray-50"
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus size={16} className="mr-2" />
            Add Payment
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Month</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Method</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Receipt No</th>
              <th className="p-3 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  No payments recorded yet
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="p-3">{payment.month}</td>
                  <td className="p-3 font-semibold">
                    ${payment.amount.toLocaleString()}
                    {payment.lateFee > 0 && (
                      <span className="text-xs text-red-600 ml-1">
                        (+${payment.lateFee} late fee)
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      payment.status === 'late' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {payment.receiptNumber}
                  </td>
                  <td className="p-3 text-sm text-gray-600 max-w-xs truncate">
                    {payment.notes}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaymentModal
        tenant={tenant}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPaymentAdded={handlePaymentAdded}
      />
    </div>
  );
};