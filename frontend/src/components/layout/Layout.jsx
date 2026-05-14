import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from './Navbar'
import AdminNavbar from './AdminNavbar'
import VendorNavbar from './VendorNavbar'
import Footer from './Footer'
import SupportWidget from '../common/SupportWidget'

export default function Layout({ children }) {
  const { isAuthenticated, isAdmin, isVendor } = useAuth()
  const { pathname } = useLocation()
  const isHomePage = pathname === '/home' || pathname === '/' || pathname === '/login' || pathname === '/register'

  const renderNavbar = () => {
    if (!isAuthenticated) return null
    if (isAdmin) return <AdminNavbar />
    if (isVendor) return <VendorNavbar />
    return <Navbar />
  }

  // Home page has its own navbar + footer
  if (isHomePage) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {renderNavbar()}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">{children}</main>
      <Footer />
      <SupportWidget />
    </div>
  )
}
