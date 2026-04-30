import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from '../components/Header'

export default function Signup() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        full_name: '', email: '', phone: '', password: '', user_type: 'customer'
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await axios.post('/api/v1/auth/signup', form)
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('userId', res.data.user_id)
            localStorage.setItem('userType', res.data.user_type)
            localStorage.setItem('fullName', res.data.full_name)
            if (res.data.user_type === 'barber') navigate('/barber')
            else navigate('/salons')
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex items-center justify-center py-16 px-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-2xl font-bold">R</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
                        <p className="text-gray-500 mt-1">Join Roopsome for free</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* User Type Toggle */}
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                        {['customer', 'barber', 'salon_owner'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setForm({ ...form, user_type: type })}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${form.user_type === type
                                        ? 'bg-purple-600 text-white shadow'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {type === 'salon_owner' ? 'Owner' : type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={form.full_name}
                            onChange={e => setForm({ ...form, full_name: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
                            required
                        />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password (min 6 characters)"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : 'Create Free Account'}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 mt-6 text-sm">
                        Already have account?{' '}
                        <Link to="/login" className="text-purple-600 font-medium hover:underline">Login</Link>
                    </p>

                </div>
            </div>
        </div>
    )
}