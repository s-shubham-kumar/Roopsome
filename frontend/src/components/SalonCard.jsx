import { Link } from 'react-router-dom'

export default function SalonCard({ salon }) {
    return (
        <Link to={`/salons/${salon.id}`}>
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1">

                {/* Image */}
                <div className="h-44 bg-gradient-to-br from-purple-400 to-pink-400 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl">💇</span>
                    </div>
                    {salon.allows_home_service && (
                        <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            🏠 Home Service
                        </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white text-purple-600 text-xs px-2 py-1 rounded-full font-bold">
                        ⭐ {salon.avg_rating || '4.5'}
                    </div>
                </div>

                {/* Info */}
                <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-lg">{salon.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">📍 {salon.address}</p>
                    <p className="text-gray-400 text-sm">{salon.city}</p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">
                            🕒 {salon.opening_time?.slice(0, 5)} - {salon.closing_time?.slice(0, 5)}
                        </span>
                        <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
                            Book Now →
                        </span>
                    </div>
                </div>

            </div>
        </Link>
    )
}