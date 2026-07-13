import BASE_URL from '../utils/api'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await axios.post(`${BASE_URL}/api/v1/auth/login`, form)
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('userId', res.data.user_id)
            localStorage.setItem('userType', res.data.user_type)
            localStorage.setItem('fullName', res.data.full_name)
            if (res.data.user_type === 'barber') navigate('/barber')
            else if (res.data.user_type === 'salon_owner') navigate('/owner')
            else navigate('/salons')
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
            <div className="px-6 pt-8 pb-4">
                <Link to="/" className="flex items-center gap-2 w-fit">
                    <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-base">R</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">Roop<span className="text-purple-600">some</span></span>
                </Link>
            </div>

            <div className="flex-1 flex flex-col justify-center px-6 pb-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back 👋</h1>
                    <p className="text-gray-500">Login to book your next appointment</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-white text-base"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                            <input
                                type={showPass ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl pl-11 pr-12 py-3.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-white text-base"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                            >
                                {showPass ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-base hover:bg-purple-700 active:bg-purple-800 transition-colors disabled:opacity-50 shadow-md shadow-purple-200 mt-2"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Logging in...
                            </span>
                        ) : 'Login →'}
                    </button>
                </form>

                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-400 text-sm">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="text-center">
                    <p className="text-gray-500 text-sm mb-3">Don't have an account?</p>
                    <Link
                        to="/signup"
                        className="w-full block border-2 border-purple-200 text-purple-700 py-3.5 rounded-xl font-bold text-base hover:bg-purple-50 transition-colors text-center"
                    >
                        Create Free Account
                    </Link>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                    <Link to="/signup" className="text-xs text-gray-400 hover:text-purple-600">🏪 Register Salon</Link>
                    <span className="text-gray-200">|</span>
                    <Link to="/signup" className="text-xs text-gray-400 hover:text-purple-600">💇 Barber Signup</Link>
                </div>
            </div>
        </div>
    )
}