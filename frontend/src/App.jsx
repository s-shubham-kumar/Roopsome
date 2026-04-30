import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/login'
import Signup from './pages/signup'
import Salons from './pages/Salon'
import SalonDetail from './pages/salondetail'
import Booking from './pages/Booking'
import Queue from './pages/Queue'
import CustomerDashboard from './pages/CustomerDashboard'
import BarberDashboard from './pages/BarberDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/salons" element={<Salons />} />
        <Route path="/salons/:id" element={<SalonDetail />} />
        <Route path="/booking/:salonId" element={<Booking />} />
        <Route path="/queue/:salonId" element={<Queue />} />
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/barber" element={<BarberDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App