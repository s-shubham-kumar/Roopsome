import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Home() {
    const [city, setCity] = useState('')
    const navigate = useNavigate()

    const handleSearch = (e) => {
        e.preventDefault()
        navigate(city.trim() ? `/salons?city=${city}` : '/salons')
    }

    const cities = ['Patna', 'Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai']

    const features = [
        { icon: '⚡', title: 'Book in 30 Seconds', desc: 'Find salon, pick slot, confirm — done in under a minute.', color: 'from-yellow-400 to-orange-400' },
        { icon: '📍', title: 'Live Queue Tracking', desc: 'Know exactly where you are in queue. Zero guesswork.', color: 'from-blue-400 to-cyan-400' },
        { icon: '🏠', title: 'Home Service', desc: 'Top stylists at your doorstep. Book home service instantly.', color: 'from-green-400 to-emerald-400' },
        { icon: '↩️', title: 'Cancel Anytime', desc: 'Plans changed? Cancel your booking and get instant refund.', color: 'from-red-400 to-pink-400' },
        { icon: '⭐', title: 'Verified Reviews', desc: 'Real reviews from real customers. Find the best near you.', color: 'from-purple-400 to-violet-400' },
        { icon: '🔒', title: 'Secure Payments', desc: 'Pay via UPI, Card, or Wallet. 100% secure with Razorpay.', color: 'from-teal-400 to-cyan-400' },
    ]

    const steps = [
        { step: '01', icon: '🔍', title: 'Search Salon', desc: 'Find top salons in your city' },
        { step: '02', icon: '✂️', title: 'Pick Service', desc: 'Choose service, barber & time' },
        { step: '03', icon: '💳', title: 'Pay & Book', desc: 'Secure payment, instant confirm' },
        { step: '04', icon: '✅', title: 'Get Served', desc: 'Walk in, skip the wait' },
    ]

    const stats = [
        { number: '500+', label: 'Salons Listed' },
        { number: '10K+', label: 'Happy Customers' },
        { number: '50+', label: 'Cities Covered' },
        { number: '4.8★', label: 'Average Rating' },
    ]

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* ── Hero ──────────────────────────────── */}
            <section className="relative bg-gradient-to-br from-purple-700 via-purple-600 to-pink-500 text-white overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
                    <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/5 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full" />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-20 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        India's #1 Salon Queue Platform
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
                        Your Beauty,{' '}
                        <span className="text-yellow-300 relative">
                            Your Time
                        </span>
                    </h1>
                    <p className="text-lg text-purple-100 mb-10 max-w-xl mx-auto leading-relaxed">
                        Book salon appointments in seconds. Know your exact queue position. No more waiting!
                    </p>

                    {/* Search Box */}
                    <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-6">
                        <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2">
                            <div className="flex items-center gap-2 flex-1 px-3 py-2">
                                <span className="text-xl shrink-0">📍</span>
                                <input
                                    type="text"
                                    placeholder="Search by city... (e.g. Patna, Delhi)"
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                    className="flex-1 text-gray-800 outline-none text-sm placeholder-gray-400"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shrink-0"
                            >
                                🔍 Search
                            </button>
                        </div>
                    </form>

                    {/* Popular Cities */}
                    <div className="flex flex-wrap justify-center gap-2">
                        <span className="text-purple-200 text-sm mr-1">Popular:</span>
                        {cities.map(c => (
                            <button
                                key={c}
                                onClick={() => navigate(`/salons?city=${c}`)}
                                className="bg-white/15 hover:bg-white/25 border border-white/20 text-white px-3 py-1 rounded-full text-xs font-medium transition-all"
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Stats ────────────────────────────── */}
            <section className="bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {stats.map((s, i) => (
                            <div key={i}>
                                <div className="text-2xl md:text-3xl font-bold text-purple-600">{s.number}</div>
                                <div className="text-xs text-gray-500 mt-1 font-medium">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ─────────────────────────── */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider">Why Roopsome</span>
                        <h2 className="text-3xl font-bold text-gray-900 mt-2">Everything you need</h2>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto">One platform for all your salon needs — book, track, pay.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group border border-gray-100">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform`}>
                                    {f.icon}
                                </div>
                                <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ─────────────────────── */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider">Simple Process</span>
                        <h2 className="text-3xl font-bold text-gray-900 mt-2">How It Works</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
                        {/* Connector line - desktop only */}
                        <div className="absolute top-8 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-purple-200 to-pink-200 hidden md:block" />
                        {steps.map((s, i) => (
                            <div key={i} className="text-center relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-200 relative z-10">
                                    <span className="text-2xl">{s.icon}</span>
                                </div>
                                <div className="text-xs font-bold text-purple-400 mb-1">{s.step}</div>
                                <h3 className="font-bold text-gray-800 text-sm mb-1">{s.title}</h3>
                                <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────── */}
            <section className="py-16 px-4 bg-gradient-to-br from-purple-700 to-pink-500">
                <div className="max-w-2xl mx-auto text-center text-white">
                    <h2 className="text-3xl font-bold mb-3">Ready to Look Your Best?</h2>
                    <p className="text-purple-100 mb-8">Join thousands of happy customers. Book your first appointment in 30 seconds.</p>
                    <div className="flex gap-3 justify-center flex-wrap">
                        <button
                            onClick={() => navigate('/salons')}
                            className="bg-white text-purple-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg text-sm"
                        >
                            🔍 Find Salons Near Me
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-purple-900/50 border border-white/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-900/70 transition-colors text-sm"
                        >
                            Create Free Account →
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}