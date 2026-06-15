import BASE_URL from '../utils/api'
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
    const [activeTab, setActiveTab] = useState('services')

    useEffect(() => { fetchData() }, [id])

    const fetchData = async () => {
        try {
            const [salonRes, servicesRes, staffRes] = await Promise.all([
                axios.get(`${BASE_URL}/api/v1/salons/${id}`),
                axios.get(`${BASE_URL}/api/v1/salons/${id}/services`),
                axios.get(`${BASE_URL}/api/v1/salons/${id}/staff`)
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
            <div className="flex items-center justify-center py-32">
                <div className="text-center">
                    <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">Loading salon...</p>
                </div>
            </div>
        </div>
    )

    if (!salon) return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="text-center py-32">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-500">Salon not found</p>
                <button onClick={() => navigate('/salons')} className="mt-4 text-purple-600 text-sm font-medium">
                    ← Back to salons
                </button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* ── Hero Banner ──────────────────────── */}
            <div className="relative h-56 sm:h-72 overflow-hidden">
                {salon.image_url ? (
                    <img src={salon.image_url} alt={salon.name}
                        className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Back button */}
                <button onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-black/50 transition-colors">
                    ← Back
                </button>

                {/* Salon name overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{salon.name}</h1>
                    <p className="text-white/80 text-sm flex items-center gap-1">
                        📍 {salon.address}, {salon.city}
                    </p>
                </div>
            </div>

            {/* ── Quick Info Bar ───────────────────── */}
            <div className="bg-white border-b border-gray-100 px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 text-sm font-medium text-amber-500">
                        ⭐ {salon.avg_rating || '4.5'}
                        <span className="text-gray-400 font-normal">rating</span>
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="text-sm text-gray-600">
                        🕒 {salon.opening_time?.slice(0, 5)} – {salon.closing_time?.slice(0, 5)}
                    </span>
                    {salon.allows_home_service && (
                        <>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="text-sm text-green-600 font-medium">🏠 Home Service</span>
                        </>
                    )}
                    <div className="ml-auto flex gap-2">
                        <button onClick={openMap}
                            className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                            📍 Map
                        </button>
                        {salon.phone && (
                            <a href={`tel:${salon.phone}`}
                                className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                📱 Call
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 pb-32">

                {/* ── Tabs ─────────────────────────── */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
                    {[['services', '✂️ Services'], ['team', '👥 Team'], ['info', 'ℹ️ Info']].map(([key, label]) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── Services Tab ─────────────────── */}
                {activeTab === 'services' && (
                    <div className="space-y-3">
                        {services.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                                <div className="text-4xl mb-3">✂️</div>
                                <p className="text-gray-400 text-sm">No services listed yet</p>
                            </div>
                        ) : services.map(s => (
                            <div key={s.id}
                                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:border-purple-200 hover:shadow-sm transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-lg group-hover:bg-purple-100 transition-colors">
                                        ✂️
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-sm">{s.name}</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">⏱ {s.duration_minutes} min</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-purple-600">₹{s.final_price}</span>
                                    <button onClick={() => navigate(`/booking/${id}`)}
                                        className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                                        Book
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Team Tab ─────────────────────── */}
                {activeTab === 'team' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {staff.length === 0 ? (
                            <div className="col-span-2 bg-white rounded-2xl p-12 text-center border border-gray-100">
                                <div className="text-4xl mb-3">👥</div>
                                <p className="text-gray-400 text-sm">No staff listed yet</p>
                            </div>
                        ) : staff.map(s => (
                            <div key={s.id}
                                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 hover:border-purple-200 transition-all">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-xl font-bold text-purple-600 shrink-0">
                                    {s.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-sm">{s.name}</h3>
                                    <p className="text-xs text-gray-400">{s.specialization || 'Hair Expert'}</p>
                                    <p className="text-xs text-amber-500 mt-0.5">⭐ {s.avg_rating || '4.5'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Info Tab ─────────────────────── */}
                {activeTab === 'info' && (
                    <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                        {[
                            { icon: '🕒', label: 'Hours', value: `${salon.opening_time?.slice(0, 5)} – ${salon.closing_time?.slice(0, 5)}` },
                            { icon: '📍', label: 'Address', value: `${salon.address}, ${salon.city}` },
                            salon.phone && { icon: '📱', label: 'Phone', value: salon.phone },
                            salon.allows_home_service && { icon: '🏠', label: 'Home Service', value: `Available • ₹${salon.home_service_charge || 0} extra charge` },
                        ].filter(Boolean).map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-4">
                                <span className="text-xl mt-0.5">{item.icon}</span>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                                    <p className="text-sm text-gray-700 mt-0.5">{item.value}</p>
                                </div>
                            </div>
                        ))}
                        <div className="p-4">
                            <button onClick={openMap}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-blue-200 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors">
                                🗺️ Open in Google Maps
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Sticky Book Button ───────────────── */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-40">
                <div className="max-w-4xl mx-auto">
                    <button onClick={() => navigate(`/booking/${id}`)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold text-base transition-colors shadow-lg shadow-purple-200">
                        Book Appointment →
                    </button>
                </div>
            </div>
        </div>
    )
}