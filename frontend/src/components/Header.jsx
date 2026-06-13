import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Header() {
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const userType = localStorage.getItem('userType')
    const fullName = localStorage.getItem('fullName')
    const [menuOpen, setMenuOpen] = useState(false)

    const handleLogout = () => {
        localStorage.clear()
        navigate('/')
        setMenuOpen(false)
    }

    const dashboardLink =
        userType === 'barber' ? '/barber' :
        userType === 'salon_owner' ? '/owner' :
        userType === 'customer' ? '/dashboard' : null

    const dashboardLabel =
        userType === 'customer' ? 'My Bookings' : 'My Dashboard'

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">R</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">Roop<span className="text-purple-600">some</span></span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    <Link to="/salons"
                        className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                        Find Salons
                    </Link>
                    {token && dashboardLink && (
                        <Link to={dashboardLink}
                            className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                            {dashboardLabel}
                        </Link>
                    )}
                </nav>

                {/* Desktop Auth */}
                <div className="hidden md:flex items-center gap-2">
                    {token ? (
                        <>
                            <span className="text-sm text-gray-500 font-medium">👋 {fullName}</span>
                            <button onClick={handleLogout}
                                className="text-sm font-medium text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login"
                                className="text-sm font-medium text-gray-600 hover:text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors">
                                Login
                            </Link>
                            <Link to="/signup"
                                className="text-sm font-medium bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Right Side */}
                <div className="flex md:hidden items-center gap-2">
                    {token && (
                        <span className="text-xs text-gray-500 font-medium max-w-[80px] truncate">
                            {fullName}
                        </span>
                    )}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                        {menuOpen ? (
                            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
                    <Link to="/salons" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-purple-600 font-medium text-sm transition-colors">
                        🔍 Find Salons
                    </Link>

                    {token && dashboardLink && (
                        <Link to={dashboardLink} onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-purple-600 font-medium text-sm transition-colors">
                            📊 {dashboardLabel}
                        </Link>
                    )}

                    <div className="border-t border-gray-100 pt-2 mt-2">
                        {token ? (
                            <button onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium text-sm transition-colors">
                                🚪 Logout
                            </button>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link to="/login" onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-center px-4 py-3 rounded-xl border border-purple-200 text-purple-600 font-medium text-sm hover:bg-purple-50 transition-colors">
                                    Login
                                </Link>
                                <Link to="/signup" onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-center px-4 py-3 rounded-xl bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 transition-colors">
                                    Sign Up Free
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}