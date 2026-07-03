import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import PrivateRoute from './components/common/PrivateRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Classes from './pages/Classes'
import Trainers from './pages/Trainers'
import Memberships from './pages/Memberships'
import Payments from './pages/Payments'
import Attendance from './pages/Attendance'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import VendorPanel from './pages/VendorPanel'

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Member-only routes */}
            <Route path="/dashboard"   element={<PrivateRoute memberOnly><Dashboard /></PrivateRoute>} />
            <Route path="/classes"     element={<PrivateRoute memberOnly><Classes /></PrivateRoute>} />
            <Route path="/trainers"    element={<PrivateRoute memberOnly><Trainers /></PrivateRoute>} />
            <Route path="/memberships" element={<PrivateRoute memberOnly><Memberships /></PrivateRoute>} />
            <Route path="/payments"    element={<PrivateRoute memberOnly><Payments /></PrivateRoute>} />
            <Route path="/attendance"  element={<PrivateRoute memberOnly><Attendance /></PrivateRoute>} />
            <Route path="/profile"     element={<PrivateRoute memberOnly><Profile /></PrivateRoute>} />

            {/* Admin routes */}
            <Route path="/admin/*" element={<PrivateRoute adminOnly><AdminPanel /></PrivateRoute>} />

            {/* Trainer routes */}
            <Route path="/trainer/*" element={<PrivateRoute trainerOnly><VendorPanel /></PrivateRoute>} />
            <Route path="/vendor/*" element={<PrivateRoute vendorOnly><VendorPanel /></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontSize: '14px' } }} />
      </AuthProvider>
    </Router>
  )
}
