import BASE_URL from '../utils/api'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Signup() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        full_name: '', email: '', phone: '', password: '', user_type: 'customer'
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await axios.post(`${BASE_URL}/api/v1/auth/signup`, form)
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('userId', res.data.user_id)
            localStorage.setItem('userType', res.data.user_type)
            localStorage.setItem('fullName', res.data.full_name)
            if (res.data.user_type === 'barber') navigate('/barber')
            else if (res.data.user_type === 'salon_owner') navigate('/owner')
            else navigate('/salons')
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed')
        } finally {
            setLoading(false)
        }
    }

    const roles = [
        { value: 'customer', icon: '👤', label: 'Customer' },
        { value: 'salon_owner', icon: '🏪', label: 'Owner' },
        { value: 'barber', icon: '💇', label: 'Barber' },
    ]

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
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Create account ✨</h1>
                    <p className="text-gray-500">Join Roopsome for free today</p>
                </div>

                <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">I am a...</label>
                    <div className="grid grid-cols-3 gap-2">
                        {roles.map(r => (
                            <button
                                key={r.value}
                                type="button"
                                onClick={() => setForm({ ...form, user_type: r.value })}
                                className={`py-3 px-2 rounded-xl text-sm font-semibold border-2 transition-all flex flex-col items-center gap-1 ${form.user_type === r.value
                                    ? 'border-purple-600 bg-purple-600 text-white shadow-md'
                                    : 'border-gray-200 text-gray-600 bg-white hover:border-purple-300'
                                    }`}
                            >
                                <span className="text-xl">{r.icon}</span>
                                <span>{r.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={form.full_name}
                            onChange={e => setForm({ ...form, full_name: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-white text-base"
                            required
                        />
                    </div>

                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-white text-base"
                            required
                        />
                    </div>

                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📱</span>
                        <input
                            type="tel"
                            placeholder="Phone Number (10 digits)"
                            value={form.phone}
                            onChange={e => {
                                const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10)
                                setForm({ ...form, phone: digitsOnly })
                            }}
                            inputMode="numeric"
                            pattern="[0-9]{10}"
                            maxLength={10}
                            title="Enter a valid 10 digit phone number"
                            className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-white text-base"
                            required
                        />
                    </div>

                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                        <input
                            type={showPass ? 'text' : 'password'}
                            placeholder="Password (min 6 characters)"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            minLength={6}
                            title="Password must be at least 6 characters"
                            className="w-full border border-gray-200 rounded-xl pl-11 pr-12 py-3.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-white text-base"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                            {showPass ? '🙈' : '👁️'}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-base hover:bg-purple-700 active:bg-purple-800 transition-colors disabled:opacity-50 shadow-md shadow-purple-200"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Creating Account...
                            </span>
                        ) : `Create ${form.user_type === 'salon_owner' ? 'Owner' : form.user_type === 'barber' ? 'Barber' : 'Customer'} Account →`}
                    </button>
                </form>

                <p className="text-xs text-gray-400 text-center mt-3">
                    By signing up, you agree to our Terms & Privacy Policy
                </p>

                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-400 text-sm">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="text-center">
                    <p className="text-gray-500 text-sm mb-3">Already have an account?</p>
                    <Link
                        to="/login"
                        className="w-full block border-2 border-purple-200 text-purple-700 py-3.5 rounded-xl font-bold text-base hover:bg-purple-50 transition-colors text-center"
                    >
                        Login Instead
                    </Link>
                </div>
            </div>
        </div>
    )
}