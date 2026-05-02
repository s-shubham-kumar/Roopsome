import BASE_URL from '../utils/api'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from '../components/Header'

export default function CustomerDashboard() {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const fullName = localStorage.getItem('fullName')
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        try {
            const res = await axios.get('${BASE_URL}/api/v1/my-bookings', {
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
        if (!confirm('Cancel this booking?')) return
        try {
            await axios.put(`${BASE_URL}/api/v1/bookings/${bookingId}/cancel`,
                { reason: 'Customer cancelled' },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            fetchBookings()
            alert('Booking cancelled successfully!')
        } catch (err) {
            alert(err.response?.data?.error || 'Cancel failed')
        }
    }

    const statusColor = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-blue-100 text-blue-700',
        in_progress: 'bg-purple-100 text-purple-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
        rejected: 'bg-red-100 text-red-700',
    }

    const statusIcon = {
        pending: '⏳',
        confirmed: '✅',
        in_progress: '💇',
        completed: '🎉',
        cancelled: '❌',
        rejected: '🚫',
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Welcome */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl p-6 mb-8">
                    <h1 className="text-2xl font-bold">👋 Hi, {fullName}!</h1>
                    <p className="text-purple-100 mt-1">Manage all your bookings here</p>
                    <div className="flex gap-4 mt-4 flex-wrap">
                        <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                            <p className="text-xl font-bold">{bookings.length}</p>
                            <p className="text-xs text-purple-100">Total Bookings</p>
                        </div>
                        <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                            <p className="text-xl font-bold">
                                {bookings.filter(b => b.status === 'completed').length}
                            </p>
                            <p className="text-xs text-purple-100">Completed</p>
                        </div>
                        <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                            <p className="text-xl font-bold">
                                {bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length}
                            </p>
                            <p className="text-xs text-purple-100">Upcoming</p>
                        </div>
                    </div>
                </div>

                {/* Book New Button */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">My Bookings</h2>
                    <button
                        onClick={() => navigate('/salons')}
                        className="bg-purple-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-purple-700"
                    >
                        + New Booking
                    </button>
                </div>

                {/* Bookings List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl">
                        <div className="text-6xl mb-4">📅</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No bookings yet</h3>
                        <p className="text-gray-400 mb-6">Book your first salon appointment!</p>
                        <button
                            onClick={() => navigate('/salons')}
                            className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700"
                        >
                            Find Salons →
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(b => (
                            <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <div className="flex items-start justify-between flex-wrap gap-3">

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-800 text-lg">{b.service_name}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[b.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {statusIcon[b.status]} {b.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm">🏪 {b.salon_name}</p>
                                        <p className="text-gray-500 text-sm">👨‍💼 {b.staff_name}</p>
                                        <p className="text-gray-500 text-sm">
                                            📅 {b.booking_date} at {b.booking_time?.slice(0, 5)}
                                        </p>
                                        <p className="text-purple-600 font-bold mt-1">₹{b.total_amount}</p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {['pending', 'confirmed'].includes(b.status) && (
                                            <button
                                                onClick={() => handleCancel(b.id)}
                                                className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        {b.status === 'completed' && !b.customer_rating && (
                                            <button className="bg-yellow-50 text-yellow-600 border border-yellow-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-yellow-100">
                                                ⭐ Rate
                                            </button>
                                        )}
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}