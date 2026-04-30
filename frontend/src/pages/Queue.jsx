import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from '../components/Header'

export default function Queue() {
    const { salonId } = useParams()
    const navigate = useNavigate()
    const [queue, setQueue] = useState([])
    const [loading, setLoading] = useState(true)
    const userId = localStorage.getItem('userId')

    useEffect(() => {
        fetchQueue()
        // Auto refresh every 30 seconds
        const interval = setInterval(fetchQueue, 30000)
        return () => clearInterval(interval)
    }, [salonId])

    const fetchQueue = async () => {
        try {
            const today = new Date().toISOString().split('T')[0]
            const res = await axios.get(`/api/v1/queue/${salonId}?date=${today}`)
            setQueue(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const myPosition = queue.find(q => q.booking_id && userId)

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-3xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl p-6 mb-6">
                    <h1 className="text-2xl font-bold mb-1">📍 Live Queue</h1>
                    <p className="text-purple-100">Real-time queue tracking • Auto-refreshes every 30 seconds</p>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-sm text-purple-100">Live</span>
                        <span className="text-sm text-purple-200 ml-2">
                            {queue.length} people in queue
                        </span>
                    </div>
                </div>

                {/* Queue List */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading queue...</p>
                    </div>
                ) : queue.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Queue is Empty!</h3>
                        <p className="text-gray-400 mb-6">No one waiting right now. Perfect time to book!</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700"
                        >
                            Book Now →
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {queue.map((item, index) => (
                            <div
                                key={item.booking_id}
                                className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${index === 0
                                        ? 'border-green-400 bg-green-50'
                                        : 'border-gray-100'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">

                                        {/* Position Badge */}
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${index === 0
                                                ? 'bg-green-500 text-white'
                                                : index === 1
                                                    ? 'bg-yellow-400 text-white'
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {index === 0 ? '✓' : `#${item.queue_position}`}
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-gray-800">
                                                {item.customer_name}
                                                {index === 0 && (
                                                    <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                                        In Service
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                💇 {item.service_name} • ⏱️ {item.duration_minutes} min
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                👨‍💼 {item.staff_name} • 🕒 {item.booking_time?.slice(0, 5)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Wait Time */}
                                    <div className="text-right">
                                        {index === 0 ? (
                                            <span className="text-green-600 font-bold text-sm">Now!</span>
                                        ) : (
                                            <div>
                                                <p className="text-purple-600 font-bold">
                                                    ~{item.estimated_wait_minutes} min
                                                </p>
                                                <p className="text-xs text-gray-400">wait time</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Refresh Button */}
                <div className="text-center mt-6">
                    <button
                        onClick={fetchQueue}
                        className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 mx-auto"
                    >
                        🔄 Refresh Queue
                    </button>
                </div>

            </div>
        </div>
    )
}