'use client';

import Link from 'next/link';
import { Building2, Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        Product: [
            { name: 'Features', href: '/#features' },
            { name: 'Pricing', href: '/pricing' },
            { name: 'API', href: '/api' },
            { name: 'Status', href: '/status' },
        ],
        Company: [
            { name: 'About', href: '/about' },
            { name: 'Blog', href: '/blog' },
            { name: 'Careers', href: '/careers' },
            { name: 'Press', href: '/press' },
        ],
        Resources: [
            { name: 'Documentation', href: '/docs' },
            { name: 'Guides', href: '/guides' },
            { name: 'Support', href: '/support' },
            { name: 'Community', href: '/community' },
        ],
        Legal: [
            { name: 'Privacy', href: '/privacy' },
            { name: 'Terms', href: '/terms' },
            { name: 'Security', href: '/security' },
            { name: 'Cookies', href: '/cookies' },
        ],
    };

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Logo and description */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-2xl">RentalPro</span>
                        </div>
                        <p className="text-gray-400 mb-6 max-w-md">
                            Professional property management software that helps landlords and property managers 
                            streamline their operations, increase efficiency, and grow their business.
                        </p>
                        
                        {/* Social links */}
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Footer links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h3 className="font-semibold text-lg mb-4">{category}</h3>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-400 hover:text-white transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Contact info */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center">
                            <Mail className="w-5 h-5 text-gray-400 mr-3" />
                            <span className="text-gray-400">support@rentalpro.com</span>
                        </div>
                        <div className="flex items-center">
                            <Phone className="w-5 h-5 text-gray-400 mr-3" />
                            <span className="text-gray-400">+1 (555) 123-4567</span>
                        </div>
                        <div className="flex items-center">
                            <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                            <span className="text-gray-400">San Francisco, CA</span>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
                    <p>© {currentYear} RentalPro. All rights reserved.</p>
                    <p className="text-sm mt-2">
                        Made with ❤️ for property managers worldwide
                    </p>
                </div>
            </div>
        </footer>
    );
}