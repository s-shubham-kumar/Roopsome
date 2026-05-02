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
        paymentMode: 'online',  // online | cash | pay_later
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
        const res = await axios.get(`${BASE_URL}/api/v1/salons/${salonId}/services`)
        setServices(res.data)
    }

    const fetchStaff = async () => {
        const res = await axios.get(`${BASE_URL}/api/v1/salons/${salonId}/staff`)
        setStaff(res.data)
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
            const res = await axios.post('${BASE_URL}/api/v1/bookings', {
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

            // If online payment chosen, go to payment
            if (selected.paymentMode === 'online') {
                handleRazorpay(res.data)
            } else {
                // Cash or pay later - go to success
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
            const res = await axios.post('${BASE_URL}/api/v1/payments/create', {
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
                    await axios.post('${BASE_URL}/api/v1/payments/verify', {
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

    // Step indicators
    const steps = ['Service', 'Staff', 'Date & Time', 'Details', 'Confirm']

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {step < 6 && (
                <div className="max-w-3xl mx-auto px-4 py-8">

                    {/* Step Indicators */}
                    <div className="flex items-center justify-between mb-8">
                        {steps.map((s, i) => (
                            <div key={i} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > i + 1 ? 'bg-green-500 text-white' :
                                    step === i + 1 ? 'bg-purple-600 text-white' :
                                        'bg-gray-200 text-gray-400'
                                    }`}>
                                    {step > i + 1 ? '✓' : i + 1}
                                </div>
                                <span className={`ml-2 text-sm hidden md:block ${step === i + 1 ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
                                    {s}
                                </span>
                                {i < steps.length - 1 && (
                                    <div className={`mx-3 flex-1 h-0.5 w-8 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* STEP 1: Select Service */}
                    {step === 1 && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">💇 Choose Service</h2>
                            <div className="space-y-3">
                                {services.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => { setSelected({ ...selected, service: s }); setStep(2) }}
                                        className="w-full flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                                    >
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{s.name}</h3>
                                            <p className="text-sm text-gray-400">⏱️ {s.duration_minutes} min</p>
                                        </div>
                                        <span className="text-purple-600 font-bold text-lg">₹{s.final_price}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Select Staff */}
                    {step === 2 && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">← Back</button>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">👨‍💼 Choose Barber</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {staff.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => { setSelected({ ...selected, staff: s }); setStep(3) }}
                                        className="flex items-center gap-3 p-4 border-2 border-gray-100 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                                    >
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                                            💇
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{s.name}</h3>
                                            <p className="text-sm text-gray-400">{s.specialization || 'Hair Expert'}</p>
                                            <p className="text-xs text-yellow-500">⭐ {s.avg_rating || '4.5'}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Date & Time */}
                    {step === 3 && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <button onClick={() => setStep(2)} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">← Back</button>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">📅 Pick Date & Time</h2>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                                <input
                                    type="date"
                                    min={today}
                                    value={selected.date}
                                    onChange={e => setSelected({ ...selected, date: e.target.value, slot: null })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
                                />
                            </div>

                            {selected.date && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Time Slot</label>
                                    {loading ? (
                                        <p className="text-gray-400 text-center py-4">Loading slots...</p>
                                    ) : slots.length === 0 ? (
                                        <p className="text-gray-400 text-center py-4">No slots available</p>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {slots.map(slot => (
                                                <button
                                                    key={slot.id}
                                                    disabled={slot.available <= 0}
                                                    onClick={() => { setSelected({ ...selected, slot }); setStep(4) }}
                                                    className={`py-3 px-2 rounded-xl text-sm font-medium border-2 transition-all ${slot.available <= 0
                                                        ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                                        : selected.slot?.id === slot.id
                                                            ? 'border-purple-600 bg-purple-600 text-white'
                                                            : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                                                        }`}
                                                >
                                                    {slot.slot_time?.slice(0, 5)}
                                                    {slot.available <= 0 && <div className="text-xs text-red-300">Full</div>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 4: Details */}
                    {step === 4 && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <button onClick={() => setStep(3)} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">← Back</button>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Additional Details</h2>

                            {/* Booking Type */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Booking Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['salon', 'home_service'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setSelected({ ...selected, bookingType: type })}
                                            className={`py-3 rounded-xl font-medium border-2 transition-all ${selected.bookingType === type
                                                ? 'border-purple-600 bg-purple-600 text-white'
                                                : 'border-gray-200 hover:border-purple-400'
                                                }`}
                                        >
                                            {type === 'salon' ? '🏪 Visit Salon' : '🏠 Home Service'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selected.bookingType === 'home_service' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Address</label>
                                    <textarea
                                        placeholder="Enter your full address for home service..."
                                        value={selected.homeAddress}
                                        onChange={e => setSelected({ ...selected, homeAddress: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 h-24 resize-none"
                                    />
                                </div>
                            )}

                            {/* PAYMENT MODE - Cash/Online/Pay Later */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">💳 Payment Mode</label>
                                <div className="space-y-3">
                                    {[
                                        { value: 'online', icon: '💳', label: 'Pay Online Now', desc: 'UPI, Card, Wallet via Razorpay' },
                                        { value: 'cash', icon: '💵', label: 'Pay Cash at Salon', desc: 'Pay in cash when you arrive' },
                                        { value: 'pay_later', icon: '🕐', label: 'Pay After Service', desc: 'Pay after service is done' },
                                    ].map(pm => (
                                        <button
                                            key={pm.value}
                                            onClick={() => setSelected({ ...selected, paymentMode: pm.value })}
                                            className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl transition-all text-left ${selected.paymentMode === pm.value
                                                ? 'border-purple-600 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300'
                                                }`}
                                        >
                                            <span className="text-2xl">{pm.icon}</span>
                                            <div>
                                                <p className="font-semibold text-gray-800">{pm.label}</p>
                                                <p className="text-sm text-gray-400">{pm.desc}</p>
                                            </div>
                                            <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected.paymentMode === pm.value ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                                                }`}>
                                                {selected.paymentMode === pm.value && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                                <textarea
                                    placeholder="Any special requests..."
                                    value={selected.notes}
                                    onChange={e => setSelected({ ...selected, notes: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 h-20 resize-none"
                                />
                            </div>

                            <button
                                onClick={() => setStep(5)}
                                className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700"
                            >
                                Continue →
                            </button>
                        </div>
                    )}

                    {/* STEP 5: Confirm */}
                    {step === 5 && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <button onClick={() => setStep(4)} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">← Back</button>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">✅ Confirm Booking</h2>

                            <div className="bg-gray-50 rounded-xl p-5 space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Service</span>
                                    <span className="font-semibold">{selected.service?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Barber</span>
                                    <span className="font-semibold">{selected.staff?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date</span>
                                    <span className="font-semibold">{selected.date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Time</span>
                                    <span className="font-semibold">{selected.slot?.slot_time?.slice(0, 5)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Type</span>
                                    <span className="font-semibold capitalize">{selected.bookingType.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Payment</span>
                                    <span className="font-semibold capitalize">
                                        {selected.paymentMode === 'online' ? '💳 Online' :
                                            selected.paymentMode === 'cash' ? '💵 Cash' : '🕐 Pay Later'}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 flex justify-between">
                                    <span className="font-bold text-gray-800">Total</span>
                                    <span className="font-bold text-purple-600 text-xl">
                                        ₹{selected.service?.final_price}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={loading}
                                className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' :
                                    selected.paymentMode === 'online' ? '💳 Pay & Confirm' :
                                        selected.paymentMode === 'cash' ? '💵 Book (Pay Cash)' :
                                            '🕐 Book (Pay Later)'}
                            </button>
                        </div>
                    )}

                </div>
            )}

            {/* STEP 6: Success */}
            {step === 6 && booking && (
                <div className="max-w-lg mx-auto px-4 py-16 text-center">
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">🎉</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-500 mb-6">
                            Your appointment has been booked successfully.
                        </p>

                        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
                            <p className="text-sm text-gray-500">Booking ID: <span className="font-mono text-xs">{booking.booking_id?.slice(0, 8)}...</span></p>
                            <p className="text-sm text-gray-500">Queue Position: <span className="font-bold text-purple-600">#{booking.queue_position}</span></p>
                            <p className="text-sm text-gray-500">
                                Payment: <span className="font-medium">
                                    {selected.paymentMode === 'cash' ? '💵 Pay cash at salon' :
                                        selected.paymentMode === 'pay_later' ? '🕐 Pay after service' :
                                            '✅ Paid online'}
                                </span>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700"
                            >
                                My Bookings
                            </button>
                            <button
                                onClick={() => navigate(`/queue/${salonId}`)}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200"
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