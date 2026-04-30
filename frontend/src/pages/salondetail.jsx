import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from '../components/Header'

export default function SalonDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [salon, setSalon] = useState(null)
    const [services, setServices] = useState([])
    const [staff, setStaff] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [id])

    const fetchData = async () => {
        try {
            const [salonRes, servicesRes, staffRes] = await Promise.all([
                axios.get(`/api/v1/salons/${id}`),
                axios.get(`/api/v1/salons/${id}/services`),
                axios.get(`/api/v1/salons/${id}/staff`)
            ])
            setSalon(salonRes.data)
            setServices(servicesRes.data)
            setStaff(staffRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const openMap = () => {
        const address = encodeURIComponent(`${salon.address}, ${salon.city}`)
        window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank')
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading salon...</p>
                </div>
            </div>
        </div>
    )

    if (!salon) return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="text-center py-20">
                <p className="text-gray-500">Salon not found</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-500 text-white">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-purple-200 hover:text-white mb-4 flex items-center gap-1"
                    >
                        ← Back
                    </button>
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{salon.name}</h1>
                            <p className="text-purple-100 flex items-center gap-1">
                                📍 {salon.address}, {salon.city}
                            </p>
                            <div className="flex items-center gap-4 mt-3 flex-wrap">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                                    ⭐ {salon.avg_rating || '4.5'} Rating
                                </span>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                                    🕒 {salon.opening_time?.slice(0, 5)} - {salon.closing_time?.slice(0, 5)}
                                </span>
                                {salon.allows_home_service && (
                                    <span className="bg-green-500 px-3 py-1 rounded-full text-sm font-medium">
                                        🏠 Home Service Available
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {/* Location Button */}
                            <button
                                onClick={openMap}
                                className="bg-white text-purple-600 px-5 py-3 rounded-xl font-bold hover:bg-gray-100 flex items-center gap-2"
                            >
                                📍 View Location
                            </button>
                            <button
                                onClick={() => navigate(`/booking/${id}`)}
                                className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-300"
                            >
                                Book Now →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Services & Staff */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Services */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">💇 Our Services</h2>
                            {services.length === 0 ? (
                                <p className="text-gray-400">No services listed yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {services.map(s => (
                                        <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{s.name}</h3>
                                                <p className="text-sm text-gray-400">⏱️ {s.duration_minutes} min</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-purple-600 text-lg">₹{s.final_price}</p>
                                                <button
                                                    onClick={() => navigate(`/booking/${id}`)}
                                                    className="text-xs text-purple-500 hover:underline"
                                                >
                                                    Book →
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Staff */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">👨‍💼 Our Team</h2>
                            {staff.length === 0 ? (
                                <p className="text-gray-400">No staff listed yet</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {staff.map(s => (
                                        <div key={s.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl">
                                                💇
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{s.name}</h3>
                                                <p className="text-sm text-gray-400">{s.specialization || 'Hair Expert'}</p>
                                                <p className="text-xs text-yellow-500">⭐ {s.avg_rating || '4.5'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right: Info Card */}
                    <div className="space-y-4">

                        {/* Quick Info */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4">ℹ️ Salon Info</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <span>🕒</span>
                                    <span className="text-gray-600">
                                        {salon.opening_time?.slice(0, 5)} - {salon.closing_time?.slice(0, 5)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span>📍</span>
                                    <span className="text-gray-600">{salon.address}, {salon.city}</span>
                                </div>
                                {salon.phone && (
                                    <div className="flex items-center gap-3">
                                        <span>📱</span>
                                        <a href={`tel:${salon.phone}`} className="text-purple-600 hover:underline">
                                            {salon.phone}
                                        </a>
                                    </div>
                                )}
                                {salon.allows_home_service && (
                                    <div className="flex items-center gap-3">
                                        <span>🏠</span>
                                        <span className="text-green-600">
                                            Home service: ₹{salon.home_service_charge || 0} extra
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location Map Button */}
                        <button
                            onClick={openMap}
                            className="w-full bg-blue-50 border border-blue-200 text-blue-600 py-4 rounded-xl font-medium hover:bg-blue-100 flex items-center justify-center gap-2"
                        >
                            🗺️ Open in Google Maps
                        </button>

                        {/* Book Button */}
                        <button
                            onClick={() => navigate(`/booking/${id}`)}
                            className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700"
                        >
                            Book Appointment →
                        </button>

                    </div>
                </div>
            </div>
        </div>
    )
}