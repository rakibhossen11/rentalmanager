// app/dashboard/tenants/components/TenantPDFGenerator.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, Loader2, FileText, Calendar, Phone, Mail, Home, DollarSign, User, Building, MapPin, CheckCircle, Clock, AlertCircle, CreditCard, Shield, Briefcase, Car, Dog, Users as UsersIcon, File, CreditCard as Card, History, AlertTriangle, TrendingUp, TrendingDown, Percent, Banknote, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TenantPDFGenerator({ tenant, pdfType = 'detailed', onClose }) {
    console.log("Tenant data:", tenant);
    const [generating, setGenerating] = useState(false);
    const [selectedType, setSelectedType] = useState(pdfType);
    const [mounted, setMounted] = useState(false);
    const reportIdRef = useRef(`PMS-${Math.random().toString(36).substr(2, 8).toUpperCase()}`);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Normalize tenant data to always be an array
    const tenants = Array.isArray(tenant) ? tenant : [tenant];
    const isSingleTenant = !Array.isArray(tenant);

    // Use a stable date format that doesn't change
    const getCurrentDate = () => {
        if (!mounted) return '';
        const now = new Date();
        return now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

    const getSimpleDate = () => {
        if (!mounted) return '';
        const now = new Date();
        return now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDate = (dateString) => {
        if (!dateString || !mounted) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'N/A';
        }
    };

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null || !mounted) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        if (!status) return 'bg-gray-100 text-gray-800 border border-gray-200';
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800 border border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'inactive':
            case 'expired':
                return 'bg-red-100 text-red-800 border border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        if (!status) return null;
        switch (status.toLowerCase()) {
            case 'active':
                return '✅';
            case 'pending':
                return '⏳';
            case 'inactive':
            case 'expired':
                return '❌';
            default:
                return 'ℹ️';
        }
    };

    const getPaymentStatusBadge = (status) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        switch (status.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'late':
                return 'bg-red-100 text-red-800';
            case 'partial':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Helper to get property name
    const getPropertyName = (tenant) => {
        if (!tenant.propertyId) return 'Not Assigned';
        if (typeof tenant.propertyId === 'object') {
            return tenant.propertyId.name || 'N/A';
        }
        return 'Property ' + tenant.propertyId.substring(0, 8);
    };

    // Calculate lease duration
    const calculateLeaseDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return 'N/A';
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
            return `${months} month${months !== 1 ? 's' : ''}`;
        } catch (error) {
            return 'N/A';
        }
    };

    // Calculate days until end
    const calculateDaysUntilEnd = (endDate) => {
        if (!endDate || !mounted) return null;
        try {
            const end = new Date(endDate);
            const today = new Date();
            const diffTime = end - today;
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch (error) {
            return null;
        }
    };

    // Generate stats cards HTML
    const generateStatsCards = () => {
        const activeCount = tenants.filter(t => t.status === 'active' || t.lease?.status === 'active').length;
        const pendingCount = tenants.filter(t => t.status === 'pending' || t.lease?.status === 'pending').length;
        const totalRent = tenants.reduce((sum, t) => sum + (t.lease?.monthlyRent || 0), 0);
        const propertyCount = new Set(tenants.map(t => t.propertyId).filter(Boolean)).size;

        return `
            <div class="stats-card bg-green-50 border border-green-200">
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                        <span style="color: #059669;">✓</span>
                    </div>
                    <span class="text-xs font-semibold text-green-800">Active</span>
                </div>
                <div class="text-lg font-bold text-green-900">${activeCount}</div>
            </div>
            
            <div class="stats-card bg-yellow-50 border border-yellow-200">
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
                        <span style="color: #d97706;">⏳</span>
                    </div>
                    <span class="text-xs font-semibold text-yellow-800">Pending</span>
                </div>
                <div class="text-lg font-bold text-yellow-900">${pendingCount}</div>
            </div>
            
            <div class="stats-card bg-blue-50 border border-blue-200">
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                        <span style="color: #3b82f6;">💰</span>
                    </div>
                    <span class="text-xs font-semibold text-blue-800">Monthly Rent</span>
                </div>
                <div class="text-lg font-bold text-blue-900">${formatCurrency(totalRent)}</div>
            </div>
            
            <div class="stats-card bg-purple-50 border border-purple-200">
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                        <span style="color: #8b5cf6;">🏠</span>
                    </div>
                    <span class="text-xs font-semibold text-purple-800">Properties</span>
                </div>
                <div class="text-lg font-bold text-purple-900">${propertyCount}</div>
            </div>
        `;
    };

    // Generate single tenant HTML
    const generateSingleTenantHTML = (t) => {
        return `
            <div class="mb-5 p-4 border rounded-lg bg-gray-50 no-break">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h3 class="text-md font-bold text-gray-900">${t.personalInfo?.fullName || 'Tenant'}</h3>
                        <div class="flex flex-wrap gap-2 mt-1">
                            <span class="text-xs text-gray-600">ID: ${t._id?.substring(0, 8)}</span>
                            <span class="text-xs text-gray-600">•</span>
                            <span class="text-xs text-gray-600">Unit: ${t.unit || 'N/A'}</span>
                            <span class="text-xs text-gray-600">•</span>
                            <span class="text-xs text-gray-600">Created: ${formatDate(t.createdAt)}</span>
                        </div>
                    </div>
                    <span class="px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(t.status || t.lease?.status)}">
                        ${(t.status || t.lease?.status || 'N/A').toUpperCase()}
                    </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- Personal Info -->
                    <div class="border rounded p-3 bg-white">
                        <h4 class="font-semibold text-gray-700 mb-2 text-sm">Personal Information</h4>
                        <div class="space-y-1 text-xs">
                            ${t.personalInfo?.fullName ? `<div><strong>Name:</strong> ${t.personalInfo.fullName}</div>` : ''}
                            ${t.personalInfo?.email ? `<div><strong>Email:</strong> ${t.personalInfo.email}</div>` : ''}
                            ${t.personalInfo?.phone ? `<div><strong>Phone:</strong> ${t.personalInfo.phone}</div>` : ''}
                            ${t.personalInfo?.dateOfBirth ? `<div><strong>DOB:</strong> ${formatDate(t.personalInfo.dateOfBirth)}</div>` : ''}
                            ${t.personalInfo?.gender ? `<div><strong>Gender:</strong> ${t.personalInfo.gender}</div>` : ''}
                            ${t.personalInfo?.nationality ? `<div><strong>Nationality:</strong> ${t.personalInfo.nationality}</div>` : ''}
                        </div>
                    </div>
                    
                    <!-- Employment Info -->
                    <div class="border rounded p-3 bg-white">
                        <h4 class="font-semibold text-gray-700 mb-2 text-sm">Employment & Income</h4>
                        <div class="space-y-1 text-xs">
                            ${t.employment?.occupation ? `<div><strong>Occupation:</strong> ${t.employment.occupation}</div>` : ''}
                            ${t.employment?.employer ? `<div><strong>Employer:</strong> ${t.employment.employer}</div>` : ''}
                            ${t.employment?.monthlyIncome ? `<div><strong>Monthly Income:</strong> ${formatCurrency(t.employment.monthlyIncome)}</div>` : ''}
                            ${t.employment?.annualIncome ? `<div><strong>Annual Income:</strong> ${formatCurrency(t.employment.annualIncome)}</div>` : ''}
                            ${t.financial?.creditScore ? `<div><strong>Credit Score:</strong> ${t.financial.creditScore}</div>` : ''}
                        </div>
                    </div>
                    
                    <!-- Lease & Financial -->
                    <div class="border rounded p-3 bg-white">
                        <h4 class="font-semibold text-gray-700 mb-2 text-sm">Lease & Financial</h4>
                        <div class="space-y-1 text-xs">
                            ${t.lease?.monthlyRent ? `<div><strong>Monthly Rent:</strong> ${formatCurrency(t.lease.monthlyRent)}</div>` : ''}
                            ${t.lease?.securityDeposit ? `<div><strong>Security Deposit:</strong> ${formatCurrency(t.lease.securityDeposit)}</div>` : ''}
                            ${t.lease?.petDeposit ? `<div><strong>Pet Deposit:</strong> ${formatCurrency(t.lease.petDeposit)}</div>` : ''}
                            <div><strong>Lease Term:</strong> ${formatDate(t.lease?.startDate)} to ${formatDate(t.lease?.endDate)}</div>
                            ${t.lease?.dueDay ? `<div><strong>Rent Due Day:</strong> ${t.lease.dueDay} of month</div>` : ''}
                            ${t.lease?.lateFee ? `<div><strong>Late Fee:</strong> ${formatCurrency(t.lease.lateFee)}</div>` : ''}
                            ${t.lease?.gracePeriod ? `<div><strong>Grace Period:</strong> ${t.lease.gracePeriod} days</div>` : ''}
                        </div>
                    </div>
                </div>
                
                <!-- Payment History -->
                ${t.paymentHistory || (t.payments && t.payments.length > 0) ? `
                    <div class="mt-4 pt-4 border-t">
                        <h4 class="font-semibold text-gray-700 mb-2 text-sm">Payment History</h4>
                        <div class="space-y-2 text-xs">
                            ${t.paymentHistory?.lastPaymentDate ? `
                                <div class="flex justify-between">
                                    <span>Last Payment:</span>
                                    <span class="font-medium">${formatDate(t.paymentHistory.lastPaymentDate)} - ${formatCurrency(t.paymentHistory.totalPaid || 0)}</span>
                                </div>
                            ` : ''}
                            ${t.paymentHistory?.nextPaymentDate ? `
                                <div class="flex justify-between">
                                    <span>Next Payment Due:</span>
                                    <span class="font-medium">${formatDate(t.paymentHistory.nextPaymentDate)}</span>
                                </div>
                            ` : ''}
                            ${t.financial?.currentBalance ? `
                                <div class="flex justify-between">
                                    <span>Current Balance:</span>
                                    <span class="font-medium ${t.financial.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}">
                                        ${formatCurrency(t.financial.currentBalance)}
                                    </span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Notes -->
                ${t.notes ? `
                    <div class="mt-4 pt-4 border-t">
                        <h4 class="font-semibold text-gray-700 mb-2 text-sm">Notes</h4>
                        <p class="text-xs text-gray-600 bg-gray-50 p-2 rounded">${t.notes}</p>
                    </div>
                ` : ''}
            </div>
        `;
    };

    // Generate PDF based on type
    const generatePDF = () => {
        if (!mounted) return;
        
        setGenerating(true);
        
        try {
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                toast.error('Please allow popups to generate PDF');
                setGenerating(false);
                return;
            }

            let htmlContent = '';
            
            if (selectedType === 'detailed') {
                htmlContent = generateDetailedPDF();
            } else {
                htmlContent = generateSimplePDF();
            }

            // Write content to new window
            printWindow.document.write(htmlContent);
            printWindow.document.close();

            toast.success(`${selectedType === 'detailed' ? 'Detailed' : 'Simple'} PDF generated successfully`);
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Failed to generate PDF');
        } finally {
            setGenerating(false);
        }
    };

    const generateDetailedPDF = () => {
        const currentDate = getCurrentDate();
        const reportId = reportIdRef.current;
        const currentYear = new Date().getFullYear();

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${isSingleTenant ? 'Tenant Profile' : 'Tenant Report'} - ${currentDate}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @media print {
                        body {
                            margin: 0;
                            padding: 20px;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        @page {
                            margin: 20px;
                            size: letter;
                        }
                        .page-break {
                            page-break-after: always;
                        }
                        .no-break {
                            page-break-inside: avoid;
                        }
                    }
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        font-size: 12px;
                    }
                    .header-gradient {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .stats-card {
                        border-radius: 8px;
                        padding: 16px;
                        margin-bottom: 8px;
                    }
                    table {
                        font-size: 11px;
                    }
                    th, td {
                        padding: 8px 12px;
                    }
                    h1 { font-size: 24px; }
                    h2 { font-size: 18px; }
                    h3 { font-size: 16px; }
                    h4 { font-size: 14px; }
                </style>
            </head>
            <body class="bg-gray-50">
                <div class="max-w-4xl mx-auto p-6 bg-white shadow-lg">
                    <!-- Header -->
                    <div class="header-gradient text-white p-5 rounded-lg mb-6">
                        <div class="flex justify-between items-start">
                            <div>
                                <h1 class="text-2xl font-bold mb-1">${isSingleTenant ? 'Tenant Profile' : 'Tenant Report'}</h1>
                                <p class="text-blue-100 text-sm">Generated on ${currentDate}</p>
                                <p class="text-blue-100 text-sm">Total Tenant${tenants.length !== 1 ? 's' : ''}: ${tenants.length}</p>
                                <p class="text-blue-100 text-sm mt-1">Report ID: ${reportId}</p>
                                ${isSingleTenant && tenants[0]?.personalInfo?.fullName ? 
                                    `<p class="text-blue-100 text-sm mt-1">Tenant: ${tenants[0].personalInfo.fullName}</p>` : 
                                    ''}
                            </div>
                            <div class="bg-white/20 p-3 rounded-lg">
                                <div class="text-3xl font-bold">${tenants.length}</div>
                                <div class="text-sm opacity-90">Tenant${tenants.length !== 1 ? 's' : ''}</div>
                            </div>
                        </div>
                    </div>

                    ${!isSingleTenant ? `
                        <!-- Summary Stats -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            ${generateStatsCards()}
                        </div>

                        <!-- Executive Summary -->
                        <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h2 class="text-lg font-bold text-blue-900 mb-2">Executive Summary</h2>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p class="text-sm text-blue-800"><strong>Total Monthly Revenue:</strong> ${formatCurrency(tenants.reduce((sum, t) => sum + (t.lease?.monthlyRent || 0), 0))}</p>
                                    <p class="text-sm text-blue-800"><strong>Total Security Deposits:</strong> ${formatCurrency(tenants.reduce((sum, t) => sum + (t.lease?.securityDeposit || 0), 0))}</p>
                                    <p class="text-sm text-blue-800"><strong>Average Rent:</strong> ${formatCurrency(tenants.reduce((sum, t) => sum + (t.lease?.monthlyRent || 0), 0) / (tenants.length || 1))}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-blue-800"><strong>Properties Occupied:</strong> ${new Set(tenants.map(t => t.propertyId).filter(Boolean)).size}</p>
                                    <p class="text-sm text-blue-800"><strong>Units Occupied:</strong> ${tenants.filter(t => t.unit).length}</p>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    ${tenants.length === 1 ? `
                        <!-- Single tenant detailed view -->
                        <div class="mb-6 no-break">
                            ${tenants.map((t, index) => generateSingleTenantHTML(t)).join('')}
                        </div>
                    ` : `
                        <!-- Multi-tenant table view -->
                        <div class="mb-6 page-break">
                            <h2 class="text-lg font-bold text-gray-800 mb-3 pb-2 border-b">Tenant Overview</h2>
                            <div class="overflow-x-auto">
                                <table class="w-full border-collapse">
                                    <thead>
                                        <tr class="bg-gray-50">
                                            <th class="py-2 px-3 text-left text-xs font-semibold text-gray-700 border">Tenant</th>
                                            <th class="py-2 px-3 text-left text-xs font-semibold text-gray-700 border">Contact</th>
                                            <th class="py-2 px-3 text-left text-xs font-semibold text-gray-700 border">Property/Unit</th>
                                            <th class="py-2 px-3 text-left text-xs font-semibold text-gray-700 border">Lease Details</th>
                                            <th class="py-2 px-3 text-left text-xs font-semibold text-gray-700 border">Financial</th>
                                            <th class="py-2 px-3 text-left text-xs font-semibold text-gray-700 border">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${tenants.map((t, index) => `
                                            <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} no-break">
                                                <td class="py-2 px-3 border">
                                                    <div class="font-medium text-gray-900">${t.personalInfo?.fullName || 'N/A'}</div>
                                                    <div class="text-xs text-gray-500">ID: ${t._id?.substring(0, 8) || 'N/A'}</div>
                                                </td>
                                                <td class="py-2 px-3 border">
                                                    <div class="text-xs">
                                                        <div>📧 ${t.personalInfo?.email || 'No email'}</div>
                                                        <div>📱 ${t.personalInfo?.phone || 'No phone'}</div>
                                                    </div>
                                                </td>
                                                <td class="py-2 px-3 border">
                                                    <div class="font-medium">${getPropertyName(t)}</div>
                                                    <div class="text-xs text-gray-500">${t.unit ? 'Unit ' + t.unit : 'No unit'}</div>
                                                </td>
                                                <td class="py-2 px-3 border">
                                                    <div class="text-xs">
                                                        <div>💰 ${formatCurrency(t.lease?.monthlyRent)}/mo</div>
                                                        <div>📅 ${formatDate(t.lease?.startDate)} - ${formatDate(t.lease?.endDate)}</div>
                                                        <div>⏳ ${calculateLeaseDuration(t.lease?.startDate, t.lease?.endDate)}</div>
                                                    </div>
                                                </td>
                                                <td class="py-2 px-3 border">
                                                    <div class="text-xs">
                                                        <div>🏦 Deposit: ${formatCurrency(t.lease?.securityDeposit)}</div>
                                                        <div>📊 Balance: ${formatCurrency(t.financial?.currentBalance || 0)}</div>
                                                        <div>💰 Last Paid: ${formatCurrency(t.paymentHistory?.totalPaid || 0)}</div>
                                                    </div>
                                                </td>
                                                <td class="py-2 px-3 border">
                                                    <span class="inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusBadge(t.status || t.lease?.status)}">
                                                        ${getStatusIcon(t.status || t.lease?.status)} ${(t.status || t.lease?.status || 'N/A').toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Detailed Tenant Information -->
                        <div class="page-break">
                            <h2 class="text-lg font-bold text-gray-800 mb-3 pb-2 border-b">Detailed Tenant Information</h2>
                            ${tenants.map((t, index) => generateSingleTenantHTML(t)).join('')}
                        </div>
                    `}

                    <!-- Footer -->
                    <div class="mt-8 pt-8 border-t text-center text-gray-500 text-xs">
                        <p>Generated by Property Management System</p>
                        <p class="mt-1">© ${currentYear} - Confidential Document</p>
                        <p class="mt-1">Report generated on ${currentDate}</p>
                    </div>
                </div>

                <script>
                    // Auto print and close
                    setTimeout(() => {
                        window.print();
                        setTimeout(() => {
                            window.close();
                        }, 1000);
                    }, 500);
                </script>
            </body>
            </html>
        `;
    };

    const generateSimplePDF = () => {
        const currentDate = getSimpleDate();
        const reportId = reportIdRef.current;

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${isSingleTenant ? 'Tenant Information' : 'Tenant List'} - ${currentDate}</title>
                <style>
                    @media print {
                        body { margin: 0; padding: 0; }
                        @page { margin: 15px; }
                        .page-break { page-break-after: always; }
                    }
                    body { 
                        font-family: Arial, sans-serif;
                        font-size: 11px;
                    }
                    .header { 
                        background: #4f46e5; 
                        color: white; 
                        padding: 15px; 
                        text-align: center;
                        margin-bottom: 15px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                        font-size: 10px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f3f4f6;
                        font-weight: bold;
                    }
                    tr:nth-child(even) {
                        background-color: #f9fafb;
                    }
                    .status-active { color: #059669; font-weight: bold; }
                    .status-pending { color: #d97706; font-weight: bold; }
                    .status-inactive { color: #dc2626; font-weight: bold; }
                    .footer {
                        margin-top: 20px;
                        padding-top: 15px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                        color: #6b7280;
                        font-size: 10px;
                    }
                    .summary {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        padding: 10px;
                        margin-bottom: 15px;
                        border-radius: 4px;
                    }
                    .summary-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 10px;
                        margin-bottom: 15px;
                    }
                    .stat-box {
                        background: white;
                        border: 1px solid #e5e7eb;
                        padding: 8px;
                        border-radius: 4px;
                        text-align: center;
                    }
                    .stat-value {
                        font-size: 14px;
                        font-weight: bold;
                        margin-bottom: 2px;
                    }
                    .stat-label {
                        font-size: 9px;
                        color: #6b7280;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 style="margin: 0; font-size: 18px;">${isSingleTenant ? 'Tenant Information' : 'Tenant Report'}</h1>
                    <p style="margin: 5px 0 0 0; font-size: 11px;">
                        Generated on ${currentDate} | Total: ${tenants.length} tenant${tenants.length !== 1 ? 's' : ''}
                    </p>
                </div>
                
                <!-- Summary Stats -->
                <div class="summary-grid">
                    <div class="stat-box">
                        <div class="stat-value">${tenants.filter(t => t.status === 'active' || t.lease?.status === 'active').length}</div>
                        <div class="stat-label">Active</div>
                    </div>
                    
                    <div class="stat-box">
                        <div class="stat-value">${formatCurrency(tenants.reduce((sum, t) => sum + (t.lease?.monthlyRent || 0), 0))}</div>
                        <div class="stat-label">Monthly Rent</div>
                    </div>
                    
                    <div class="stat-box">
                        <div class="stat-value">${tenants.filter(t => t.unit).length}</div>
                        <div class="stat-label">Units Occupied</div>
                    </div>
                    
                    <div class="stat-box">
                        <div class="stat-value">${formatCurrency(tenants.reduce((sum, t) => sum + (t.financial?.currentBalance || 0), 0))}</div>
                        <div class="stat-label">Total Balance</div>
                    </div>
                </div>
                
                <!-- Tenant Table -->
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Property/Unit</th>
                            <th>Monthly Rent</th>
                            <th>Lease Start</th>
                            <th>Lease End</th>
                            <th>Status</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tenants.map(t => `
                            <tr>
                                <td><strong>${t.personalInfo?.fullName || 'N/A'}</strong></td>
                                <td>${t.personalInfo?.phone || 'N/A'}</td>
                                <td>${getPropertyName(t)}${t.unit ? ' - Unit ' + t.unit : ''}</td>
                                <td><strong>${formatCurrency(t.lease?.monthlyRent)}</strong></td>
                                <td>${formatDate(t.lease?.startDate)}</td>
                                <td>${formatDate(t.lease?.endDate)}</td>
                                <td class="status-${(t.status || t.lease?.status || '').toLowerCase()}">
                                    ${(t.status || t.lease?.status || 'N/A').toUpperCase()}
                                </td>
                                <td>${formatCurrency(t.financial?.currentBalance || 0)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <!-- Financial Summary -->
                <div class="summary">
                    <h3 style="margin: 0 0 8px 0; font-size: 12px;">Financial Summary</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 10px;">
                        <div>
                            <strong>Total Monthly Revenue:</strong> ${formatCurrency(tenants.reduce((sum, t) => sum + (t.lease?.monthlyRent || 0), 0))}
                        </div>
                        <div>
                            <strong>Total Deposits:</strong> ${formatCurrency(tenants.reduce((sum, t) => sum + (t.lease?.securityDeposit || 0), 0))}
                        </div>
                        <div>
                            <strong>Outstanding Balance:</strong> ${formatCurrency(tenants.reduce((sum, t) => sum + (t.financial?.currentBalance || 0), 0))}
                        </div>
                        <div>
                            <strong>Last Month Payments:</strong> ${formatCurrency(tenants.reduce((sum, t) => sum + (t.paymentHistory?.totalPaid || 0), 0))}
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Property Management System | Report ID: ${reportId}</p>
                    <p>Generated on ${currentDate}</p>
                    <p>This document contains confidential information</p>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 1000);
                    }
                </script>
            </body>
            </html>
        `;
    };

    // Download CSV directly
    const downloadAsCSV = () => {
        if (!mounted) return;
        
        try {
            // Prepare CSV headers
            const headers = [
                'ID',
                'Full Name',
                'Email', 
                'Phone',
                'Property ID',
                'Unit',
                'Monthly Rent',
                'Security Deposit',
                'Pet Deposit',
                'Lease Start Date',
                'Lease End Date',
                'Lease Duration (months)',
                'Status',
                'Current Balance',
                'Total Paid',
                'Last Payment Date',
                'Next Payment Date',
                'Employment Status',
                'Monthly Income',
                'Credit Score',
                'Emergency Contact Name',
                'Emergency Contact Phone',
                'Notes',
                'Created Date',
                'Updated Date'
            ];

            // Prepare data rows
            const csvRows = tenants.map(t => [
                t._id || '',
                `"${t.personalInfo?.fullName || ''}"`,
                `"${t.personalInfo?.email || ''}"`,
                `"${t.personalInfo?.phone || ''}"`,
                t.propertyId || '',
                `"${t.unit || ''}"`,
                t.lease?.monthlyRent || 0,
                t.lease?.securityDeposit || 0,
                t.lease?.petDeposit || 0,
                t.lease?.startDate ? new Date(t.lease.startDate).toISOString().split('T')[0] : '',
                t.lease?.endDate ? new Date(t.lease.endDate).toISOString().split('T')[0] : '',
                t.lease?.durationMonths || calculateLeaseDuration(t.lease?.startDate, t.lease?.endDate).replace(' months', '').replace(' month', ''),
                t.status || t.lease?.status || '',
                t.financial?.currentBalance || 0,
                t.paymentHistory?.totalPaid || 0,
                t.paymentHistory?.lastPaymentDate ? new Date(t.paymentHistory.lastPaymentDate).toISOString().split('T')[0] : '',
                t.paymentHistory?.nextPaymentDate ? new Date(t.paymentHistory.nextPaymentDate).toISOString().split('T')[0] : '',
                t.employment?.occupation || '',
                t.employment?.monthlyIncome || 0,
                t.financial?.creditScore || '',
                `"${t.emergencyContact?.name || ''}"`,
                `"${t.emergencyContact?.phone || ''}"`,
                `"${t.notes || ''}"`,
                t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '',
                t.updatedAt ? new Date(t.updatedAt).toISOString().split('T')[0] : ''
            ]);

            // Combine headers and rows
            const csvContent = [
                headers.join(','),
                ...csvRows.map(row => row.join(','))
            ].join('\n');

            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `tenant_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success(`CSV downloaded with ${tenants.length} tenant${tenants.length !== 1 ? 's' : ''}`);
        } catch (error) {
            console.error('CSV download error:', error);
            toast.error('Failed to download CSV');
        }
    };

    if (!tenants || tenants.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No tenant available for PDF generation</p>
            </div>
        );
    }

    // Show loading state until component is mounted
    if (!mounted) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 mb-6 animate-slideDown">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {isSingleTenant ? 'Export Tenant Profile' : 'Export Tenant Data'}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {isSingleTenant ? 
                            `Download profile for ${tenants[0]?.personalInfo?.fullName || 'tenant'}` :
                            `Download information for ${tenants.length} tenant${tenants.length !== 1 ? 's' : ''}`
                        }
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {tenants.length} tenant{tenants.length !== 1 ? 's' : ''}
                    </span>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* PDF Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedType === 'detailed' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setSelectedType('detailed')}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${selectedType === 'detailed' ? 'bg-blue-100' : 'bg-blue-50'}`}>
                            <FileText className={`w-5 h-5 ${selectedType === 'detailed' ? 'text-blue-600' : 'text-blue-400'}`} />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">Detailed PDF</h4>
                            <p className="text-sm text-gray-500">Complete report with all details</p>
                        </div>
                    </div>
                    {selectedType === 'detailed' && (
                        <div className="text-xs text-blue-600 mt-2">
                            • Personal information<br/>
                            • Employment & income<br/>
                            • Lease details<br/>
                            • Payment history<br/>
                            • Emergency contacts
                        </div>
                    )}
                </div>

                <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedType === 'simple' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setSelectedType('simple')}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${selectedType === 'simple' ? 'bg-green-100' : 'bg-green-50'}`}>
                            <FileText className={`w-5 h-5 ${selectedType === 'simple' ? 'text-green-600' : 'text-green-400'}`} />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">Simple PDF</h4>
                            <p className="text-sm text-gray-500">Minimal overview for quick reference</p>
                        </div>
                    </div>
                    {selectedType === 'simple' && (
                        <div className="text-xs text-green-600 mt-2">
                            • Basic tenant information<br/>
                            • Lease dates & rent<br/>
                            • Status & balance<br/>
                            • Financial summary<br/>
                            • Quick print format
                        </div>
                    )}
                </div>

                <div 
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 cursor-pointer transition-all"
                    onClick={downloadAsCSV}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">CSV Export</h4>
                            <p className="text-sm text-gray-500">Spreadsheet format for data analysis</p>
                        </div>
                    </div>
                    <div className="text-xs text-purple-600 mt-2">
                        • Import into Excel/Sheets<br/>
                        • Data analysis ready<br/>
                        • All fields included<br/>
                        • Machine readable format
                    </div>
                </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Select format and click Generate PDF</span>
                    </div>
                    {selectedType === 'detailed' && (
                        <div className="text-xs text-blue-600 mt-1">
                            {isSingleTenant ? 'The detailed PDF includes comprehensive tenant information.' : 'The detailed PDF includes comprehensive tenant information across multiple pages.'}
                        </div>
                    )}
                    {selectedType === 'simple' && (
                        <div className="text-xs text-green-600 mt-1">
                            The simple PDF is optimized for quick printing and basic reference.
                        </div>
                    )}
                </div>
                
                <div className="flex gap-3">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={generatePDF}
                        disabled={generating || !mounted}
                        className={`px-4 py-2 text-white rounded-lg font-medium flex items-center gap-2 transition-colors ${
                            selectedType === 'detailed' 
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Generate {selectedType === 'detailed' ? 'Detailed' : 'Simple'} PDF
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Quick Preview */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Preview {isSingleTenant ? '' : '(First tenant)'}:</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {tenants[0] && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {tenants[0].personalInfo?.fullName || 'Unnamed Tenant'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        ID: {tenants[0]._id?.substring(0, 8)} • Created: {formatDate(tenants[0].createdAt)}
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(tenants[0].status || tenants[0].lease?.status)}`}>
                                    {(tenants[0].status || tenants[0].lease?.status || 'N/A').toUpperCase()}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <div className="font-medium">Contact</div>
                                    <div>📱 {tenants[0].personalInfo?.phone || 'No phone'}</div>
                                    <div>📧 {tenants[0].personalInfo?.email || 'No email'}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Lease</div>
                                    <div>💰 {formatCurrency(tenants[0].lease?.monthlyRent)}/mo</div>
                                    <div>📅 {formatDate(tenants[0].lease?.startDate)} - {formatDate(tenants[0].lease?.endDate)}</div>
                                </div>
                            </div>
                            
                            {tenants[0].paymentHistory && (
                                <div className="text-xs">
                                    <div className="font-medium">Payments</div>
                                    <div>Last: {formatDate(tenants[0].paymentHistory.lastPaymentDate)} - {formatCurrency(tenants[0].paymentHistory.totalPaid)}</div>
                                    <div>Next: {formatDate(tenants[0].paymentHistory.nextPaymentDate)}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// // app/dashboard/tenants/components/TenantPDFGenerator.jsx
// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { Download, Loader2, FileText, Calendar, Phone, Mail, Home, DollarSign, User, Building, MapPin, CheckCircle, Clock, AlertCircle, CreditCard, Shield, Briefcase, Car, Dog, Users as UsersIcon, File, CreditCard as Card, History, AlertTriangle, TrendingUp, TrendingDown, Percent, Banknote, Receipt } from 'lucide-react';
// import toast from 'react-hot-toast';

// export default function TenantPDFGenerator({ tenant, pdfType = 'detailed', onClose }) {
//     console.log(tenant);
//     const [generating, setGenerating] = useState(false);
//     const [selectedType, setSelectedType] = useState(pdfType);
//     const [mounted, setMounted] = useState(false);
//     const reportIdRef = useRef(`PMS-${Math.random().toString(36).substr(2, 8).toUpperCase()}`);

//     useEffect(() => {
//         setMounted(true);
//     }, []);

//     // Use a stable date format that doesn't change
//     const getCurrentDate = () => {
//         if (!mounted) return '';
//         const now = new Date();
//         return now.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric',
//             weekday: 'long'
//         });
//     };

//     const getSimpleDate = () => {
//         if (!mounted) return '';
//         const now = new Date();
//         return now.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     };

//     const formatDate = (dateString) => {
//         if (!dateString || !mounted) return 'N/A';
//         try {
//             const date = new Date(dateString);
//             return date.toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'short',
//                 day: 'numeric'
//             });
//         } catch (error) {
//             return 'N/A';
//         }
//     };

//     const formatCurrency = (amount) => {
//         if (amount === undefined || amount === null || !mounted) return '$0.00';
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD'
//         }).format(amount);
//     };

//     const getStatusBadge = (status) => {
//         if (!status) return 'bg-gray-100 text-gray-800 border border-gray-200';
//         switch (status.toLowerCase()) {
//             case 'active':
//                 return 'bg-green-100 text-green-800 border border-green-200';
//             case 'pending':
//                 return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
//             case 'inactive':
//             case 'expired':
//                 return 'bg-red-100 text-red-800 border border-red-200';
//             default:
//                 return 'bg-gray-100 text-gray-800 border border-gray-200';
//         }
//     };

//     const getStatusIcon = (status) => {
//         if (!status) return null;
//         switch (status.toLowerCase()) {
//             case 'active':
//                 return '✅';
//             case 'pending':
//                 return '⏳';
//             case 'inactive':
//             case 'expired':
//                 return '❌';
//             default:
//                 return 'ℹ️';
//         }
//     };

//     const getPaymentStatusBadge = (status) => {
//         if (!status) return 'bg-gray-100 text-gray-800';
//         switch (status.toLowerCase()) {
//             case 'paid':
//                 return 'bg-green-100 text-green-800';
//             case 'pending':
//                 return 'bg-yellow-100 text-yellow-800';
//             case 'late':
//                 return 'bg-red-100 text-red-800';
//             case 'partial':
//                 return 'bg-blue-100 text-blue-800';
//             default:
//                 return 'bg-gray-100 text-gray-800';
//         }
//     };

//     // Helper to get property name
//     const getPropertyName = (tenant) => {
//         if (!tenant.propertyId) return 'Not Assigned';
//         if (typeof tenant.propertyId === 'object') {
//             return tenant.propertyId.name || 'N/A';
//         }
//         return 'Property ' + tenant.propertyId.substring(0, 8);
//     };

//     // Calculate lease duration
//     const calculateLeaseDuration = (startDate, endDate) => {
//         if (!startDate || !endDate) return 'N/A';
//         try {
//             const start = new Date(startDate);
//             const end = new Date(endDate);
//             const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
//             return `${months} month${months !== 1 ? 's' : ''}`;
//         } catch (error) {
//             return 'N/A';
//         }
//     };

//     // Calculate days until end
//     const calculateDaysUntilEnd = (endDate) => {
//         if (!endDate || !mounted) return null;
//         try {
//             const end = new Date(endDate);
//             const today = new Date();
//             const diffTime = end - today;
//             return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//         } catch (error) {
//             return null;
//         }
//     };

//     // Generate stats cards HTML
//     const generateStatsCards = () => {
//         const activeCount = tenant.filter(t => t.status === 'active' || t.lease?.status === 'active').length;
//         const pendingCount = tenant.filter(t => t.status === 'pending' || t.lease?.status === 'pending').length;
//         const totalRent = tenant.reduce((sum, t) => sum + (t.lease?.monthlyRent || 0), 0);
//         const propertyCount = new Set(tenant.map(t => t.propertyId).filter(Boolean)).size;

//         return `
//             <div class="stats-card bg-green-50 border border-green-200">
//                 <div class="flex items-center gap-2 mb-1">
//                     <div class="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
//                         <span style="color: #059669;">✓</span>
//                     </div>
//                     <span class="text-xs font-semibold text-green-800">Active</span>
//                 </div>
//                 <div class="text-lg font-bold text-green-900">${activeCount}</div>
//             </div>
            
//             <div class="stats-card bg-yellow-50 border border-yellow-200">
//                 <div class="flex items-center gap-2 mb-1">
//                     <div class="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
//                         <span style="color: #d97706;">⏳</span>
//                     </div>
//                     <span class="text-xs font-semibold text-yellow-800">Pending</span>
//                 </div>
//                 <div class="text-lg font-bold text-yellow-900">${pendingCount}</div>
//             </div>
            
//             <div class="stats-card bg-blue-50 border border-blue-200">
//                 <div class="flex items-center gap-2 mb-1">
//                     <div class="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
//                         <span style="color: #3b82f6;">💰</span>
//                     </div>
//                     <span class="text-xs font-semibold text-blue-800">Monthly Rent</span>
//                 </div>
//                 <div class="text-lg font-bold text-blue-900">${formatCurrency(totalRent)}</div>
//             </div>
            
//             <div class="stats-card bg-purple-50 border border-purple-200">
//                 <div class="flex items-center gap-2 mb-1">
//                     <div class="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
//                         <span style="color: #8b5cf6;">🏠</span>
//                     </div>
//                     <span class="text-xs font-semibold text-purple-800">Properties</span>
//                 </div>
//                 <div class="text-lg font-bold text-purple-900">${propertyCount}</div>
//             </div>
//         `;
//     };

//     // Generate PDF based on type
//     const generatePDF = () => {
//         if (!mounted) return;
        
//         setGenerating(true);
        
//         try {
//             // Create a new window for printing
//             const printWindow = window.open('', '_blank');
//             if (!printWindow) {
//                 toast.error('Please allow popups to generate PDF');
//                 setGenerating(false);
//                 return;
//             }

//             let htmlContent = '';
            
//             if (selectedType === 'detailed') {
//                 htmlContent = generateDetailedPDF();
//             } else {
//                 htmlContent = generateSimplePDF();
//             }

//             // Write content to new window
//             printWindow.document.write(htmlContent);
//             printWindow.document.close();

//             toast.success(`${selectedType === 'detailed' ? 'Detailed' : 'Simple'} PDF generated successfully`);
//         } catch (error) {
//             console.error('PDF generation error:', error);
//             toast.error('Failed to generate PDF');
//         } finally {
//             setGenerating(false);
//         }
//     };

//     const generateDetailedPDF = () => {
//         const currentDate = getCurrentDate();
//         const reportId = reportIdRef.current;
//         const currentYear = new Date().getFullYear();

//         return `
//             <!DOCTYPE html>
//             <html lang="en">
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <title>Tenant Report - ${currentDate}</title>
//                 <script src="https://cdn.tailwindcss.com"></script>
//                 <style>
//                     @media print {
//                         body {
//                             margin: 0;
//                             padding: 20px;
//                             -webkit-print-color-adjust: exact;
//                             print-color-adjust: exact;
//                         }
//                         @page {
//                             margin: 20px;
//                             size: letter;
//                         }
//                         .page-break {
//                             page-break-after: always;
//                         }
//                         .no-break {
//                             page-break-inside: avoid;
//                         }
//                     }
//                     body {
//                         font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//                         font-size: 12px;
//                     }
//                     .header-gradient {
//                         background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//                     }
//                     .stats-card {
//                         border-radius: 8px;
//                         padding: 16px;
//                         margin-bottom: 8px;
//                     }
//                     table {
//                         font-size: 11px;
//                     }
//                     th, td {
//                         padding: 8px 12px;
//                     }
//                     h1 { font-size: 24px; }
//                     h2 { font-size: 18px; }
//                     h3 { font-size: 16px; }
//                     h4 { font-size: 14px; }
//                 </style>
//             </head>
//             <body class="bg-gray-50">
//                 <div class="max-w-4xl mx-auto p-6 bg-white shadow-lg">
//                     <!-- Header -->
//                     <div class="header-gradient text-white p-5 rounded-lg mb-6">
//                         <div class="flex justify-between items-start">
//                             <div>
//                                 <h1 class="text-2xl font-bold mb-1">Tenant Report</h1>
//                                 <p class="text-blue-100 text-sm">Generated on ${currentDate}</p>
//                                 <p class="text-blue-100 text-sm">Total Tenant: ${tenant.length}</p>
//                                 <p class="text-blue-100 text-sm mt-1">Report ID: ${reportId}</p>
//                             </div>
//                             <div class="bg-white/20 p-3 rounded-lg">
//                                 <div class="text-3xl font-bold">${tenant.length}</div>
//                                 <div class="text-sm opacity-90">Tenant</div>
//                             </div>
//                         </div>
//                     </div>

//                     <!-- Summary Stats -->
//                     <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
//                         ${generateStatsCards()}
//                     </div>

//                     <!-- Executive Summary -->
//                     <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                         <h2 class="text-lg font-bold text-blue-900 mb-2">Executive Summary</h2>
//                         <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <p class="text-sm text-blue-800"><strong>Total Monthly Revenue:</strong> ${formatCurrency(tenant.reduce((sum, t) => sum + (t.lease?.monthlyRent || 0), 0))}</p>
//                                 <p class="text-sm text-blue-800"><strong>Total Security Deposits:</strong> ${formatCurrency(tenant.reduce((sum, t) => sum + (t.lease?.securityDeposit || 0), 0))}</p>
//                                 <p class="text-sm text-blue-800"><strong>Average Rent:</strong> ${formatCurrency(tenant.reduce((sum, t) => sum + (t.lease?.monthlyRent || 0), 0) / (tenant.length || 1))}</p>
//                             </div>
//                             <div>
//                                 <p class="text-sm text-blue-800"><strong>Properties Occupied:</strong> ${new Set(tenant.map(t => t.propertyId).filter(Boolean)).size}</p>
//                                 <p class="text-sm text-blue-800"><strong>Units Occupied:</strong> ${tenant.filter(t => t.unit).length}</p>
//                             </div>
//                         </div>
//                     </div>

//                     <!-- Tenant Table -->
//                     <div class="mb-6 page-break">
//                         <h2 class="text-lg font-bold text-gray-800 mb-3 pb-2 border-b">Tenant Overview</h2>
//                         <div class="overflow-x-auto">
//                             <table class="w-full border-collapse">
//                                 <thead>
//                                     <tr class="bg-gray-50">
//                                         <th class="py-2 px-3 text-left text-xs font-semibold text-gray-700 border">Tenant</th>
//                                         <th class="py-2 px-3 text-left text-xs font-semibold text-gray-700 border">Contact</th>
//                                         <th class="py-2 px-3 text-left text-xs font-semibold text-gray-700 border">Property/Unit</th>
//                                         <th class="py-2 px-3 text-left text-xs font-semibold text-gray-700 border">Lease Details</th>
//                                         <th class="py-2 px-3 text-left text-xs font-semibold text-gray-700 border">Financial</th>
//                                         <th class="py-2 px-3 text-left text-xs font-semibold text-gray-700 border">Status</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     ${tenant.map((tenant, index) => `
//                                         <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} no-break">
//                                             <td class="py-2 px-3 border">
//                                                 <div class="font-medium text-gray-900">${tenant.personalInfo?.fullName || 'N/A'}</div>
//                                                 <div class="text-xs text-gray-500">ID: ${tenant._id?.substring(0, 8) || 'N/A'}</div>
//                                             </td>
//                                             <td class="py-2 px-3 border">
//                                                 <div class="text-xs">
//                                                     <div>📧 ${tenant.personalInfo?.email || 'No email'}</div>
//                                                     <div>📱 ${tenant.personalInfo?.phone || 'No phone'}</div>
//                                                 </div>
//                                             </td>
//                                             <td class="py-2 px-3 border">
//                                                 <div class="font-medium">${getPropertyName(tenant)}</div>
//                                                 <div class="text-xs text-gray-500">${tenant.unit ? 'Unit ' + tenant.unit : 'No unit'}</div>
//                                             </td>
//                                             <td class="py-2 px-3 border">
//                                                 <div class="text-xs">
//                                                     <div>💰 ${formatCurrency(tenant.lease?.monthlyRent)}/mo</div>
//                                                     <div>📅 ${formatDate(tenant.lease?.startDate)} - ${formatDate(tenant.lease?.endDate)}</div>
//                                                     <div>⏳ ${calculateLeaseDuration(tenant.lease?.startDate, tenant.lease?.endDate)}</div>
//                                                 </div>
//                                             </td>
//                                             <td class="py-2 px-3 border">
//                                                 <div class="text-xs">
//                                                     <div>🏦 Deposit: ${formatCurrency(tenant.lease?.securityDeposit)}</div>
//                                                     <div>📊 Balance: ${formatCurrency(tenant.financial?.currentBalance || 0)}</div>
//                                                     <div>💰 Last Paid: ${formatCurrency(tenant.paymentHistory?.totalPaid || 0)}</div>
//                                                 </div>
//                                             </td>
//                                             <td class="py-2 px-3 border">
//                                                 <span class="inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusBadge(tenant.status || tenant.lease?.status)}">
//                                                     ${getStatusIcon(tenant.status || tenant.lease?.status)} ${(tenant.status || tenant.lease?.status || 'N/A').toUpperCase()}
//                                                 </span>
//                                             </td>
//                                         </tr>
//                                     `).join('')}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>

//                     <!-- Detailed Tenant Information -->
//                     <div class="page-break">
//                         <h2 class="text-lg font-bold text-gray-800 mb-3 pb-2 border-b">Detailed Tenant Information</h2>
//                         ${tenant.map((tenant, index) => `
//                             <div class="mb-5 p-4 border rounded-lg bg-gray-50 no-break">
//                                 <div class="flex justify-between items-start mb-3">
//                                     <div>
//                                         <h3 class="text-md font-bold text-gray-900">${tenant.personalInfo?.fullName || 'Tenant'}</h3>
//                                         <div class="flex flex-wrap gap-2 mt-1">
//                                             <span class="text-xs text-gray-600">ID: ${tenant._id?.substring(0, 8)}</span>
//                                             <span class="text-xs text-gray-600">•</span>
//                                             <span class="text-xs text-gray-600">Unit: ${tenant.unit || 'N/A'}</span>
//                                             <span class="text-xs text-gray-600">•</span>
//                                             <span class="text-xs text-gray-600">Created: ${formatDate(tenant.createdAt)}</span>
//                                         </div>
//                                     </div>
//                                     <span class="px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(tenant.status || tenant.lease?.status)}">
//                                         ${(tenant.status || tenant.lease?.status || 'N/A').toUpperCase()}
//                                     </span>
//                                 </div>
                                
//                                 <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                     <!-- Personal Info -->
//                                     <div class="border rounded p-3 bg-white">
//                                         <h4 class="font-semibold text-gray-700 mb-2 text-sm">Personal Information</h4>
//                                         <div class="space-y-1 text-xs">
//                                             ${tenant.personalInfo?.fullName ? `<div><strong>Name:</strong> ${tenant.personalInfo.fullName}</div>` : ''}
//                                             ${tenant.personalInfo?.email ? `<div><strong>Email:</strong> ${tenant.personalInfo.email}</div>` : ''}
//                                             ${tenant.personalInfo?.phone ? `<div><strong>Phone:</strong> ${tenant.personalInfo.phone}</div>` : ''}
//                                             ${tenant.personalInfo?.dateOfBirth ? `<div><strong>DOB:</strong> ${formatDate(tenant.personalInfo.dateOfBirth)}</div>` : ''}
//                                             ${tenant.personalInfo?.gender ? `<div><strong>Gender:</strong> ${tenant.personalInfo.gender}</div>` : ''}
//                                             ${tenant.personalInfo?.nationality ? `<div><strong>Nationality:</strong> ${tenant.personalInfo.nationality}</div>` : ''}
//                                         </div>
//                                     </div>
                                    
//                                     <!-- Employment Info -->
//                                     <div class="border rounded p-3 bg-white">
//                                         <h4 class="font-semibold text-gray-700 mb-2 text-sm">Employment & Income</h4>
//                                         <div class="space-y-1 text-xs">
//                                             ${tenant.employment?.occupation ? `<div><strong>Occupation:</strong> ${tenant.employment.occupation}</div>` : ''}
//                                             ${tenant.employment?.employer ? `<div><strong>Employer:</strong> ${tenant.employment.employer}</div>` : ''}
//                                             ${tenant.employment?.monthlyIncome ? `<div><strong>Monthly Income:</strong> ${formatCurrency(tenant.employment.monthlyIncome)}</div>` : ''}
//                                             ${tenant.employment?.annualIncome ? `<div><strong>Annual Income:</strong> ${formatCurrency(tenant.employment.annualIncome)}</div>` : ''}
//                                             ${tenant.financial?.creditScore ? `<div><strong>Credit Score:</strong> ${tenant.financial.creditScore}</div>` : ''}
//                                         </div>
//                                     </div>
                                    
//                                     <!-- Lease & Financial -->
//                                     <div class="border rounded p-3 bg-white">
//                                         <h4 class="font-semibold text-gray-700 mb-2 text-sm">Lease & Financial</h4>
//                                         <div class="space-y-1 text-xs">
//                                             ${tenant.lease?.monthlyRent ? `<div><strong>Monthly Rent:</strong> ${formatCurrency(tenant.lease.monthlyRent)}</div>` : ''}
//                                             ${tenant.lease?.securityDeposit ? `<div><strong>Security Deposit:</strong> ${formatCurrency(tenant.lease.securityDeposit)}</div>` : ''}
//                                             ${tenant.lease?.petDeposit ? `<div><strong>Pet Deposit:</strong> ${formatCurrency(tenant.lease.petDeposit)}</div>` : ''}
//                                             <div><strong>Lease Term:</strong> ${formatDate(tenant.lease?.startDate)} to ${formatDate(tenant.lease?.endDate)}</div>
//                                             ${tenant.lease?.dueDay ? `<div><strong>Rent Due Day:</strong> ${tenant.lease.dueDay} of month</div>` : ''}
//                                             ${tenant.lease?.lateFee ? `<div><strong>Late Fee:</strong> ${formatCurrency(tenant.lease.lateFee)}</div>` : ''}
//                                             ${tenant.lease?.gracePeriod ? `<div><strong>Grace Period:</strong> ${tenant.lease.gracePeriod} days</div>` : ''}
//                                         </div>
//                                     </div>
//                                 </div>
                                
//                                 <!-- Payment History -->
//                                 ${tenant.paymentHistory || (tenant.payments && tenant.payments.length > 0) ? `
//                                     <div class="mt-4 pt-4 border-t">
//                                         <h4 class="font-semibold text-gray-700 mb-2 text-sm">Payment History</h4>
//                                         <div class="space-y-2 text-xs">
//                                             ${tenant.paymentHistory?.lastPaymentDate ? `
//                                                 <div class="flex justify-between">
//                                                     <span>Last Payment:</span>
//                                                     <span class="font-medium">${formatDate(tenant.paymentHistory.lastPaymentDate)} - ${formatCurrency(tenant.paymentHistory.totalPaid || 0)}</span>
//                                                 </div>
//                                             ` : ''}
//                                             ${tenant.paymentHistory?.nextPaymentDate ? `
//                                                 <div class="flex justify-between">
//                                                     <span>Next Payment Due:</span>
//                                                     <span class="font-medium">${formatDate(tenant.paymentHistory.nextPaymentDate)}</span>
//                                                 </div>
//                                             ` : ''}
//                                             ${tenant.financial?.currentBalance ? `
//                                                 <div class="flex justify-between">
//                                                     <span>Current Balance:</span>
//                                                     <span class="font-medium ${tenant.financial.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}">
//                                                         ${formatCurrency(tenant.financial.currentBalance)}
//                                                     </span>
//                                                 </div>
//                                             ` : ''}
//                                         </div>
//                                     </div>
//                                 ` : ''}
                                
//                                 <!-- Notes -->
//                                 ${tenant.notes ? `
//                                     <div class="mt-4 pt-4 border-t">
//                                         <h4 class="font-semibold text-gray-700 mb-2 text-sm">Notes</h4>
//                                         <p class="text-xs text-gray-600 bg-gray-50 p-2 rounded">${tenant.notes}</p>
//                                     </div>
//                                 ` : ''}
//                             </div>
//                         `).join('')}
//                     </div>

//                     <!-- Footer -->
//                     <div class="mt-8 pt-8 border-t text-center text-gray-500 text-xs">
//                         <p>Generated by Property Management System</p>
//                         <p class="mt-1">© ${currentYear} - Confidential Document</p>
//                         <p class="mt-1">Report generated on ${currentDate}</p>
//                     </div>
//                 </div>

//                 <script>
//                     // Auto print and close
//                     setTimeout(() => {
//                         window.print();
//                         setTimeout(() => {
//                             window.close();
//                         }, 1000);
//                     }, 500);
//                 </script>
//             </body>
//             </html>
//         `;
//     };

//     const generateSimplePDF = () => {
//         const currentDate = getSimpleDate();
//         const reportId = reportIdRef.current;

//         return `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <title>Tenant List - ${currentDate}</title>
//                 <style>
//                     @media print {
//                         body { margin: 0; padding: 0; }
//                         @page { margin: 15px; }
//                         .page-break { page-break-after: always; }
//                     }
//                     body { 
//                         font-family: Arial, sans-serif;
//                         font-size: 11px;
//                     }
//                     .header { 
//                         background: #4f46e5; 
//                         color: white; 
//                         padding: 15px; 
//                         text-align: center;
//                         margin-bottom: 15px;
//                     }
//                     table {
//                         width: 100%;
//                         border-collapse: collapse;
//                         margin: 15px 0;
//                         font-size: 10px;
//                     }
//                     th, td {
//                         border: 1px solid #ddd;
//                         padding: 8px;
//                         text-align: left;
//                     }
//                     th {
//                         background-color: #f3f4f6;
//                         font-weight: bold;
//                     }
//                     tr:nth-child(even) {
//                         background-color: #f9fafb;
//                     }
//                     .status-active { color: #059669; font-weight: bold; }
//                     .status-pending { color: #d97706; font-weight: bold; }
//                     .status-inactive { color: #dc2626; font-weight: bold; }
//                     .footer {
//                         margin-top: 20px;
//                         padding-top: 15px;
//                         border-top: 1px solid #ddd;
//                         text-align: center;
//                         color: #6b7280;
//                         font-size: 10px;
//                     }
//                     .summary {
//                         background: #f8fafc;
//                         border: 1px solid #e2e8f0;
//                         padding: 10px;
//                         margin-bottom: 15px;
//                         border-radius: 4px;
//                     }
//                     .summary-grid {
//                         display: grid;
//                         grid-template-columns: repeat(4, 1fr);
//                         gap: 10px;
//                         margin-bottom: 15px;
//                     }
//                     .stat-box {
//                         background: white;
//                         border: 1px solid #e5e7eb;
//                         padding: 8px;
//                         border-radius: 4px;
//                         text-align: center;
//                     }
//                     .stat-value {
//                         font-size: 14px;
//                         font-weight: bold;
//                         margin-bottom: 2px;
//                     }
//                     .stat-label {
//                         font-size: 9px;
//                         color: #6b7280;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="header">
//                     <h1 style="margin: 0; font-size: 18px;">Tenant Report</h1>
//                     <p style="margin: 5px 0 0 0; font-size: 11px;">
//                         Generated on ${currentDate} | Total: ${tenant.length} tenant
//                     </p>
//                 </div>
                
//                 <!-- Summary Stats -->
//                 <div class="summary-grid">
//                     <div class="stat-box">
//                         <div class="stat-value">${tenant.filter(t => t.status === 'active' || t.lease?.status === 'active').length}</div>
//                         <div class="stat-label">Active</div>
//                     </div>
                    
//                     <div class="stat-box">
//                         <div class="stat-value">${formatCurrency(tenant.reduce((sum, t) => sum + (t.lease?.monthlyRent || 0), 0))}</div>
//                         <div class="stat-label">Monthly Rent</div>
//                     </div>
                    
//                     <div class="stat-box">
//                         <div class="stat-value">${tenant.filter(t => t.unit).length}</div>
//                         <div class="stat-label">Units Occupied</div>
//                     </div>
                    
//                     <div class="stat-box">
//                         <div class="stat-value">${formatCurrency(tenant.reduce((sum, t) => sum + (t.financial?.currentBalance || 0), 0))}</div>
//                         <div class="stat-label">Total Balance</div>
//                     </div>
//                 </div>
                
//                 <!-- Tenant Table -->
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>Name</th>
//                             <th>Phone</th>
//                             <th>Property/Unit</th>
//                             <th>Monthly Rent</th>
//                             <th>Lease Start</th>
//                             <th>Lease End</th>
//                             <th>Status</th>
//                             <th>Balance</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         ${tenant.map(tenant => `
//                             <tr>
//                                 <td><strong>${tenant.personalInfo?.fullName || 'N/A'}</strong></td>
//                                 <td>${tenant.personalInfo?.phone || 'N/A'}</td>
//                                 <td>${getPropertyName(tenant)}${tenant.unit ? ' - Unit ' + tenant.unit : ''}</td>
//                                 <td><strong>${formatCurrency(tenant.lease?.monthlyRent)}</strong></td>
//                                 <td>${formatDate(tenant.lease?.startDate)}</td>
//                                 <td>${formatDate(tenant.lease?.endDate)}</td>
//                                 <td class="status-${(tenant.status || tenant.lease?.status || '').toLowerCase()}">
//                                     ${(tenant.status || tenant.lease?.status || 'N/A').toUpperCase()}
//                                 </td>
//                                 <td>${formatCurrency(tenant.financial?.currentBalance || 0)}</td>
//                             </tr>
//                         `).join('')}
//                     </tbody>
//                 </table>
                
//                 <!-- Financial Summary -->
//                 <div class="summary">
//                     <h3 style="margin: 0 0 8px 0; font-size: 12px;">Financial Summary</h3>
//                     <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 10px;">
//                         <div>
//                             <strong>Total Monthly Revenue:</strong> ${formatCurrency(tenant.reduce((sum, t) => sum + (t.lease?.monthlyRent || 0), 0))}
//                         </div>
//                         <div>
//                             <strong>Total Deposits:</strong> ${formatCurrency(tenant.reduce((sum, t) => sum + (t.lease?.securityDeposit || 0), 0))}
//                         </div>
//                         <div>
//                             <strong>Outstanding Balance:</strong> ${formatCurrency(tenant.reduce((sum, t) => sum + (t.financial?.currentBalance || 0), 0))}
//                         </div>
//                         <div>
//                             <strong>Last Month Payments:</strong> ${formatCurrency(tenant.reduce((sum, t) => sum + (t.paymentHistory?.totalPaid || 0), 0))}
//                         </div>
//                     </div>
//                 </div>
                
//                 <div class="footer">
//                     <p>Property Management System | Report ID: ${reportId}</p>
//                     <p>Generated on ${currentDate}</p>
//                     <p>This document contains confidential information</p>
//                 </div>
                
//                 <script>
//                     window.onload = function() {
//                         window.print();
//                         setTimeout(() => window.close(), 1000);
//                     }
//                 </script>
//             </body>
//             </html>
//         `;
//     };

//     // Download CSV directly
//     const downloadAsCSV = () => {
//         if (!mounted) return;
        
//         try {
//             // Prepare CSV headers
//             const headers = [
//                 'ID',
//                 'Full Name',
//                 'Email', 
//                 'Phone',
//                 'Property ID',
//                 'Unit',
//                 'Monthly Rent',
//                 'Security Deposit',
//                 'Pet Deposit',
//                 'Lease Start Date',
//                 'Lease End Date',
//                 'Lease Duration (months)',
//                 'Status',
//                 'Current Balance',
//                 'Total Paid',
//                 'Last Payment Date',
//                 'Next Payment Date',
//                 'Employment Status',
//                 'Monthly Income',
//                 'Credit Score',
//                 'Emergency Contact Name',
//                 'Emergency Contact Phone',
//                 'Notes',
//                 'Created Date',
//                 'Updated Date'
//             ];

//             // Prepare data rows
//             const csvRows = tenant.map(tenant => [
//                 tenant._id || '',
//                 `"${tenant.personalInfo?.fullName || ''}"`,
//                 `"${tenant.personalInfo?.email || ''}"`,
//                 `"${tenant.personalInfo?.phone || ''}"`,
//                 tenant.propertyId || '',
//                 `"${tenant.unit || ''}"`,
//                 tenant.lease?.monthlyRent || 0,
//                 tenant.lease?.securityDeposit || 0,
//                 tenant.lease?.petDeposit || 0,
//                 tenant.lease?.startDate ? new Date(tenant.lease.startDate).toISOString().split('T')[0] : '',
//                 tenant.lease?.endDate ? new Date(tenant.lease.endDate).toISOString().split('T')[0] : '',
//                 tenant.lease?.durationMonths || calculateLeaseDuration(tenant.lease?.startDate, tenant.lease?.endDate).replace(' months', '').replace(' month', ''),
//                 tenant.status || tenant.lease?.status || '',
//                 tenant.financial?.currentBalance || 0,
//                 tenant.paymentHistory?.totalPaid || 0,
//                 tenant.paymentHistory?.lastPaymentDate ? new Date(tenant.paymentHistory.lastPaymentDate).toISOString().split('T')[0] : '',
//                 tenant.paymentHistory?.nextPaymentDate ? new Date(tenant.paymentHistory.nextPaymentDate).toISOString().split('T')[0] : '',
//                 tenant.employment?.occupation || '',
//                 tenant.employment?.monthlyIncome || 0,
//                 tenant.financial?.creditScore || '',
//                 `"${tenant.emergencyContact?.name || ''}"`,
//                 `"${tenant.emergencyContact?.phone || ''}"`,
//                 `"${tenant.notes || ''}"`,
//                 tenant.createdAt ? new Date(tenant.createdAt).toISOString().split('T')[0] : '',
//                 tenant.updatedAt ? new Date(tenant.updatedAt).toISOString().split('T')[0] : ''
//             ]);

//             // Combine headers and rows
//             const csvContent = [
//                 headers.join(','),
//                 ...csvRows.map(row => row.join(','))
//             ].join('\n');

//             // Create download link
//             const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//             const url = URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = url;
//             link.setAttribute('download', `tenant_export_${new Date().toISOString().split('T')[0]}.csv`);
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
            
//             toast.success(`CSV downloaded with ${tenant.length} tenant(s)`);
//         } catch (error) {
//             console.error('CSV download error:', error);
//             toast.error('Failed to download CSV');
//         }
//     };

//     if (!tenant || tenant.length === 0) {
//         return (
//             <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
//                 <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-600">No tenant available for PDF generation</p>
//             </div>
//         );
//     }

//     // Show loading state until component is mounted
//     if (!mounted) {
//         return (
//             <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 mb-6">
//                 <div className="flex items-center justify-center py-8">
//                     <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 mb-6 animate-slideDown">
//             <div className="flex items-center justify-between mb-6">
//                 <div>
//                     <h3 className="text-lg font-semibold text-gray-900">Export Tenant Data</h3>
//                     <p className="text-sm text-gray-600">
//                         Download information for {tenant.length} tenant{tenant.length !== 1 ? 's' : ''}
//                     </p>
//                 </div>
//                 <div className="flex items-center gap-3">
//                     <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
//                         {tenant.length} tenant{tenant.length !== 1 ? 's' : ''}
//                     </span>
//                     {onClose && (
//                         <button
//                             onClick={onClose}
//                             className="text-gray-400 hover:text-gray-600 transition-colors"
//                             aria-label="Close"
//                         >
//                             ✕
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {/* PDF Type Selection */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                 <div 
//                     className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedType === 'detailed' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
//                     onClick={() => setSelectedType('detailed')}
//                 >
//                     <div className="flex items-center gap-3 mb-2">
//                         <div className={`p-2 rounded-lg ${selectedType === 'detailed' ? 'bg-blue-100' : 'bg-blue-50'}`}>
//                             <FileText className={`w-5 h-5 ${selectedType === 'detailed' ? 'text-blue-600' : 'text-blue-400'}`} />
//                         </div>
//                         <div>
//                             <h4 className="font-medium text-gray-900">Detailed PDF</h4>
//                             <p className="text-sm text-gray-500">Complete report with all details</p>
//                         </div>
//                     </div>
//                     {selectedType === 'detailed' && (
//                         <div className="text-xs text-blue-600 mt-2">
//                             • Personal information<br/>
//                             • Employment & income<br/>
//                             • Lease details<br/>
//                             • Payment history<br/>
//                             • Emergency contacts
//                         </div>
//                     )}
//                 </div>

//                 <div 
//                     className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedType === 'simple' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
//                     onClick={() => setSelectedType('simple')}
//                 >
//                     <div className="flex items-center gap-3 mb-2">
//                         <div className={`p-2 rounded-lg ${selectedType === 'simple' ? 'bg-green-100' : 'bg-green-50'}`}>
//                             <FileText className={`w-5 h-5 ${selectedType === 'simple' ? 'text-green-600' : 'text-green-400'}`} />
//                         </div>
//                         <div>
//                             <h4 className="font-medium text-gray-900">Simple PDF</h4>
//                             <p className="text-sm text-gray-500">Minimal overview for quick reference</p>
//                         </div>
//                     </div>
//                     {selectedType === 'simple' && (
//                         <div className="text-xs text-green-600 mt-2">
//                             • Basic tenant information<br/>
//                             • Lease dates & rent<br/>
//                             • Status & balance<br/>
//                             • Financial summary<br/>
//                             • Quick print format
//                         </div>
//                     )}
//                 </div>

//                 <div 
//                     className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 cursor-pointer transition-all"
//                     onClick={downloadAsCSV}
//                 >
//                     <div className="flex items-center gap-3 mb-2">
//                         <div className="p-2 bg-purple-50 rounded-lg">
//                             <FileText className="w-5 h-5 text-purple-600" />
//                         </div>
//                         <div>
//                             <h4 className="font-medium text-gray-900">CSV Export</h4>
//                             <p className="text-sm text-gray-500">Spreadsheet format for data analysis</p>
//                         </div>
//                     </div>
//                     <div className="text-xs text-purple-600 mt-2">
//                         • Import into Excel/Sheets<br/>
//                         • Data analysis ready<br/>
//                         • All fields included<br/>
//                         • Machine readable format
//                     </div>
//                 </div>
//             </div>

//             {/* Generate Button */}
//             <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
//                 <div className="text-sm text-gray-600">
//                     <div className="flex items-center gap-2">
//                         <FileText className="w-4 h-4" />
//                         <span>Select format and click Generate PDF</span>
//                     </div>
//                     {selectedType === 'detailed' && (
//                         <div className="text-xs text-blue-600 mt-1">
//                             The detailed PDF includes comprehensive tenant information across multiple pages.
//                         </div>
//                     )}
//                     {selectedType === 'simple' && (
//                         <div className="text-xs text-green-600 mt-1">
//                             The simple PDF is optimized for quick printing and basic reference.
//                         </div>
//                     )}
//                 </div>
                
//                 <div className="flex gap-3">
//                     {onClose && (
//                         <button
//                             onClick={onClose}
//                             className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
//                         >
//                             Cancel
//                         </button>
//                     )}
//                     <button
//                         onClick={generatePDF}
//                         disabled={generating || !mounted}
//                         className={`px-4 py-2 text-white rounded-lg font-medium flex items-center gap-2 transition-colors ${
//                             selectedType === 'detailed' 
//                                 ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
//                                 : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
//                         } disabled:opacity-50 disabled:cursor-not-allowed`}
//                     >
//                         {generating ? (
//                             <>
//                                 <Loader2 className="w-4 h-4 animate-spin" />
//                                 Generating...
//                             </>
//                         ) : (
//                             <>
//                                 <Download className="w-4 h-4" />
//                                 Generate {selectedType === 'detailed' ? 'Detailed' : 'Simple'} PDF
//                             </>
//                         )}
//                     </button>
//                 </div>
//             </div>

//             {/* Quick Preview */}
//             <div className="mt-6 pt-6 border-t border-gray-200">
//                 <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Preview (First tenant):</h4>
//                 <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//                     {tenant[0] && (
//                         <div className="space-y-3">
//                             <div className="flex justify-between items-start">
//                                 <div>
//                                     <div className="font-medium text-gray-900">
//                                         {tenant[0].personalInfo?.fullName || 'Unnamed Tenant'}
//                                     </div>
//                                     <div className="text-xs text-gray-500">
//                                         ID: {tenant[0]._id?.substring(0, 8)} • Created: {formatDate(tenant[0].createdAt)}
//                                     </div>
//                                 </div>
//                                 <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(tenant[0].status || tenant[0].lease?.status)}`}>
//                                     {(tenant[0].status || tenant[0].lease?.status || 'N/A').toUpperCase()}
//                                 </span>
//                             </div>
                            
//                             <div className="grid grid-cols-2 gap-4 text-xs">
//                                 <div>
//                                     <div className="font-medium">Contact</div>
//                                     <div>📱 {tenant[0].personalInfo?.phone || 'No phone'}</div>
//                                     <div>📧 {tenant[0].personalInfo?.email || 'No email'}</div>
//                                 </div>
//                                 <div>
//                                     <div className="font-medium">Lease</div>
//                                     <div>💰 {formatCurrency(tenant[0].lease?.monthlyRent)}/mo</div>
//                                     <div>📅 {formatDate(tenant[0].lease?.startDate)} - {formatDate(tenant[0].lease?.endDate)}</div>
//                                 </div>
//                             </div>
                            
//                             {tenant[0].paymentHistory && (
//                                 <div className="text-xs">
//                                     <div className="font-medium">Payments</div>
//                                     <div>Last: {formatDate(tenant[0].paymentHistory.lastPaymentDate)} - {formatCurrency(tenant[0].paymentHistory.totalPaid)}</div>
//                                     <div>Next: {formatDate(tenant[0].paymentHistory.nextPaymentDate)}</div>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// // app/dashboard/tenant/components/TenantPDFGenerator.jsx
// 'use client';

// import { useState } from 'react';
// import { Download, Loader2, FileText, Calendar, Phone, Mail, Home, DollarSign, User, Building, MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react';
// import toast from 'react-hot-toast';

// export default function TenantPDFGenerator({ tenant }) {
//     const [generating, setGenerating] = useState(false);
//     console.log({ tenants });

//     const formatDate = (dateString) => {
//         if (!dateString) return 'N/A';
//         return new Date(dateString).toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//         });
//     };

//     const formatCurrency = (amount) => {
//         if (!amount) return '$0.00';
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD'
//         }).format(amount);
//     };

//     const getStatusBadge = (status) => {
//         switch (status?.toLowerCase()) {
//             case 'active':
//                 return 'bg-green-100 text-green-800 border border-green-200';
//             case 'pending':
//                 return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
//             case 'inactive':
//                 return 'bg-red-100 text-red-800 border border-red-200';
//             default:
//                 return 'bg-gray-100 text-gray-800 border border-gray-200';
//         }
//     };

//     const getStatusIcon = (status) => {
//         switch (status?.toLowerCase()) {
//             case 'active':
//                 return <CheckCircle className="w-4 h-4 text-green-600" />;
//             case 'pending':
//                 return <Clock className="w-4 h-4 text-yellow-600" />;
//             case 'inactive':
//                 return <AlertCircle className="w-4 h-4 text-red-600" />;
//             default:
//                 return null;
//         }
//     };

//     const generatePDF = () => {
//         setGenerating(true);
        
//         try {
//             // Create a new window for printing
//             const printWindow = window.open('', '_blank');
//             if (!printWindow) {
//                 toast.error('Please allow popups to generate PDF');
//                 setGenerating(false);
//                 return;
//             }

//             // Get current date for report
//             const currentDate = new Date().toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric',
//                 weekday: 'long'
//             });

//             // Build HTML content for PDF
//             const htmlContent = `
//                 <!DOCTYPE html>
//                 <html lang="en">
//                 <head>
//                     <meta charset="UTF-8">
//                     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                     <title>Tenants Report - ${currentDate}</title>
//                     <script src="https://cdn.tailwindcss.com"></script>
//                     <style>
//                         @media print {
//                             body {
//                                 margin: 0;
//                                 padding: 20px;
//                                 -webkit-print-color-adjust: exact;
//                                 print-color-adjust: exact;
//                             }
//                             @page {
//                                 margin: 20px;
//                                 size: letter;
//                             }
//                             .page-break {
//                                 page-break-after: always;
//                             }
//                             .no-break {
//                                 page-break-inside: avoid;
//                             }
//                         }
//                         body {
//                             font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//                         }
//                         .header-gradient {
//                             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//                         }
//                     </style>
//                 </head>
//                 <body class="bg-gray-50">
//                     <div class="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
//                         <!-- Header -->
//                         <div class="header-gradient text-white p-6 rounded-lg mb-8">
//                             <div class="flex justify-between items-start">
//                                 <div>
//                                     <h1 class="text-3xl font-bold mb-2">Tenants Report</h1>
//                                     <p class="text-blue-100">Generated on ${currentDate}</p>
//                                     <p class="text-blue-100 mt-1">Total Tenants: ${tenants.length}</p>
//                                 </div>
//                                 <div class="bg-white/20 p-3 rounded-lg">
//                                     <div class="text-4xl font-bold">${tenants.length}</div>
//                                     <div class="text-sm opacity-90">Tenants</div>
//                                 </div>
//                             </div>
//                         </div>

//                         <!-- Summary Stats -->
//                         <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//                             <div class="bg-green-50 border border-green-200 rounded-lg p-4">
//                                 <div class="flex items-center gap-2 mb-2">
//                                     <CheckCircle class="w-5 h-5 text-green-600" />
//                                     <span class="font-semibold text-green-800">Active</span>
//                                 </div>
//                                 <div class="text-2xl font-bold text-green-900">
//                                     ${tenants.filter(t => t.lease?.status?.toLowerCase() === 'active').length}
//                                 </div>
//                             </div>
                            
//                             <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                                 <div class="flex items-center gap-2 mb-2">
//                                     <Clock class="w-5 h-5 text-yellow-600" />
//                                     <span class="font-semibold text-yellow-800">Pending</span>
//                                 </div>
//                                 <div class="text-2xl font-bold text-yellow-900">
//                                     ${tenants.filter(t => t.lease?.status?.toLowerCase() === 'pending').length}
//                                 </div>
//                             </div>
                            
//                             <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                                 <div class="flex items-center gap-2 mb-2">
//                                     <DollarSign class="w-5 h-5 text-blue-600" />
//                                     <span class="font-semibold text-blue-800">Total Rent</span>
//                                 </div>
//                                 <div class="text-2xl font-bold text-blue-900">
//                                     ${formatCurrency(tenants.reduce((sum, t) => sum + (t.lease?.monthlyRent || 0), 0))}
//                                 </div>
//                             </div>
                            
//                             <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
//                                 <div class="flex items-center gap-2 mb-2">
//                                     <Home class="w-5 h-5 text-purple-600" />
//                                     <span class="font-semibold text-purple-800">Properties</span>
//                                 </div>
//                                 <div class="text-2xl font-bold text-purple-900">
//                                     ${new Set(tenants.map(t => t.property?._id).filter(Boolean)).size}
//                                 </div>
//                             </div>
//                         </div>

//                         <!-- Tenants Table -->
//                         <div class="mb-8">
//                             <h2 class="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Tenants List</h2>
//                             <div class="overflow-x-auto">
//                                 <table class="w-full border-collapse">
//                                     <thead>
//                                         <tr class="bg-gray-50">
//                                             <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700 border">Name</th>
//                                             <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700 border">Contact</th>
//                                             <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700 border">Property</th>
//                                             <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700 border">Rent</th>
//                                             <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700 border">Status</th>
//                                             <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700 border">Move-in Date</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         ${tenants.map((tenant, index) => `
//                                             <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors no-break">
//                                                 <td class="py-3 px-4 border">
//                                                     <div class="font-medium text-gray-900">${tenant.personalInfo?.fullName || 'N/A'}</div>
//                                                     <div class="text-sm text-gray-500">${tenant.unit || 'No Unit'}</div>
//                                                 </td>
//                                                 <td class="py-3 px-4 border">
//                                                     <div class="flex flex-col gap-1">
//                                                         <div class="flex items-center gap-2">
//                                                             <Mail class="w-3 h-3 text-gray-400" />
//                                                             <span class="text-sm text-gray-700">${tenant.personalInfo?.email || 'N/A'}</span>
//                                                         </div>
//                                                         <div class="flex items-center gap-2">
//                                                             <Phone class="w-3 h-3 text-gray-400" />
//                                                             <span class="text-sm text-gray-700">${tenant.personalInfo?.phone || 'N/A'}</span>
//                                                         </div>
//                                                     </div>
//                                                 </td>
//                                                 <td class="py-3 px-4 border">
//                                                     <div class="flex flex-col gap-1">
//                                                         <div class="flex items-center gap-2">
//                                                             <Building class="w-3 h-3 text-gray-400" />
//                                                             <span class="font-medium">${tenant.property?.name || 'N/A'}</span>
//                                                         </div>
//                                                         ${tenant.property?.address ? `
//                                                             <div class="flex items-center gap-2 text-sm text-gray-600">
//                                                                 <MapPin class="w-3 h-3" />
//                                                                 <span>${tenant.property.address.street || ''}, ${tenant.property.address.city || ''}</span>
//                                                             </div>
//                                                         ` : ''}
//                                                     </div>
//                                                 </td>
//                                                 <td class="py-3 px-4 border">
//                                                     <div class="font-bold text-gray-900">
//                                                         ${formatCurrency(tenant.lease?.monthlyRent)}
//                                                     </div>
//                                                     <div class="text-xs text-gray-500">Monthly</div>
//                                                 </td>
//                                                 <td class="py-3 px-4 border">
//                                                     <div class="flex items-center gap-2">
//                                                         ${getStatusIcon(tenant.lease?.status)}
//                                                         <span class="px-2 py-1 text-xs rounded-full ${getStatusBadge(tenant.lease?.status)}">
//                                                             ${tenant.lease?.status?.toUpperCase() || 'N/A'}
//                                                         </span>
//                                                     </div>
//                                                 </td>
//                                                 <td class="py-3 px-4 border">
//                                                     <div class="flex items-center gap-2">
//                                                         <Calendar class="w-3 h-3 text-gray-400" />
//                                                         <span class="text-gray-700">${formatDate(tenant.lease?.startDate)}</span>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         `).join('')}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>

//                         <!-- Detailed Information -->
//                         <div class="mb-8 page-break">
//                             <h2 class="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Tenant Details</h2>
//                             ${tenants.map((tenant, index) => `
//                                 <div class="mb-6 p-4 border rounded-lg bg-gray-50 no-break">
//                                     <div class="flex justify-between items-start mb-4">
//                                         <div>
//                                             <h3 class="text-lg font-bold text-gray-900">${tenant.personalInfo?.fullName || 'Tenant'}</h3>
//                                             <div class="flex items-center gap-4 mt-1">
//                                                 <span class="flex items-center gap-1 text-sm text-gray-600">
//                                                     <User class="w-3 h-3" />
//                                                     ID: ${tenant._id?.substring(0, 8) || 'N/A'}
//                                                 </span>
//                                                 <span class="flex items-center gap-1 text-sm text-gray-600">
//                                                     <Home class="w-3 h-3" />
//                                                     Unit: ${tenant.unit || 'N/A'}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                         <div class="px-3 py-1 rounded-full ${getStatusBadge(tenant.lease?.status)}">
//                                             ${tenant.lease?.status?.toUpperCase() || 'N/A'}
//                                         </div>
//                                     </div>
                                    
//                                     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                         <div>
//                                             <h4 class="font-semibold text-gray-700 mb-2">Personal Information</h4>
//                                             <div class="space-y-2 text-sm">
//                                                 <div class="flex items-center gap-2">
//                                                     <Mail class="w-4 h-4 text-gray-400" />
//                                                     <span>${tenant.personalInfo?.email || 'N/A'}</span>
//                                                 </div>
//                                                 <div class="flex items-center gap-2">
//                                                     <Phone class="w-4 h-4 text-gray-400" />
//                                                     <span>${tenant.personalInfo?.phone || 'N/A'}</span>
//                                                 </div>
//                                                 <div class="flex items-center gap-2">
//                                                     <Calendar class="w-4 h-4 text-gray-400" />
//                                                     <span>DOB: ${formatDate(tenant.personalInfo?.dateOfBirth)}</span>
//                                                 </div>
//                                             </div>
//                                         </div>
                                        
//                                         <div>
//                                             <h4 class="font-semibold text-gray-700 mb-2">Lease Information</h4>
//                                             <div class="space-y-2 text-sm">
//                                                 <div class="flex items-center gap-2">
//                                                     <DollarSign class="w-4 h-4 text-gray-400" />
//                                                     <span>Rent: ${formatCurrency(tenant.lease?.monthlyRent)}</span>
//                                                 </div>
//                                                 <div class="flex items-center gap-2">
//                                                     <Calendar class="w-4 h-4 text-gray-400" />
//                                                     <span>From: ${formatDate(tenant.lease?.startDate)}</span>
//                                                 </div>
//                                                 <div class="flex items-center gap-2">
//                                                     <Calendar class="w-4 h-4 text-gray-400" />
//                                                     <span>To: ${formatDate(tenant.lease?.endDate)}</span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
                                    
//                                     ${tenant.personalInfo?.emergencyContact ? `
//                                         <div class="mt-4 pt-4 border-t">
//                                             <h4 class="font-semibold text-gray-700 mb-2">Emergency Contact</h4>
//                                             <div class="flex items-center gap-2">
//                                                 <User class="w-4 h-4 text-gray-400" />
//                                                 <span class="text-sm">${tenant.personalInfo.emergencyContact.name} - ${tenant.personalInfo.emergencyContact.phone}</span>
//                                             </div>
//                                         </div>
//                                     ` : ''}
                                    
//                                     ${tenant.notes ? `
//                                         <div class="mt-4 pt-4 border-t">
//                                             <h4 class="font-semibold text-gray-700 mb-2">Notes</h4>
//                                             <p class="text-sm text-gray-600">${tenant.notes}</p>
//                                         </div>
//                                     ` : ''}
//                                 </div>
//                             `).join('')}
//                         </div>

//                         <!-- Footer -->
//                         <div class="mt-8 pt-8 border-t text-center text-gray-500 text-sm">
//                             <p>Generated by Property Management System</p>
//                             <p class="mt-1">Report ID: PMS-${Date.now().toString().slice(-8)}</p>
//                             <p class="mt-1">© ${new Date().getFullYear()} - Confidential Document</p>
//                         </div>
//                     </div>

//                     <script>
//                         // Auto print and close
//                         setTimeout(() => {
//                             window.print();
//                             setTimeout(() => {
//                                 window.close();
//                             }, 1000);
//                         }, 500);
//                     </script>
//                 </body>
//                 </html>
//             `;

//             // Write content to new window
//             printWindow.document.write(htmlContent);
//             printWindow.document.close();

//             toast.success('PDF generated successfully');
//         } catch (error) {
//             console.error('PDF generation error:', error);
//             toast.error('Failed to generate PDF');
//         } finally {
//             setGenerating(false);
//         }
//     };

//     const generateSimplePDF = () => {
//         if (generating) return;
        
//         setGenerating(true);
        
//         try {
//             const printWindow = window.open('', '_blank');
//             if (!printWindow) {
//                 toast.error('Please allow popups to generate PDF');
//                 setGenerating(false);
//                 return;
//             }

//             const currentDate = new Date().toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric'
//             });

//             const htmlContent = `
//                 <!DOCTYPE html>
//                 <html>
//                 <head>
//                     <title>Tenants List - ${currentDate}</title>
//                     <style>
//                         @media print {
//                             body { margin: 0; padding: 0; }
//                             @page { margin: 20px; }
//                         }
//                         body { font-family: Arial, sans-serif; }
//                         .header { 
//                             background: #4f46e5; 
//                             color: white; 
//                             padding: 20px; 
//                             text-align: center;
//                             margin-bottom: 20px;
//                         }
//                         table {
//                             width: 100%;
//                             border-collapse: collapse;
//                             margin: 20px 0;
//                         }
//                         th, td {
//                             border: 1px solid #ddd;
//                             padding: 12px;
//                             text-align: left;
//                         }
//                         th {
//                             background-color: #f3f4f6;
//                             font-weight: bold;
//                         }
//                         tr:nth-child(even) {
//                             background-color: #f9fafb;
//                         }
//                         .status-active { color: #059669; }
//                         .status-pending { color: #d97706; }
//                         .status-inactive { color: #dc2626; }
//                         .footer {
//                             margin-top: 30px;
//                             padding-top: 20px;
//                             border-top: 2px solid #ddd;
//                             text-align: center;
//                             color: #6b7280;
//                             font-size: 12px;
//                         }
//                     </style>
//                 </head>
//                 <body>
//                     <div class="header">
//                         <h1>Tenants Report</h1>
//                         <p>Generated on ${currentDate} | Total: ${tenants.length} tenants</p>
//                     </div>
                    
//                     <table>
//                         <thead>
//                             <tr>
//                                 <th>Name</th>
//                                 <th>Email</th>
//                                 <th>Phone</th>
//                                 <th>Property</th>
//                                 <th>Unit</th>
//                                 <th>Monthly Rent</th>
//                                 <th>Status</th>
//                                 <th>Move-in Date</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             ${tenants.map(tenant => `
//                                 <tr>
//                                     <td><strong>${tenant.personalInfo?.fullName || 'N/A'}</strong></td>
//                                     <td>${tenant.personalInfo?.email || 'N/A'}</td>
//                                     <td>${tenant.personalInfo?.phone || 'N/A'}</td>
//                                     <td>${tenant.property?.name || 'N/A'}</td>
//                                     <td>${tenant.unit || 'N/A'}</td>
//                                     <td><strong>${formatCurrency(tenant.lease?.monthlyRent)}</strong></td>
//                                     <td class="status-${tenant.lease?.status?.toLowerCase() || 'unknown'}">
//                                         ${tenant.lease?.status?.toUpperCase() || 'N/A'}
//                                     </td>
//                                     <td>${formatDate(tenant.lease?.startDate)}</td>
//                                 </tr>
//                             `).join('')}
//                         </tbody>
//                     </table>
                    
//                     <div class="footer">
//                         <p>Property Management System | Report ID: ${Date.now().toString().slice(-8)}</p>
//                         <p>This document contains confidential information</p>
//                     </div>
                    
//                     <script>
//                         window.onload = function() {
//                             window.print();
//                             setTimeout(() => window.close(), 1000);
//                         }
//                     </script>
//                 </body>
//                 </html>
//             `;

//             printWindow.document.write(htmlContent);
//             printWindow.document.close();
//             toast.success('PDF generated successfully');
//         } catch (error) {
//             console.error('PDF generation error:', error);
//             toast.error('Failed to generate PDF');
//         } finally {
//             setGenerating(false);
//         }
//     };

//     const downloadAsCSV = () => {
//         try {
//             // Prepare CSV headers
//             const headers = [
//                 'Name',
//                 'Email', 
//                 'Phone',
//                 'Property',
//                 'Unit',
//                 'Monthly Rent',
//                 'Status',
//                 'Move-in Date',
//                 'Lease End Date',
//                 'Emergency Contact',
//                 'Emergency Phone',
//                 'Notes'
//             ];

//             // Prepare data rows
//             const csvRows = tenants.map(tenant => [
//                 `"${tenant.personalInfo?.fullName || ''}"`,
//                 `"${tenant.personalInfo?.email || ''}"`,
//                 `"${tenant.personalInfo?.phone || ''}"`,
//                 `"${tenant.property?.name || ''}"`,
//                 `"${tenant.unit || ''}"`,
//                 formatCurrency(tenant.lease?.monthlyRent),
//                 tenant.lease?.status || '',
//                 formatDate(tenant.lease?.startDate),
//                 formatDate(tenant.lease?.endDate),
//                 `"${tenant.personalInfo?.emergencyContact?.name || ''}"`,
//                 `"${tenant.personalInfo?.emergencyContact?.phone || ''}"`,
//                 `"${tenant.notes || ''}"`
//             ]);

//             // Combine headers and rows
//             const csvContent = [
//                 headers.join(','),
//                 ...csvRows.map(row => row.join(','))
//             ].join('\n');

//             // Create download link
//             const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//             const url = URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = url;
//             link.setAttribute('download', `tenants_report_${new Date().toISOString().split('T')[0]}.csv`);
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
            
//             toast.success('CSV downloaded successfully');
//         } catch (error) {
//             console.error('CSV download error:', error);
//             toast.error('Failed to download CSV');
//         }
//     };

//     if (!tenants || tenants.length === 0) {
//         return (
//             <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
//                 <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-600">No tenants available for PDF generation</p>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
//             <div className="flex items-center justify-between mb-6">
//                 <div>
//                     <h3 className="text-lg font-semibold text-gray-900">Export Tenants Data</h3>
//                     <p className="text-sm text-gray-600">
//                         Download tenant information as PDF or CSV
//                     </p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
//                         {tenants.length} tenants
//                     </span>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                 <div className="border border-gray-200 rounded-lg p-4">
//                     <div className="flex items-center gap-3 mb-2">
//                         <div className="p-2 bg-blue-50 rounded-lg">
//                             <FileText className="w-5 h-5 text-blue-600" />
//                         </div>
//                         <div>
//                             <h4 className="font-medium text-gray-900">Detailed PDF</h4>
//                             <p className="text-sm text-gray-500">With styling & details</p>
//                         </div>
//                     </div>
//                     <button
//                         onClick={generatePDF}
//                         disabled={generating}
//                         className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                     >
//                         {generating ? (
//                             <>
//                                 <Loader2 className="w-4 h-4 animate-spin" />
//                                 Generating...
//                             </>
//                         ) : (
//                             <>
//                                 <Download className="w-4 h-4" />
//                                 Download PDF
//                             </>
//                         )}
//                     </button>
//                 </div>

//                 <div className="border border-gray-200 rounded-lg p-4">
//                     <div className="flex items-center gap-3 mb-2">
//                         <div className="p-2 bg-green-50 rounded-lg">
//                             <FileText className="w-5 h-5 text-green-600" />
//                         </div>
//                         <div>
//                             <h4 className="font-medium text-gray-900">Simple PDF</h4>
//                             <p className="text-sm text-gray-500">Minimal & clean</p>
//                         </div>
//                     </div>
//                     <button
//                         onClick={generateSimplePDF}
//                         disabled={generating}
//                         className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                     >
//                         {generating ? (
//                             <>
//                                 <Loader2 className="w-4 h-4 animate-spin" />
//                                 Generating...
//                             </>
//                         ) : (
//                             <>
//                                 <Download className="w-4 h-4" />
//                                 Simple PDF
//                             </>
//                         )}
//                     </button>
//                 </div>

//                 <div className="border border-gray-200 rounded-lg p-4">
//                     <div className="flex items-center gap-3 mb-2">
//                         <div className="p-2 bg-purple-50 rounded-lg">
//                             <FileText className="w-5 h-5 text-purple-600" />
//                         </div>
//                         <div>
//                             <h4 className="font-medium text-gray-900">CSV Export</h4>
//                             <p className="text-sm text-gray-500">Spreadsheet format</p>
//                         </div>
//                     </div>
//                     <button
//                         onClick={downloadAsCSV}
//                         className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 flex items-center justify-center gap-2"
//                     >
//                         <Download className="w-4 h-4" />
//                         Download CSV
//                     </button>
//                 </div>
//             </div>

//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                 <div className="flex items-start gap-3">
//                     <div className="p-2 bg-blue-100 rounded-lg">
//                         <FileText className="w-5 h-5 text-blue-600" />
//                     </div>
//                     <div>
//                         <h4 className="font-medium text-blue-900 mb-1">How it works:</h4>
//                         <ul className="text-sm text-blue-800 space-y-1">
//                             <li>• Click "Download PDF" to generate a styled PDF document</li>
//                             <li>• PDF will open in a new window for printing or saving</li>
//                             <li>• Use "Download CSV" for spreadsheet data</li>
//                             <li>• No external libraries required - pure HTML/CSS</li>
//                         </ul>
//                     </div>
//                 </div>
//             </div>

//             {/* Preview Section */}
//             <div className="mt-8">
//                 <h4 className="text-sm font-medium text-gray-700 mb-3">Preview (First 3 tenants):</h4>
//                 <div className="border border-gray-200 rounded-lg overflow-hidden">
//                     <table className="w-full text-sm">
//                         <thead className="bg-gray-50">
//                             <tr>
//                                 <th className="py-2 px-3 text-left font-medium text-gray-700">Name</th>
//                                 <th className="py-2 px-3 text-left font-medium text-gray-700">Email</th>
//                                 <th className="py-2 px-3 text-left font-medium text-gray-700">Rent</th>
//                                 <th className="py-2 px-3 text-left font-medium text-gray-700">Status</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-200">
//                             {/* {tenants.slice(0, 3).map((tenant) => (
//                                 <tr key={tenant._id} className="hover:bg-gray-50">
//                                     <td className="py-2 px-3">
//                                         <div className="font-medium text-gray-900">
//                                             {tenant.personalInfo?.fullName}
//                                         </div>
//                                     </td>
//                                     <td className="py-2 px-3 text-gray-600">
//                                         {tenant.personalInfo?.email}
//                                     </td>
//                                     <td className="py-2 px-3 font-medium">
//                                         {formatCurrency(tenant.lease?.monthlyRent)}
//                                     </td>
//                                     <td className="py-2 px-3">
//                                         <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(tenant.lease?.status)}`}>
//                                             {tenant.lease?.status?.toUpperCase()}
//                                         </span>
//                                     </td>
//                                 </tr>
//                             ))} */}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// }