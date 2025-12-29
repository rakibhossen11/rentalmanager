'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import { 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    User, 
    Building2, 
    AlertCircle,
    CheckCircle,
    XCircle 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    
    const { register } = useAuth();
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'password') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        setPasswordStrength(strength);
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength < 50) return 'bg-red-500';
        if (passwordStrength < 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength < 50) return 'Weak';
        if (passwordStrength < 75) return 'Good';
        return 'Strong';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        // Validate password strength
        if (passwordStrength < 50) {
            setError('Please use a stronger password');
            return;
        }
        
        setLoading(true);
        
        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            companyName: formData.companyName
        });
        
        if (!result.success) {
            setError(result.error || 'Registration failed');
        }
        
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left side - Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
                            <p className="text-gray-600 mt-2">Start managing your properties in minutes</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                                <span className="text-red-700">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Company Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Name (Optional)
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Your Properties LLC"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                
                                {/* Password strength */}
                                {formData.password && (
                                    <div className="mt-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Password strength</span>
                                            <span className={`font-medium ${
                                                passwordStrength < 50 ? 'text-red-600' :
                                                passwordStrength < 75 ? 'text-yellow-600' :
                                                'text-green-600'
                                            }`}>
                                                {getPasswordStrengthText()}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                                                style={{ width: `${passwordStrength}%` }}
                                            ></div>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-600">
                                            <p className="flex items-center mb-1">
                                                {formData.password.length >= 8 ? (
                                                    <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                                                ) : (
                                                    <XCircle className="w-3 h-3 text-red-500 mr-2" />
                                                )}
                                                At least 8 characters
                                            </p>
                                            <p className="flex items-center mb-1">
                                                {/[A-Z]/.test(formData.password) ? (
                                                    <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                                                ) : (
                                                    <XCircle className="w-3 h-3 text-red-500 mr-2" />
                                                )}
                                                One uppercase letter
                                            </p>
                                            <p className="flex items-center">
                                                {/[0-9]/.test(formData.password) ? (
                                                    <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                                                ) : (
                                                    <XCircle className="w-3 h-3 text-red-500 mr-2" />
                                                )}
                                                One number
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="flex items-center">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                                    I agree to the{' '}
                                    <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                                        Terms of Service
                                    </Link>
                                    {' '}and{' '}
                                    <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating account...
                                    </span>
                                ) : 'Create account'}
                            </button>
                        </form>

                        {/* Sign in link */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link 
                                    href="/auth/login" 
                                    className="font-medium text-blue-600 hover:text-blue-800"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Right side - Benefits */}
                    <div className="flex flex-col justify-center">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6">Why join Rental Manager?</h2>
                            
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-semibold">Free 14-Day Trial</h3>
                                        <p className="text-blue-100 mt-1">No credit card required. Try all features free for 14 days.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-semibold">Save Time & Money</h3>
                                        <p className="text-blue-100 mt-1">Automate rent collection, maintenance requests, and communication.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-semibold">Powerful Analytics</h3>
                                        <p className="text-blue-100 mt-1">Track performance, occupancy rates, and financials in real-time.</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-semibold">24/7 Support</h3>
                                        <p className="text-blue-100 mt-1">Get help whenever you need it with our dedicated support team.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-white/20">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-bold text-lg">4.9</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <p className="text-sm text-blue-100 mt-1">Rated 4.9/5 by 1,000+ property managers</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}