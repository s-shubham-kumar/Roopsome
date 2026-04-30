import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Home() {
    const [city, setCity] = useState('')
    const navigate = useNavigate()

    const handleSearch = (e) => {
        e.preventDefault()
        if (city.trim()) {
            navigate(`/salons?city=${city}`)
        } else {
            navigate('/salons')
        }
    }

    const cities = ['Patna', 'Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai']

    return (
        <div className="min-h-screen">
            <Header />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white">
                <div className="max-w-6xl mx-auto px-4 py-20 text-center">

                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        Your Beauty, <span className="text-yellow-300">Your Time</span>
                    </h1>
                    <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
                        Book salon appointments in seconds. Know your exact queue position. No more waiting!
                    </p>

                    {/* Search Box */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                        <div className="flex bg-white rounded-2xl overflow-hidden shadow-2xl">
                            <div className="flex items-center px-4 text-gray-400">
                                📍
                            </div>
                            <input
                                type="text"
                                placeholder="Search by city... (e.g. Patna, Delhi)"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="flex-1 py-4 px-2 text-gray-800 outline-none text-lg"
                            />
                            <button
                                type="submit"
                                className="bg-purple-600 text-white px-8 py-4 font-bold text-lg hover:bg-purple-700 transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Popular Cities */}
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {cities.map(c => (
                            <button
                                key={c}
                                onClick={() => navigate(`/salons?city=${c}`)}
                                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
                    Why Choose Roopsome?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: '⚡', title: 'Book in 30 Seconds', desc: 'Find your salon, pick a slot, confirm. Done in under a minute!' },
                        { icon: '📍', title: 'Live Queue Tracking', desc: 'See exactly where you are in queue. Know your wait time live.' },
                        { icon: '🏠', title: 'Home Service', desc: 'Prefer comfort of home? Book home service with top stylists.' },
                        { icon: '❌', title: 'Cancel Anytime', desc: 'Plans changed? Cancel your booking and get instant refund.' },
                        { icon: '⭐', title: 'Verified Reviews', desc: 'Real reviews from real customers. Find the best salon near you.' },
                        { icon: '💳', title: 'Secure Payments', desc: 'Pay via UPI, Card, or Wallet. 100% secure with Razorpay.' },
                    ].map((f, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
                            <div className="text-4xl mb-4">{f.icon}</div>
                            <h3 className="font-bold text-gray-800 text-lg mb-2">{f.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* How It Works */}
            <div className="bg-purple-50 py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
                        How It Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { step: '1', icon: '🔍', title: 'Search Salon', desc: 'Find salons near you by city or location' },
                            { step: '2', icon: '💇', title: 'Choose Service', desc: 'Pick your service, barber and time slot' },
                            { step: '3', icon: '💳', title: 'Pay & Book', desc: 'Pay securely and get instant confirmation' },
                            { step: '4', icon: '✅', title: 'Get Served', desc: 'Track your queue and get served on time' },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                    {s.step}
                                </div>
                                <div className="text-3xl mb-2">{s.icon}</div>
                                <h3 className="font-bold text-gray-800 mb-1">{s.title}</h3>
                                <p className="text-gray-500 text-sm">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Look Your Best?</h2>
                    <p className="text-purple-100 mb-8 text-lg">Join thousands of happy customers using Roopsome</p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <button
                            onClick={() => navigate('/salons')}
                            className="bg-white text-purple-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                        >
                            Find Salons Near Me
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-purple-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-900 transition-colors"
                        >
                            Create Free Account
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}