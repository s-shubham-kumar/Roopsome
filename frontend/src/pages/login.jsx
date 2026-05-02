import BASE_URL from '../utils/api'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from '../components/Header'

export default function Login() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

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
            else navigate('/salons')
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed')
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
                        <h1 className="text-2xl font-bold text-gray-800">Welcome Back!</h1>
                        <p className="text-gray-500 mt-1">Login to your Roopsome account</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                placeholder="Enter password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 mt-6 text-sm">
                        Don't have account?{' '}
                        <Link to="/signup" className="text-purple-600 font-medium hover:underline">
                            Sign Up Free
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    )
}