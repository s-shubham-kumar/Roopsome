import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SalonCard from '../components/SalonCard'
import BASE_URL from '../utils/api'

export default function Salons() {
    const [searchParams] = useSearchParams()
    const [salons, setSalons] = useState([])
    const [loading, setLoading] = useState(true)
    const [city, setCity] = useState(searchParams.get('city') || '')
    const [search, setSearch] = useState(searchParams.get('city') || '')

    useEffect(() => { fetchSalons() }, [city])

    const fetchSalons = async () => {
        setLoading(true)
        try {
            const url = city
                ? `${BASE_URL}/api/v1/salons?city=${city}`
                : `${BASE_URL}/api/v1/salons`
            const res = await axios.get(url)
            setSalons(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setCity(search)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Search Bar */}
            <div className="bg-white border-b border-gray-100 py-4 sticky top-16 z-40">
                <div className="max-w-6xl mx-auto px-4">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4">
                            <span className="mr-2">📍</span>
                            <input
                                type="text"
                                placeholder="Search by city..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="flex-1 py-3 bg-transparent outline-none text-gray-700"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {city ? `Salons in ${city}` : 'All Salons'}
                        <span className="text-gray-400 font-normal text-base ml-2">
                            ({salons.length} found)
                        </span>
                    </h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                                <div className="h-44 bg-gray-200" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : salons.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">💇</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No salons found</h3>
                        <p className="text-gray-400">Try searching a different city</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {salons.map(salon => (
                            <SalonCard key={salon.id} salon={salon} />
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}