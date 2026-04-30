import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white mt-20">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">R</span>
                            </div>
                            <span className="text-xl font-bold">Roopsome</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Your beauty, your time. Book salon appointments instantly.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link to="/" className="hover:text-white">Home</Link></li>
                            <li><Link to="/salons" className="hover:text-white">Find Salons</Link></li>
                            <li><Link to="/signup" className="hover:text-white">Sign Up</Link></li>
                            <li><Link to="/login" className="hover:text-white">Login</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-semibold mb-4">Services</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li>Haircut & Styling</li>
                            <li>Beard Grooming</li>
                            <li>Hair Coloring</li>
                            <li>Home Service</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li>📧 support@roopsome.com</li>
                            <li>📱 +91 98765 43210</li>
                            <li>📍 Patna, Bihar</li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
                    © 2024 Roopsome. All rights reserved.
                </div>
            </div>
        </footer>
    )
}