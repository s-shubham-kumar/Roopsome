import BASE_URL from '../utils/api'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from '../components/Header'

export default function Booking() {
    const { salonId } = useParams()
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [services, setServices] = useState([])
    const [staff, setStaff] = useState([])
    const [slots, setSlots] = useState([])
    const [loading, setLoading] = useState(false)
    const [booking, setBooking] = useState(null)

    const [selected, setSelected] = useState({
        service: null,
        staff: null,
        date: '',
        slot: null,
        bookingType: 'salon',
        homeAddress: '',
        paymentMode: 'cash',
        notes: ''
    })

    useEffect(() => {
        fetchServices()
        fetchStaff()
    }, [salonId])

    useEffect(() => {
        if (selected.staff && selected.date) fetchSlots()
    }, [selected.staff, selected.date])

    const fetchServices = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/v1/salons/${salonId}/services`)
            setServices(res.data)
        } catch (err) { console.error(err) }
    }

    const fetchStaff = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/v1/salons/${salonId}/staff`)
            setStaff(res.data)
        } catch (err) { console.error(err) }
    }

    const fetchSlots = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${BASE_URL}/api/v1/slots?staff_id=${selected.staff.id}&date=${selected.date}`)
            setSlots(res.data)
        } catch {
            setSlots([])
        } finally {
            setLoading(false)
        }
    }

    const handleBooking = async () => {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }
        setLoading(true)
        try {
            const res = await axios.post(`${BASE_URL}/api/v1/bookings`, {
                salon_id: salonId,
                service_id: selected.service.id,
                staff_id: selected.staff.id,
                slot_id: selected.slot.id,
                booking_date: selected.date,
                booking_time: selected.slot.slot_time,
                booking_type: selected.bookingType,
                home_service_address: selected.homeAddress,
                notes: selected.notes
            }, { headers: { Authorization: `Bearer ${token}` } })

            setBooking(res.data)

            if (selected.paymentMode === 'online') {
                handleRazorpay(res.data)
            } else {
                setStep(6)
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Booking failed')
        } finally {
            setLoading(false)
        }
    }

    const handleRazorpay = async (bookingData) => {
        try {
            const token = localStorage.getItem('token')
            const res = await axios.post(`${BASE_URL}/api/v1/payments/create`, {
                booking_id: bookingData.booking_id,
                amount: bookingData.total_amount
            }, { headers: { Authorization: `Bearer ${token}` } })

            const options = {
                key: res.data.key_id,
                amount: bookingData.total_amount * 100,
                currency: 'INR',
                name: 'Roopsome',
                order_id: res.data.order_id,
                handler: async (response) => {
                    await axios.post(`${BASE_URL}/api/v1/payments/verify`, {
                        razorpay_order_id: res.data.order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        booking_id: bookingData.booking_id
                    }, { headers: { Authorization: `Bearer ${token}` } })
                    setStep(6)
                },
                theme: { color: '#7C3AED' }
            }
            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (err) {
            alert('Payment failed. Try again.')
        }
    }

    const today = new Date().toISOString().split('T')[0]
    const steps = ['Service', 'Barber', 'Date & Time', 'Details', 'Confirm']

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {step < 6 && (
                <div className="max-w-2xl mx-auto px-4 py-4 pb-8">

                    {/* ── Step Progress Bar ── */}
                    <div className="mb-5">
                        {/* Mobile: progress bar */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-purple-600">
                                Step {step} of {steps.length}
                            </span>
                            <span className="text-sm text-gray-400">{steps[step - 1]}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full">
                            <div
                                className="h-1.5 bg-purple-600 rounded-full transition-all duration-300"
                                style={{ width: `${(step / steps.length) * 100}%` }}
                            />
                        </div>

                        {/* Desktop: step dots */}
                        <div className="hidden md:flex items-center justify-between mt-3">
                            {steps.map((s, i) => (
                                <div key={i} className="flex items-center">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > i + 1 ? 'bg-green-500 text-white' :
                                        step === i + 1 ? 'bg-purple-600 text-white' :
                                            'bg-gray-200 text-gray-400'
                                        }`}>
                                        {step > i + 1 ? '✓' : i + 1}
                                    </div>
                                    <span className={`ml-1.5 text-xs ${step === i + 1 ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
                                        {s}
                                    </span>
                                    {i < steps.length - 1 && (
                                        <div className={`mx-2 h-0.5 w-6 ${step > i + 1 ? 'bg-green-400' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── STEP 1: Service ── */}
                    {step === 1 && (
                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">✂️ Choose Service</h2>
                            <div className="space-y-3">
                                {services.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8">No services available</p>
                                ) : services.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => { setSelected({ ...selected, service: s }); setStep(2) }}
                                        className="w-full flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-purple-400 hover:bg-purple-50 active:bg-purple-100 transition-all text-left"
                                    >
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{s.name}</h3>
                                            <p className="text-sm text-gray-400 mt-0.5">⏱ {s.duration_minutes} min</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-purple-600 font-bold text-lg">₹{s.final_price}</span>
                                            <div className="text-xs text-gray-400 capitalize">{s.category}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Staff ── */}
                    {step === 2 && (
                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <button onClick={() => setStep(1)}
                                className="flex items-center gap-1 text-gray-400 hover:text-purple-600 mb-4 text-sm font-medium">
                                ← Back
                            </button>
                            <h2 className="text-lg font-bold text-gray-800 mb-4">👨‍💼 Choose Barber</h2>
                            <div className="space-y-3">
                                {staff.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => { setSelected({ ...selected, staff: s }); setStep(3) }}
                                        className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-purple-400 hover:bg-purple-50 active:bg-purple-100 transition-all text-left"
                                    >
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                                            💇
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">{s.name}</h3>
                                            <p className="text-sm text-gray-400">{s.specialization || 'Hair Expert'}</p>
                                            <p className="text-xs text-yellow-500">⭐ {s.avg_rating || '4.5'}</p>
                                        </div>
                                        <span className="text-gray-300 text-lg">›</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Date & Time ── */}
                    {step === 3 && (
                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <button onClick={() => setStep(2)}
                                className="flex items-center gap-1 text-gray-400 hover:text-purple-600 mb-4 text-sm font-medium">
                                ← Back
                            </button>
                            <h2 className="text-lg font-bold text-gray-800 mb-4">📅 Pick Date & Time</h2>

                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                                <input
                                    type="date"
                                    min={today}
                                    value={selected.date}
                                    onChange={e => setSelected({ ...selected, date: e.target.value, slot: null })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-base"
                                />
                            </div>

                            {selected.date && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Select Time Slot
                                    </label>
                                    {loading ? (
                                        <div className="grid grid-cols-4 gap-2">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : slots.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">
                                            <div className="text-3xl mb-2">😕</div>
                                            <p>No slots available for this date</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-4 gap-2">
                                            {slots.map(slot => (
                                                <button
                                                    key={slot.id}
                                                    disabled={slot.available <= 0}
                                                    onClick={() => { setSelected({ ...selected, slot }); setStep(4) }}
                                                    className={`py-3 px-1 rounded-xl text-xs font-semibold border-2 transition-all ${slot.available <= 0
                                                        ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                                        : selected.slot?.id === slot.id
                                                            ? 'border-purple-600 bg-purple-600 text-white'
                                                            : 'border-gray-200 text-gray-700 hover:border-purple-400 hover:bg-purple-50 active:bg-purple-100'
                                                        }`}
                                                >
                                                    {slot.slot_time?.slice(0, 5)}
                                                    {slot.available <= 0 && <div className="text-red-300 text-xs">Full</div>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── STEP 4: Details ── */}
                    {step === 4 && (
                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <button onClick={() => setStep(3)}
                                className="flex items-center gap-1 text-gray-400 hover:text-purple-600 mb-4 text-sm font-medium">
                                ← Back
                            </button>
                            <h2 className="text-lg font-bold text-gray-800 mb-4">📝 Additional Details</h2>

                            {/* Booking Type */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Booking Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'salon', label: '🏪 Visit Salon' },
                                        { value: 'home_service', label: '🏠 Home Service' }
                                    ].map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => setSelected({ ...selected, bookingType: type.value })}
                                            className={`py-3 rounded-xl font-medium text-sm border-2 transition-all ${selected.bookingType === type.value
                                                ? 'border-purple-600 bg-purple-600 text-white'
                                                : 'border-gray-200 text-gray-700 hover:border-purple-400'
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selected.bookingType === 'home_service' && (
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Address</label>
                                    <textarea
                                        placeholder="Enter your full address..."
                                        value={selected.homeAddress}
                                        onChange={e => setSelected({ ...selected, homeAddress: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 h-24 resize-none text-base"
                                    />
                                </div>
                            )}

                            {/* Payment Mode */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">💳 Payment Mode</label>
                                <div className="space-y-2">
                                    {[
                                        { value: 'cash', icon: '💵', label: 'Pay Cash at Salon', desc: 'Pay when you arrive' },
                                        { value: 'pay_later', icon: '🕐', label: 'Pay After Service', desc: 'Pay after service done' },
                                        { value: 'online', icon: '💳', label: 'Pay Online Now', desc: 'UPI, Card via Razorpay' },
                                    ].map(pm => (
                                        <button
                                            key={pm.value}
                                            onClick={() => setSelected({ ...selected, paymentMode: pm.value })}
                                            className={`w-full flex items-center gap-3 p-3.5 border-2 rounded-xl transition-all text-left ${selected.paymentMode === pm.value
                                                ? 'border-purple-600 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300'
                                                }`}
                                        >
                                            <span className="text-xl">{pm.icon}</span>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800 text-sm">{pm.label}</p>
                                                <p className="text-xs text-gray-400">{pm.desc}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected.paymentMode === pm.value
                                                ? 'border-purple-600 bg-purple-600'
                                                : 'border-gray-300'
                                                }`}>
                                                {selected.paymentMode === pm.value && (
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                                <textarea
                                    placeholder="Any special requests..."
                                    value={selected.notes}
                                    onChange={e => setSelected({ ...selected, notes: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 h-20 resize-none text-base"
                                />
                            </div>

                            <button
                                onClick={() => setStep(5)}
                                className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-base hover:bg-purple-700 active:bg-purple-800 transition-colors"
                            >
                                Review Booking →
                            </button>
                        </div>
                    )}

                    {/* ── STEP 5: Confirm ── */}
                    {step === 5 && (
                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <button onClick={() => setStep(4)}
                                className="flex items-center gap-1 text-gray-400 hover:text-purple-600 mb-4 text-sm font-medium">
                                ← Back
                            </button>
                            <h2 className="text-lg font-bold text-gray-800 mb-4">✅ Confirm Booking</h2>

                            {/* Summary Card */}
                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-5 space-y-2.5">
                                {[
                                    { label: 'Service', value: selected.service?.name },
                                    { label: 'Barber', value: selected.staff?.name },
                                    { label: 'Date', value: selected.date },
                                    { label: 'Time', value: selected.slot?.slot_time?.slice(0, 5) },
                                    { label: 'Type', value: selected.bookingType === 'salon' ? '🏪 Visit Salon' : '🏠 Home Service' },
                                    {
                                        label: 'Payment', value:
                                            selected.paymentMode === 'online' ? '💳 Online' :
                                                selected.paymentMode === 'cash' ? '💵 Cash' : '🕐 Pay Later'
                                    },
                                ].map(item => (
                                    <div key={item.label} className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm">{item.label}</span>
                                        <span className="font-semibold text-gray-800 text-sm">{item.value}</span>
                                    </div>
                                ))}
                                <div className="border-t border-purple-200 pt-2.5 flex justify-between items-center">
                                    <span className="font-bold text-gray-800">Total Amount</span>
                                    <span className="font-bold text-purple-600 text-xl">₹{selected.service?.final_price}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={loading}
                                className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-base hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 transition-colors"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Processing...
                                    </span>
                                ) : selected.paymentMode === 'online' ? '💳 Pay & Confirm' :
                                    selected.paymentMode === 'cash' ? '💵 Book (Pay Cash)' :
                                        '🕐 Book (Pay Later)'}
                            </button>

                            <p className="text-center text-xs text-gray-400 mt-3">
                                By confirming, you agree to our cancellation policy
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ── STEP 6: Success ── */}
            {step === 6 && booking && (
                <div className="max-w-md mx-auto px-4 py-12 text-center">
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <span className="text-4xl">🎉</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-500 mb-6 text-sm">
                            Your appointment has been booked successfully.
                        </p>

                        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Booking ID</span>
                                <span className="font-mono text-xs text-gray-700">{booking.booking_id?.slice(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Queue Position</span>
                                <span className="font-bold text-purple-600">#{booking.queue_position}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Payment</span>
                                <span className="font-medium text-gray-700">
                                    {selected.paymentMode === 'cash' ? '💵 Pay cash at salon' :
                                        selected.paymentMode === 'pay_later' ? '🕐 Pay after service' :
                                            '✅ Paid online'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 text-sm"
                            >
                                My Bookings
                            </button>
                            <button
                                onClick={() => navigate(`/queue/${salonId}`)}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 text-sm"
                            >
                                View Queue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
