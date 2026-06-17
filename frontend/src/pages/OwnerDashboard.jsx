import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import BASE_URL from '../utils/api'
import { supabase } from '../utils/supabase'

const api = (path) => `${BASE_URL}${path}`
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

export default function OwnerDashboard() {
    const navigate = useNavigate()
    const [tab, setTab] = useState('queue')
    const [salon, setSalon] = useState(null)
    const [queue, setQueue] = useState([])
    const [staff, setStaff] = useState([])
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [salonForm, setSalonForm] = useState({
        name: '', address: '', city: '', phone: '', description: '',
        opening_time: '09:00', closing_time: '21:00'
    })
    const [newStaff, setNewStaff] = useState({ name: '', phone: '', specialization: '' })
    const [newService, setNewService] = useState({ name: '', base_price: '', duration_minutes: '30', category: 'haircut' })
    const [addingCustomer, setAddingCustomer] = useState(false)
    const [editingService, setEditingService] = useState(null)
    const [editForm, setEditForm] = useState({ name: '', base_price: '', duration_minutes: '' })
    const [customerForm, setCustomerForm] = useState({ customer_name: '', phone: '', service_id: '', staff_id: '' })
    const fullName = localStorage.getItem('fullName') || 'Owner'

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        if (localStorage.getItem('userType') !== 'salon_owner') { navigate('/'); return }
        fetchMySalon()
    }, [])

    const fetchMySalon = async () => {
        try {
            const res = await axios.get(api('/api/v1/my-salon'), { headers: headers() })
            setSalon(res.data)
            fetchQueue(res.data.id)
            fetchStaff(res.data.id)
            fetchServices(res.data.id)
        } catch {
            setLoading(false)
        }
    }

    const fetchQueue = async (sid) => {
        try {
            const res = await axios.get(api(`/api/v1/queue/${sid}`), { headers: headers() })
            setQueue(res.data)
        } catch { }
        setLoading(false)
    }

    const fetchStaff = async (sid) => {
        try {
            const res = await axios.get(api(`/api/v1/salons/${sid}/staff`), { headers: headers() })
            setStaff(res.data)
        } catch { }
    }

    const fetchServices = async (sid) => {
        try {
            const res = await axios.get(api(`/api/v1/salons/${sid}/services`), { headers: headers() })
            setServices(res.data)
        } catch { }
    }

    const createSalon = async (e) => {
        e.preventDefault()
        setCreating(true)
        try {
            const res = await axios.post(api('/api/v1/salons'), salonForm, { headers: headers() })
            await fetchMySalon()
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create salon')
        }
        setCreating(false)
    }

    const addStaff = async (e) => {
        e.preventDefault()
        try {
            await axios.post(api(`/api/v1/salons/${salon.id}/staff`), newStaff, { headers: headers() })
            setNewStaff({ name: '', phone: '', specialization: '' })
            fetchStaff(salon.id)
        } catch (err) { alert(err.response?.data?.error || 'Failed') }
    }

    const addService = async (e) => {
        e.preventDefault()
        try {
            await axios.post(api(`/api/v1/salons/${salon.id}/services`),
                { ...newService, base_price: parseFloat(newService.base_price) },
                { headers: headers() })
            setNewService({ name: '', base_price: '', duration_minutes: '30', category: 'haircut' })
            fetchServices(salon.id)
        } catch (err) { alert(err.response?.data?.error || 'Failed') }
    }

    const addToQueue = async (e) => {
        e.preventDefault()
        try {
            await axios.post(api(`/api/v1/queue/${salon.id}/walk-in`),
                customerForm, { headers: headers() })
            setCustomerForm({ customer_name: '', phone: '', service_id: '', staff_id: '' })
            setAddingCustomer(false)
            fetchQueue(salon.id)
        } catch (err) { alert(err.response?.data?.error || 'Failed to add customer') }
    }

    const markDone = async (bookingId) => {
        try {
            await axios.put(api(`/api/v1/bookings/${bookingId}/complete`), {}, { headers: headers() })
            fetchQueue(salon.id)
        } catch { }
    }
    const removeStaff = async (staffId) => {
        if (!window.confirm('Remove this staff member?')) return
        try {
            await axios.delete(api(`/api/v1/salons/${salon.id}/staff/${staffId}`), { headers: headers() })
            fetchStaff(salon.id)
        } catch { alert('Failed to remove') }
    }

    const removeService = async (serviceId) => {
        if (!window.confirm('Remove this service?')) return
        try {
            await axios.delete(api(`/api/v1/salons/${salon.id}/services/${serviceId}`), { headers: headers() })
            fetchServices(salon.id)
        } catch { alert('Failed to remove') }
    }

    const deleteAccount = async () => {
        if (!window.confirm('Are you sure? This will permanently delete your account!')) return
        if (!window.confirm('Last warning — account will be deleted. Continue?')) return
        try {
            await axios.delete(api('/api/v1/account'), { headers: headers() })
            localStorage.clear()
            navigate('/')
        } catch { alert('Failed to delete account') }
    }

    const startEdit = (s) => {
        setEditingService(s.id)
        setEditForm({ name: s.name, base_price: s.base_price, duration_minutes: s.duration_minutes })
    }

    const saveEdit = async (serviceId) => {
        try {
            await axios.put(
                api(`/api/v1/salons/${salon.id}/services/${serviceId}`),
                { ...editForm, base_price: parseFloat(editForm.base_price) },
                { headers: headers() }
            )
            setEditingService(null)
            fetchServices(salon.id)
        } catch { alert('Failed to update') }
    }
    const uploadPhoto = async (file) => {
        if (!file || !salon) return
        try {
            const ext = file.name.split('.').pop()
            const fileName = `${salon.id}.${ext}`
            const { data, error } = await supabase.storage
                .from('Salon-image')
                .upload(fileName, file, { upsert: true })
            if (error) throw error
            const { data: urlData } = supabase.storage
                .from('Salon-image')
                .getPublicUrl(fileName)
            await axios.put(
                api(`/api/v1/salons/${salon.id}/image`),
                { image_url: urlData.publicUrl },
                { headers: headers() }
            )
            setSalon({ ...salon, image_url: urlData.publicUrl })
            alert('Photo uploaded!')
        } catch (err) {
            alert('Upload failed: ' + err.message)
        }
    }
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-purple-600 text-lg">Loading...</div>
        </div>
    )

    // ── Create Salon Screen ──────────────────────────────────────────
    if (!salon) return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <span className="text-purple-600 font-bold text-xl">🪒 Roopsome</span>
                <button onClick={() => { localStorage.clear(); navigate('/') }}
                    className="text-red-500 text-sm font-medium">Logout</button>
            </nav>
            <div className="max-w-lg mx-auto mt-16 px-4">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Setup Your Salon</h2>
                    <p className="text-gray-500 mb-6">Fill in your salon details to get started</p>
                    <form onSubmit={createSalon} className="space-y-4">
                        <input required placeholder="Salon Name *" value={salonForm.name}
                            onChange={e => setSalonForm({ ...salonForm, name: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500" />
                        <input required placeholder="Address *" value={salonForm.address}
                            onChange={e => setSalonForm({ ...salonForm, address: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500" />
                        <input required placeholder="City *" value={salonForm.city}
                            onChange={e => setSalonForm({ ...salonForm, city: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500" />
                        <input placeholder="Phone" value={salonForm.phone}
                            onChange={e => setSalonForm({ ...salonForm, phone: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500" />
                        <textarea placeholder="Description" value={salonForm.description}
                            onChange={e => setSalonForm({ ...salonForm, description: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 h-24 resize-none" />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Opening Time</label>
                                <input type="time" value={salonForm.opening_time}
                                    onChange={e => setSalonForm({ ...salonForm, opening_time: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Closing Time</label>
                                <input type="time" value={salonForm.closing_time}
                                    onChange={e => setSalonForm({ ...salonForm, closing_time: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500" />
                            </div>
                        </div>
                        <button type="submit" disabled={creating}
                            className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50">
                            {creating ? 'Creating...' : '🚀 Create My Salon'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )

    // ── Main Dashboard ───────────────────────────────────────────────
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
    const waiting = queue.filter(q => q.status === 'waiting').length
    const inService = queue.filter(q => q.status === 'in_service').length

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <div>
                    <span className="text-purple-600 font-bold text-xl">🪒 {salon.name}</span>
                    <span className="text-gray-400 text-sm ml-3">{today}</span>
                    <div className="flex items-center gap-2 mt-1">
                        {salon.image_url && (
                            <img src={salon.image_url} alt="salon"
                                className="w-8 h-8 rounded-lg object-cover border border-purple-200" />
                        )}
                        <label className="text-xs text-purple-500 cursor-pointer hover:text-purple-700 font-medium">
                            📷 {salon.image_url ? 'Change Photo' : 'Add Salon Photo'}
                            <input type="file" accept="image/*" className="hidden"
                                onChange={e => uploadPhoto(e.target.files[0])} />
                        </label>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600 text-sm">👋 {fullName}</span>
                    <button onClick={() => { localStorage.clear(); navigate('/') }}
                        className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-sm font-medium">Logout</button>
                </div>
            </nav>

            {/* Stats Bar */}
            <div className="bg-purple-600 text-white px-6 py-4">
                <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold">{queue.length}</div>
                        <div className="text-purple-200 text-sm">Total Today</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{waiting}</div>
                        <div className="text-purple-200 text-sm">Waiting</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{inService}</div>
                        <div className="text-purple-200 text-sm">In Service</div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit">
                    {[['queue', '📋 Queue'], ['staff', '👥 Staff'], ['services', '✂️ Services']].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* QUEUE TAB */}
                {tab === 'queue' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Today's Queue</h2>
                            <button onClick={() => setAddingCustomer(true)}
                                className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700">
                                + Add Customer
                            </button>
                        </div>

                        {addingCustomer && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
                                <h3 className="font-bold text-gray-800 mb-4">Add Walk-in Customer</h3>
                                <form onSubmit={addToQueue} className="grid grid-cols-2 gap-3">
                                    <input required placeholder="Customer Name" value={customerForm.customer_name}
                                        onChange={e => setCustomerForm({ ...customerForm, customer_name: e.target.value })}
                                        className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 text-sm" />
                                    <input placeholder="Phone (optional)" value={customerForm.phone}
                                        onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                                        className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 text-sm" />
                                    <select required value={customerForm.service_id}
                                        onChange={e => setCustomerForm({ ...customerForm, service_id: e.target.value })}
                                        className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 text-sm">
                                        <option value="">Select Service *</option>
                                        {services.map(s => <option key={s.id} value={s.id}>{s.name} — ₹{s.final_price}</option>)}
                                    </select>
                                    <select required value={customerForm.staff_id}
                                        onChange={e => setCustomerForm({ ...customerForm, staff_id: e.target.value })}
                                        className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 text-sm">
                                        <option value="">Select Staff *</option>
                                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <button type="submit"
                                        className="bg-purple-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700">
                                        Add to Queue
                                    </button>
                                    <button type="button" onClick={() => setAddingCustomer(false)}
                                        className="border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm font-medium">
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        )}

                        {queue.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                                <div className="text-4xl mb-3">😴</div>
                                <p className="text-gray-500">No customers in queue today</p>
                                <p className="text-gray-400 text-sm mt-1">Click "Add Customer" to add a walk-in</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {queue.map((item, i) => (
                                    <div key={item.booking_id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${i === 0 ? 'bg-green-500' : 'bg-purple-400'}`}>
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{item.customer_name}</p>
                                                <p className="text-gray-500 text-sm">{item.service_name} • {item.staff_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400 text-sm">~{item.estimated_wait_minutes} min wait</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                {item.status}
                                            </span>
                                            {item.status !== 'completed' && (
                                                <button onClick={() => markDone(item.booking_id)}
                                                    className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600">
                                                    ✓ Done
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* STAFF TAB */}
                {tab === 'staff' && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Staff Members</h2>
                        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
                            <h3 className="font-semibold text-gray-700 mb-3">Add New Staff</h3>
                            <form onSubmit={addStaff} className="grid grid-cols-3 gap-3">
                                <input required placeholder="Name *" value={newStaff.name}
                                    onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 text-sm" />
                                <input placeholder="Phone" value={newStaff.phone}
                                    onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 text-sm" />
                                <input placeholder="Specialization" value={newStaff.specialization}
                                    onChange={e => setNewStaff({ ...newStaff, specialization: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 text-sm" />
                                <button type="submit"
                                    className="bg-purple-600 text-white py-2.5 rounded-xl text-sm font-medium col-span-3 hover:bg-purple-700">
                                    + Add Staff Member
                                </button>
                            </form>
                        </div>
                        <div className="space-y-3">
                            {staff.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400">No staff added yet</div>
                            ) : staff.map(s => (
                                <div key={s.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                                        {s.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{s.name}</p>
                                        <p className="text-gray-400 text-sm">{s.specialization || 'General'} {s.phone ? `• ${s.phone}` : ''}</p>
                                    </div>
                                    <button onClick={() => removeStaff(s.id)}
                                        className="ml-auto text-red-400 hover:text-red-600 text-sm font-medium px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50">
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SERVICES TAB */}
                {tab === 'services' && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Services</h2>
                        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
                            <h3 className="font-semibold text-gray-700 mb-3">Add New Service</h3>
                            <form onSubmit={addService} className="grid grid-cols-2 gap-3">
                                <input required placeholder="Service Name *" value={newService.name}
                                    onChange={e => setNewService({ ...newService, name: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 text-sm" />
                                <input required type="number" placeholder="Price (₹) *" value={newService.base_price}
                                    onChange={e => setNewService({ ...newService, base_price: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 text-sm" />
                                <input type="number" placeholder="Duration (minutes)" value={newService.duration_minutes}
                                    onChange={e => setNewService({ ...newService, duration_minutes: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 text-sm" />
                                <select value={newService.category}
                                    onChange={e => setNewService({ ...newService, category: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 text-sm">
                                    <option value="haircut">Haircut</option>
                                    <option value="shave">Shave</option>
                                    <option value="facial">Facial</option>
                                    <option value="massage">Massage</option>
                                    <option value="other">Other</option>
                                </select>
                                <button type="submit"
                                    className="bg-purple-600 text-white py-2.5 rounded-xl text-sm font-medium col-span-2 hover:bg-purple-700">
                                    + Add Service
                                </button>
                            </form>
                        </div>
                        <div className="space-y-3">
                            {services.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400">No services added yet</div>
                            ) : services.map(s => (
                                <div key={s.id} className="bg-white rounded-2xl shadow-sm p-4">
                                    {editingService === s.id ? (
                                        <div className="grid grid-cols-3 gap-3">
                                            <input value={editForm.name}
                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500"
                                                placeholder="Service name" />
                                            <input type="number" value={editForm.base_price}
                                                onChange={e => setEditForm({ ...editForm, base_price: e.target.value })}
                                                className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500"
                                                placeholder="Price ₹" />
                                            <input type="number" value={editForm.duration_minutes}
                                                onChange={e => setEditForm({ ...editForm, duration_minutes: e.target.value })}
                                                className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500"
                                                placeholder="Duration (min)" />
                                            <button onClick={() => saveEdit(s.id)}
                                                className="bg-purple-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-purple-700">
                                                Save
                                            </button>
                                            <button onClick={() => setEditingService(null)}
                                                className="border border-gray-200 text-gray-500 py-2 rounded-xl text-sm col-span-2">
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-800">{s.name}</p>
                                                <p className="text-gray-400 text-sm capitalize">{s.category} • {s.duration_minutes} min</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-purple-600 font-bold text-lg">₹{s.final_price}</span>
                                                <button onClick={() => startEdit(s)}
                                                    className="text-blue-400 hover:text-blue-600 text-sm font-medium px-3 py-1 border border-blue-200 rounded-lg hover:bg-blue-50">
                                                    Edit
                                                </button>
                                                <button onClick={() => removeService(s.id)}
                                                    className="text-red-400 hover:text-red-600 text-sm font-medium px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50">
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Danger Zone */}
                        <div className="mt-12 border border-red-200 rounded-2xl p-6 bg-red-50">
                            <h3 className="font-bold text-red-700 mb-1">Danger Zone</h3>
                            <p className="text-red-500 text-sm mb-4">
                                Deleting your account will remove all your salon data permanently.
                            </p>
                            <button onClick={deleteAccount}
                                className="bg-red-500 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-red-600">
                                Delete My Account
                            </button>
                        </div>
                    </div>
                )
                }
            </div>
        </div>
    )
}