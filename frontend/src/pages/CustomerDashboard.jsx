import BASE_URL from '../utils/api'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from '../components/Header'

export default function CustomerDashboard() {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const fullName = localStorage.getItem('fullName')
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/v1/my-bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setBookings(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Cancel this booking?')) return
        try {
            await axios.put(`${BASE_URL}/api/v1/bookings/${bookingId}/cancel`,
                { reason: 'Customer cancelled' },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            fetchBookings()
        } catch (err) {
            alert(err.response?.data?.error || 'Cancel failed')
        }
    }

    const statusConfig = {
        pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '⏳', label: 'Pending' },
        confirmed: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '✅', label: 'Confirmed' },
        in_progress: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '💇', label: 'In Progress' },
        completed: { color: 'bg-green-100 text-green-700 border-green-200', icon: '🎉', label: 'Completed' },
        cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: '❌', label: 'Cancelled' },
        rejected: { color: 'bg-red-100 text-red-700 border-red-200', icon: '🚫', label: 'Rejected' },
    }

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'upcoming', label: 'Upcoming' },
        { key: 'completed', label: 'Done' },
        { key: 'cancelled', label: 'Cancelled' },
    ]

    const filteredBookings = bookings.filter(b => {
        if (filter === 'all') return true
        if (filter === 'upcoming') return ['pending', 'confirmed', 'in_progress'].includes(b.status)
        if (filter === 'completed') return b.status === 'completed'
        if (filter === 'cancelled') return ['cancelled', 'rejected'].includes(b.status)
        return true
    })

    const stats = {
        total: bookings.length,
        completed: bookings.filter(b => b.status === 'completed').length,
        upcoming: bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length,
        totalSpent: bookings
            .filter(b => b.status === 'completed')
            .reduce((sum, b) => sum + (b.total_amount || 0), 0)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* ── Hero Banner ── */}
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white px-4 pt-6 pb-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-xl font-bold mb-0.5">👋 Hi, {fullName?.split(' ')[0]}!</h1>
                    <p className="text-purple-200 text-sm mb-5">Your beauty journey at a glance</p>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { value: stats.total, label: 'Total' },
                            { value: stats.upcoming, label: 'Upcoming' },
                            { value: stats.completed, label: 'Done' },
                            { value: `₹${stats.totalSpent}`, label: 'Spent' },
                        ].map((s, i) => (
                            <div key={i} className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                                <p className="text-lg font-bold">{s.value}</p>
                                <p className="text-xs text-purple-200">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-4">

                {/* ── Book New CTA ── */}
                <button
                    onClick={() => navigate('/salons')}
                    className="w-full bg-white border-2 border-purple-200 text-purple-700 py-3.5 rounded-2xl font-bold text-sm hover:bg-purple-50 active:bg-purple-100 transition-colors shadow-sm mb-5 flex items-center justify-center gap-2"
                >
                    ✂️ Book New Appointment
                </button>

                {/* ── Filter Tabs ── */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                    {filters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${filter === f.key
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
                                }`}
                        >
                            {f.label}
                            {f.key === 'upcoming' && stats.upcoming > 0 && (
                                <span className="ml-1.5 bg-white/30 text-xs px-1.5 py-0.5 rounded-full">
                                    {stats.upcoming}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Bookings List ── */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <div className="text-5xl mb-3">
                            {filter === 'upcoming' ? '📅' : filter === 'completed' ? '✅' : '🔍'}
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 mb-1">
                            {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
                        </h3>
                        <p className="text-gray-400 text-sm mb-5">
                            {filter === 'all' ? 'Book your first salon appointment!' : 'Nothing here yet'}
                        </p>
                        {filter === 'all' && (
                            <button
                                onClick={() => navigate('/salons')}
                                className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-700"
                            >
                                Find Salons →
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3 pb-6">
                        {filteredBookings.map(b => {
                            const sc = statusConfig[b.status] || { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: '•', label: b.status }
                            const isUpcoming = ['pending', 'confirmed'].includes(b.status)

                            return (
                                <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                                    {/* Status bar top */}
                                    {isUpcoming && (
                                        <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                                    )}

                                    <div className="p-4">
                                        {/* Top row */}
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-800 truncate">{b.service_name}</h3>
                                                <p className="text-sm text-gray-500 truncate">🏪 {b.salon_name}</p>
                                            </div>
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border flex-shrink-0 ${sc.color}`}>
                                                {sc.icon} {sc.label}
                                            </span>
                                        </div>

                                        {/* Details grid */}
                                        <div className="grid grid-cols-2 gap-y-1.5 mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-gray-400 text-xs">👨‍💼</span>
                                                <span className="text-sm text-gray-600">{b.staff_name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-gray-400 text-xs">💰</span>
                                                <span className="text-sm font-semibold text-purple-600">₹{b.total_amount}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-gray-400 text-xs">📅</span>
                                                <span className="text-sm text-gray-600">{b.booking_date}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-gray-400 text-xs">🕐</span>
                                                <span className="text-sm text-gray-600">{b.booking_time?.slice(0, 5)}</span>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        {(isUpcoming || b.status === 'completed') && (
                                            <div className="flex gap-2 pt-3 border-t border-gray-100">
                                                {isUpcoming && (
                                                    <button
                                                        onClick={() => handleCancel(b.id)}
                                                        className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-xl text-sm font-medium hover:bg-red-100 active:bg-red-200 transition-colors"
                                                    >
                                                        Cancel Booking
                                                    </button>
                                                )}
                                                {b.status === 'completed' && (
                                                    <button className="flex-1 bg-yellow-50 text-yellow-600 border border-yellow-200 py-2 rounded-xl text-sm font-medium hover:bg-yellow-100 transition-colors">
                                                        ⭐ Rate Experience
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
