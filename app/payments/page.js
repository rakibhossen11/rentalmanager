// 'use client';

// import { useState, useEffect } from 'react';
// import { Plus, DollarSign, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
// import { getPayments } from '';
// import { useToast } from '../contexts/ToastContext';

// export default function PaymentsPage() {
//   const [payments, setPayments] = useState([]);
//   const { showBackendToast } = useToast();

//   useEffect(() => {
//     setPayments(getPayments());
//   }, []);

//   const statusIcons = {
//     paid: <CheckCircle className="w-4 h-4 text-green-500" />,
//     pending: <Clock className="w-4 h-4 text-yellow-500" />,
//     overdue: <AlertCircle className="w-4 h-4 text-red-500" />
//   };

//   const statusColors = {
//     paid: 'bg-green-100 text-green-800',
//     pending: 'bg-yellow-100 text-yellow-800',
//     overdue: 'bg-red-100 text-red-800'
//   };

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
//           <p className="text-gray-600">Track rent collection and payments</p>
//         </div>
//         <button
//           onClick={showBackendToast}
//           className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//         >
//           <Plus className="w-5 h-5" />
//           Record Payment
//         </button>
//       </div>

//       <div className="bg-white rounded-xl shadow-md overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Tenant
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Month
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Amount
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Date
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {payments.map((payment) => (
//                 <tr key={payment.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="p-2 bg-blue-50 rounded-lg">
//                         <DollarSign className="w-5 h-5 text-blue-600" />
//                       </div>
//                       <div className="ml-4">
//                         <div className="text-sm font-medium text-gray-900">
//                           Tenant {payment.tenantId}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           Property {payment.propertyId}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center gap-2">
//                       <Calendar className="w-4 h-4 text-gray-400" />
//                       <span className="text-sm text-gray-900">{payment.month}</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-lg font-bold text-gray-900">
//                       ${payment.amount.toLocaleString()}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {new Date(payment.date).toLocaleDateString()}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center gap-2">
//                       {statusIcons[payment.status]}
//                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[payment.status]}`}>
//                         {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex gap-2">
//                       <button
//                         onClick={showBackendToast}
//                         className="text-blue-600 hover:text-blue-900"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={showBackendToast}
//                         className="text-red-600 hover:text-red-900"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white p-6 rounded-xl shadow-md">
//           <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Summary</h3>
//           <div className="space-y-3">
//             <div className="flex justify-between items-center">
//               <span className="text-gray-600">Total Collected</span>
//               <span className="font-bold text-green-600">$2,700</span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-gray-600">Pending Payments</span>
//               <span className="font-bold text-yellow-600">$1,500</span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-gray-600">Overdue</span>
//               <span className="font-bold text-red-600">$0</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }