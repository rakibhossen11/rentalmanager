'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                    <Shield className="w-10 h-10 text-red-600" />
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
                
                <p className="text-gray-600 mb-8">
                    You don't have permission to access this page. 
                    This area is restricted to authorized personnel only.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Go to Homepage
                    </Link>
                    
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </Link>
                </div>
                
                <div className="mt-8 text-sm text-gray-500">
                    <p>If you believe this is an error, please contact your administrator.</p>
                    <p className="mt-2">
                        Error code: <span className="font-mono">403_FORBIDDEN</span>
                    </p>
                </div>
            </div>
        </div>
    );
}