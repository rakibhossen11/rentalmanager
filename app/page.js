'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    Check, 
    ArrowRight, 
    Star, 
    Users, 
    Building2, 
    CreditCard, 
    Shield,
    BarChart3,
    MessageSquare,
    Calendar,
    Zap,
    TrendingUp,
    Globe,
    Lock,
    Download,
    Play
} from 'lucide-react';
import { useAuth } from './components/AuthProvider';
import toast from 'react-hot-toast';

export default function HomePage() {
    const { user } = useAuth();
    const [stats, setStats] = useState([
        { value: '10,000+', label: 'Properties Managed' },
        { value: '$2.5B+', label: 'Rent Processed' },
        { value: '99.9%', label: 'Uptime' },
        { value: '4.9/5', label: 'Customer Rating' },
    ]);

    const features = [
        {
            icon: Users,
            title: 'Tenant Management',
            description: 'Manage all your tenants in one place with automated onboarding, communication, and document storage.',
            color: 'blue'
        },
        {
            icon: CreditCard,
            title: 'Rent Collection',
            description: 'Automated rent collection with multiple payment methods, late fee tracking, and payment reminders.',
            color: 'green'
        },
        {
            icon: Building2,
            title: 'Property Management',
            description: 'Track all your properties, units, and maintenance requests from a single dashboard.',
            color: 'purple'
        },
        {
            icon: BarChart3,
            title: 'Analytics & Reports',
            description: 'Powerful insights into your portfolio performance, occupancy rates, and financial health.',
            color: 'orange'
        },
        {
            icon: MessageSquare,
            title: 'Tenant Communication',
            description: 'Built-in messaging system for seamless communication with tenants and contractors.',
            color: 'pink'
        },
        {
            icon: Calendar,
            title: 'Maintenance Scheduling',
            description: 'Schedule and track maintenance requests with automated notifications and contractor management.',
            color: 'indigo'
        },
    ];

    const testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Property Manager',
            company: 'Urban Living Properties',
            content: 'RentalPro has transformed how we manage our 50+ properties. Our efficiency has increased by 40%!',
            rating: 5,
            avatar: 'SJ'
        },
        {
            name: 'Michael Chen',
            role: 'Real Estate Investor',
            company: 'Chen Investments',
            content: 'The analytics alone are worth the price. I can now make data-driven decisions about my portfolio.',
            rating: 5,
            avatar: 'MC'
        },
        {
            name: 'Jessica Williams',
            role: 'Landlord',
            company: 'Williams Family Trust',
            content: 'From rent collection to maintenance, everything is so streamlined. My tenants love the portal too!',
            rating: 5,
            avatar: 'JW'
        },
    ];

    const pricingPlans = [
        {
            name: 'Free',
            price: '$0',
            period: 'forever',
            features: [
                'Up to 10 tenants',
                '5 properties',
                'Basic tenant management',
                'Manual rent tracking',
                'Email support'
            ],
            cta: 'Get Started Free',
            popular: false
        },
        {
            name: 'Professional',
            price: '$79',
            period: 'per month',
            features: [
                'Unlimited tenants',
                'Up to 100 properties',
                'Advanced analytics',
                'Automated rent collection',
                'API access',
                'Priority support'
            ],
            cta: 'Start Free Trial',
            popular: true
        },
    ];

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20 pb-32">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
                            <Zap className="w-4 h-4 mr-2" />
                            Trusted by 1,000+ property managers
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            Streamline Your
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Rental Business
                            </span>
                        </h1>
                        
                        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
                            All-in-one property management software that helps landlords and property managers 
                            automate operations, increase efficiency, and grow their portfolio.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={user ? '/dashboard' : '/auth/register'}
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                            >
                                {user ? 'Go to Dashboard' : 'Start Free Trial'}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                            <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                                <Play className="mr-2 w-5 h-5" />
                                Watch Demo
                            </button>
                        </div>
                        
                        <p className="text-gray-500 text-sm mt-6">
                            No credit card required • 14-day free trial • Cancel anytime
                        </p>
                    </div>
                </div>
                
                {/* Stats */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-gray-600 mt-2">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need to Manage Properties
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Comprehensive tools designed specifically for property managers and landlords
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                                    <div className={`inline-flex p-3 rounded-xl bg-${feature.color}-100 mb-4`}>
                                        <Icon className={`w-6 h-6 text-${feature.color}-600`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Demo Section */}
            <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                See RentalPro in Action
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Get a complete view of your rental business from a single dashboard. 
                                Manage properties, tenants, payments, and maintenance all in one place.
                            </p>
                            
                            <div className="space-y-4">
                                {[
                                    'Real-time property performance metrics',
                                    'Automated rent collection and reminders',
                                    'Maintenance request tracking',
                                    'Document storage and e-signatures',
                                    'Financial reporting and analytics',
                                    'Tenant communication portal'
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center">
                                        <Check className="w-5 h-5 text-green-500 mr-3" />
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-8">
                                <Link
                                    href={user ? '/dashboard' : '/auth/register'}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                                >
                                    Try Dashboard Demo
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                        
                        <div className="relative">
                            {/* Dashboard mockup */}
                            <div className="bg-white rounded-2xl shadow-2xl p-4">
                                <div className="bg-gray-800 rounded-lg p-4">
                                    {/* Mock dashboard UI */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        </div>
                                        <div className="text-gray-300 text-sm">rentalpro.com/dashboard</div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        {['Active Tenants', 'Monthly Revenue', 'Properties', 'Vacancy Rate'].map((item, index) => (
                                            <div key={index} className="bg-gray-700 rounded-lg p-3">
                                                <div className="text-gray-400 text-xs mb-1">{item}</div>
                                                <div className="text-white font-bold">
                                                    {index === 0 ? '24' : index === 1 ? '$12,500' : index === 2 ? '8' : '4%'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <div className="text-gray-300 text-sm mb-2">Recent Activity</div>
                                        {['Rent Payment Received', 'New Tenant Added', 'Maintenance Request'].map((item, index) => (
                                            <div key={index} className="flex items-center py-2 border-b border-gray-600 last:border-b-0">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                <span className="text-gray-300 text-sm">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Loved by Property Managers
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            See what our customers say about managing their properties with RentalPro
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-gray-50 rounded-2xl p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                                        <div className="text-gray-600 text-sm">{testimonial.role}</div>
                                        <div className="text-gray-500 text-xs">{testimonial.company}</div>
                                    </div>
                                </div>
                                
                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                
                                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing CTA */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Transform Your Property Management?
                    </h2>
                    <p className="text-xl text-blue-100 mb-10">
                        Join thousands of property managers who trust RentalPro
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={user ? '/dashboard' : '/auth/register'}
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-all"
                        >
                            {user ? 'Go to Dashboard' : 'Start 14-Day Free Trial'}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors"
                        >
                            View Pricing Plans
                        </Link>
                    </div>
                    
                    <p className="text-blue-200 text-sm mt-6">
                        No credit card required • Cancel anytime • 24/7 support
                    </p>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-xl text-gray-600">
                            Everything you need to know about RentalPro
                        </p>
                    </div>
                    
                    <div className="space-y-6">
                        {[
                            {
                                q: 'Is there really a free trial?',
                                a: 'Yes! All paid plans include a 14-day free trial with full access to all features. No credit card required.'
                            },
                            {
                                q: 'Can I cancel anytime?',
                                a: 'Absolutely. You can cancel your subscription at any time from your account settings. No questions asked.'
                            },
                            {
                                q: 'Do you offer discounts for annual billing?',
                                a: 'Yes, annual billing saves you 20% compared to monthly billing.'
                            },
                            {
                                q: 'Is my data secure?',
                                a: 'We use bank-level encryption and security protocols to ensure your data is always safe and secure.'
                            },
                            {
                                q: 'What happens if I need help?',
                                a: 'We offer 24/7 customer support via email, chat, and phone for all paid plans. Free plan users get email support.'
                            }
                        ].map((faq, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 text-lg mb-2">{faq.q}</h3>
                                <p className="text-gray-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}