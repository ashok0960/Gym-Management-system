import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Spinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

const PrivateRoute = ({ children, adminOnly = false, vendorOnly = false, memberOnly = false }) => {
  const { isAuthenticated, isAdmin, isVendor, loading } = useAuth()
  if (loading) return <Spinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to={isVendor ? '/vendor' : '/dashboard'} replace />
  if (vendorOnly && !isVendor && !isAdmin) return <Navigate to="/dashboard" replace />
  if (memberOnly && (isAdmin || isVendor)) return <Navigate to={isAdmin ? '/admin' : '/vendor'} replace />
  return children
}

export default PrivateRoute
