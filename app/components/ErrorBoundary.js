'use client';

import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            Something went wrong
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}