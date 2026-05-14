import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Spinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

const PrivateRoute = ({ children, adminOnly = false, vendorOnly = false, trainerOnly = false, memberOnly = false }) => {
  const { isAuthenticated, isAdmin, isTrainer, isVendor, loading } = useAuth()
  if (loading) return <Spinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to={isTrainer || isVendor ? '/trainer' : '/dashboard'} replace />
  if ((trainerOnly || vendorOnly) && !isTrainer && !isVendor && !isAdmin) return <Navigate to="/dashboard" replace />
  if (memberOnly && (isAdmin || isTrainer || isVendor)) return <Navigate to={isAdmin ? '/admin' : '/trainer'} replace />
  return children
}

export default PrivateRoute
