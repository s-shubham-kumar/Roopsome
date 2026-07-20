import BASE_URL from '../utils/api'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from '../components/Header'

export default function BarberDashboard() {
    const navigate = useNavigate()
    const [tab, setTab] = useState('requests')
    const [bookings, setBookings] = useState([])
    const [myQueue, setMyQueue] = useState([])
    const [loading, setLoading] = useState(true)
    const [linkStatus, setLinkStatus] = useState(null)
    const fullName = localStorage.getItem('fullName')
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        checkStatusAndFetch()
        const interval = setInterval(() => {
            fetchBookings()
            fetchMyQueue()
        }, 30000)
        return () => clearInterval(interval)
    }, [])

    const checkStatusAndFetch = async () => {
        try {
            const statusRes = await axios.get(`${BASE_URL}/api/v1/barber/status`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setLinkStatus(statusRes.data)

            if (statusRes.data.linked) {
                await Promise.all([fetchBookings(), fetchMyQueue()])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/v1/barber/bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setBookings(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchMyQueue = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/v1/barber/queue`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMyQueue(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleAction = async (bookingId, action, extra = {}) => {
        try {
            await axios.put(`${BASE_URL}/api/v1/bookings/${bookingId}/${action}`,
                extra,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            fetchBookings()
            fetchMyQueue()
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

    const markDone = async (bookingId, otpRequired) => {
        let otp = ''
        if (otpRequired) {
            otp = prompt('Customer se 4-digit completion code poochho:')
            if (!otp) return
        }
        try {
            await axios.put(`${BASE_URL}/api/v1/bookings/${bookingId}/complete`,
                { otp },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            fetchMyQueue()
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to complete')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="text-center py-32">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    // ── Not linked to any salon yet ──────────────────────────────
    if (linkStatus && !linkStatus.linked) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-md mx-auto px-4 py-16 text-center">
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <div className="text-5xl mb-4">🔗</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Abhi kisi salon se linked nahi ho</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            Aapko bookings tabhi dikhengi jab koi salon owner aapko apne staff mein add karega.
                            Apna ye phone number salon owner ko do:
                        </p>
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
                            <p className="text-xs text-purple-500 font-medium mb-1">Aapka Registered Phone Number</p>
                            <p className="text-2xl font-bold text-purple-700">{linkStatus.phone || 'Not set'}</p>
                        </div>
                        <p className="text-gray-400 text-xs">
                            Salon owner "Staff" tab mein isi number se aapko add karega, tabhi bookings yahan dikhne lagengi.
                        </p>
                        <button onClick={checkStatusAndFetch}
                            className="mt-6 bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700">
                            🔄 Refresh
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl p-5 sm:p-6 mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold">✂️ Barber Dashboard</h1>
                    <p className="text-purple-100">
                        Hi {fullName}! {linkStatus?.salon_name && `Working at ${linkStatus.salon_name}`}
                    </p>
                    <div className="flex gap-3 mt-4">
                        <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                            <p className="text-xl font-bold">{bookings.length}</p>
                            <p className="text-xs text-purple-100">Requests</p>
                        </div>
                        <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                            <p className="text-xl font-bold">{myQueue.length}</p>
                            <p className="text-xs text-purple-100">In Queue</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm w-full sm:w-fit">
                    {[['requests', '📋 Requests'], ['queue', '👤 My Queue']].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-none whitespace-nowrap ${tab === key ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                            {label}
                            {key === 'requests' && bookings.length > 0 && (
                                <span className="ml-1.5 bg-white/30 text-xs px-1.5 py-0.5 rounded-full">{bookings.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* REQUESTS TAB */}
                {tab === 'requests' && (
                    bookings.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl">
                            <div className="text-6xl mb-4">🎉</div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">No pending requests</h3>
                            <p className="text-gray-400">All caught up! New bookings will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map(b => (
                                <div key={b.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border-2 border-yellow-200">

                                    <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-800 text-lg truncate">{b.customer_name}</h3>
                                            {b.customer_phone && (
                                                <a href={`tel:${b.customer_phone}`} className="text-purple-600 text-sm font-medium hover:underline">
                                                    📱 {b.customer_phone}
                                                </a>
                                            )}
                                            <p className="text-gray-600 text-sm mt-1">💇 {b.service_name}</p>
                                            <p className="text-gray-500 text-sm">
                                                📅 {b.booking_date} at {b.booking_time?.slice(0, 5)}
                                            </p>
                                            {b.booking_type === 'home_service' && b.home_service_address && (
                                                <p className="text-gray-500 text-sm mt-1 flex items-start gap-1">
                                                    <span>🏠</span> <span>{b.home_service_address}</span>
                                                </p>
                                            )}
                                            <p className="text-purple-600 font-bold mt-1">₹{b.total_amount}</p>
                                        </div>
                                        <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium flex-shrink-0">
                                            ⏳ Awaiting Response
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
                                        <button
                                            onClick={() => handleAction(b.id, 'accept')}
                                            className="bg-green-500 text-white py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-base hover:bg-green-600 active:bg-green-700 transition-colors sm:flex-1"
                                        >
                                            ✅ Accept
                                        </button>
                                        <button
                                            onClick={() => handleDelay(b.id)}
                                            className="bg-yellow-400 text-white py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-base hover:bg-yellow-500 active:bg-yellow-600 transition-colors sm:flex-1"
                                        >
                                            ⏰ Delay
                                        </button>
                                        <button
                                            onClick={() => handleReject(b.id)}
                                            className="bg-red-500 text-white py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-base hover:bg-red-600 active:bg-red-700 transition-colors sm:flex-1"
                                        >
                                            ❌ Reject
                                        </button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* MY QUEUE TAB */}
                {tab === 'queue' && (
                    myQueue.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl">
                            <div className="text-5xl mb-3">😴</div>
                            <p className="text-gray-500">Aaj koi customer queue mein nahi hai</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myQueue.map((item, i) => (
                                <div key={item.booking_id} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${i === 0 ? 'bg-green-500' : 'bg-purple-400'}`}>
                                            {i + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-800 truncate">{item.customer_name}</p>
                                            <p className="text-gray-500 text-sm truncate">{item.service_name}</p>
                                            {item.customer_phone && (
                                                <a href={`tel:${item.customer_phone}`}
                                                    className="text-purple-600 text-xs font-medium hover:underline">
                                                    📱 {item.customer_phone}
                                                </a>
                                            )}
                                            {item.booking_type === 'home_service' && item.home_service_address && (
                                                <p className="text-gray-500 text-xs mt-0.5 flex items-start gap-1">
                                                    <span>🏠</span> <span className="truncate">{item.home_service_address}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap pl-14 sm:pl-0">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                            {item.status}
                                        </span>
                                        <button onClick={() => markDone(item.booking_id, item.otp_required)}
                                            className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600">
                                            ✓ Done
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

            </div>
        </div>
    )
}