import BASE_URL from '../utils/api'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from '../components/Header'

export default function BarberDashboard() {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('pending')
    const fullName = localStorage.getItem('fullName')
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        fetchBookings()
        const interval = setInterval(fetchBookings, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchBookings = async () => {
        try {
            const res = await axios.get('${BASE_URL}/api/v1/barber/bookings', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setBookings(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (bookingId, action, extra = {}) => {
        try {
            await axios.put(
                `${BASE_URL}/api/v1/bookings/${bookingId}/${action}`,
                extra,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            fetchBookings()
        } catch (err) {
            alert(err.response?.data?.error || `${action} failed`)
        }
    }

    const handleDelay = (bookingId) => {
        const mins = prompt('Delay by how many minutes? (e.g. 15, 30)')
        if (!mins) return
        const reason = prompt('Reason for delay?') || 'Running late'
        handleAction(bookingId, 'delay', { delay_minutes: parseInt(mins), reason })
    }

    const handleReject = (bookingId) => {
        const reason = prompt('Reason for rejection?') || 'Not available'
        handleAction(bookingId, 'reject', { reason })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl p-6 mb-8">
                    <h1 className="text-2xl font-bold">✂️ Barber Dashboard</h1>
                    <p className="text-purple-100">Hi {fullName}! Manage your bookings</p>
                    <div className="flex gap-4 mt-4">
                        <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                            <p className="text-xl font-bold">{bookings.length}</p>
                            <p className="text-xs text-purple-100">Pending</p>
                        </div>
                    </div>
                </div>

                {/* Bookings */}
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    📋 Pending Booking Requests
                </h2>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading bookings...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No pending requests</h3>
                        <p className="text-gray-400">All caught up! New bookings will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(b => (
                            <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm border-2 border-yellow-200">

                                {/* Booking Info */}
                                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{b.customer_name}</h3>
                                        <p className="text-gray-500 text-sm">📱 {b.phone}</p>
                                        <p className="text-gray-600 text-sm mt-1">💇 {b.service_name}</p>
                                        <p className="text-gray-500 text-sm">
                                            📅 {b.booking_date} at {b.booking_time?.slice(0, 5)}
                                        </p>
                                        <p className="text-purple-600 font-bold mt-1">₹{b.total_amount}</p>
                                    </div>
                                    <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium">
                                        ⏳ Awaiting Response
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 flex-wrap">
                                    <button
                                        onClick={() => handleAction(b.id, 'accept')}
                                        className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors"
                                    >
                                        ✅ Accept
                                    </button>
                                    <button
                                        onClick={() => handleDelay(b.id)}
                                        className="flex-1 bg-yellow-400 text-white py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors"
                                    >
                                        ⏰ Delay
                                    </button>
                                    <button
                                        onClick={() => handleReject(b.id)}
                                        className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
                                    >
                                        ❌ Reject
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}