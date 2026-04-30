import { Link, useNavigate } from 'react-router-dom'

export default function Header() {
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const userType = localStorage.getItem('userType')
    const fullName = localStorage.getItem('fullName')

    const handleLogout = () => {
        localStorage.clear()
        navigate('/')
    }

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">R</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">Roopsome</span>
                </Link>

                {/* Nav Links */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link to="/salons" className="text-gray-600 hover:text-purple-600 font-medium">
                        Find Salons
                    </Link>
                    {token && userType === 'barber' && (
                        <Link to="/barber" className="text-gray-600 hover:text-purple-600 font-medium">
                            My Dashboard
                        </Link>
                    )}
                    {token && userType === 'customer' && (
                        <Link to="/dashboard" className="text-gray-600 hover:text-purple-600 font-medium">
                            My Bookings
                        </Link>
                    )}
                </nav>

                {/* Auth Buttons */}
                <div className="flex items-center gap-3">
                    {token ? (
                        <div className="flex items-center gap-3">
                            <span className="text-gray-700 font-medium hidden md:block">
                                👋 {fullName}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="text-purple-600 font-medium px-4 py-2 rounded-lg hover:bg-purple-50"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </header>
    )
}