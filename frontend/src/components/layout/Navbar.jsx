import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  HomeIcon, CalendarIcon, UserGroupIcon, CreditCardIcon,
  ClipboardDocumentListIcon, UserIcon, ArrowRightOnRectangleIcon,
  Bars3Icon, XMarkIcon, ChevronDownIcon, ShieldCheckIcon,
  BuildingStorefrontIcon, CurrencyDollarIcon, ChartBarIcon,
} from '@heroicons/react/24/outline'

const NAV = {
  member: [
    { to: '/dashboard', label: 'Dashboard', Icon: HomeIcon },
    { to: '/classes', label: 'Classes', Icon: CalendarIcon },
    { to: '/trainers', label: 'Trainers', Icon: UserGroupIcon },
    { to: '/memberships', label: 'Memberships', Icon: CreditCardIcon },
    { to: '/payments', label: 'Payments', Icon: CurrencyDollarIcon },
    { to: '/attendance', label: 'Attendance', Icon: ClipboardDocumentListIcon },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', Icon: HomeIcon },
    { to: '/admin/members', label: 'Members', Icon: UserGroupIcon },
    { to: '/admin/trainers', label: 'Trainers', Icon: UserGroupIcon },
    { to: '/admin/classes', label: 'Classes', Icon: CalendarIcon },
    { to: '/admin/payments', label: 'Payments', Icon: CurrencyDollarIcon },
    { to: '/admin/attendance', label: 'Attendance', Icon: ClipboardDocumentListIcon },
    { to: '/admin/reports', label: 'Reports', Icon: ChartBarIcon },
  ],
  vendor: [
    { to: '/vendor', label: 'Dashboard', Icon: HomeIcon },
    { to: '/vendor/members', label: 'Members', Icon: UserGroupIcon },
    { to: '/vendor/classes', label: 'Classes', Icon: CalendarIcon },
    { to: '/vendor/trainers', label: 'Trainers', Icon: UserGroupIcon },
    { to: '/vendor/payments', label: 'Payments', Icon: CurrencyDollarIcon },
    { to: '/vendor/attendance', label: 'Attendance', Icon: ClipboardDocumentListIcon },
  ],
}

export default function Navbar() {
  const { user, logout, isAdmin, isVendor } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [mobile, setMobile] = useState(false)
  const [drop, setDrop] = useState(false)
  const dropRef = useRef(null)

  const items = isAdmin ? NAV.admin : isVendor ? NAV.vendor : NAV.member
  const roleLabel = isAdmin ? 'Admin' : isVendor ? 'Vendor' : 'Member'
  const roleCls = isAdmin ? 'badge-red' : isVendor ? 'badge-purple' : 'badge-green'
  const RoleIcon = isAdmin ? ShieldCheckIcon : isVendor ? BuildingStorefrontIcon : UserIcon

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDrop(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => setMobile(false), [pathname])

  const active = (to) => pathname === to || (to.length > 1 && pathname.startsWith(to + '/'))

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to={isAdmin ? '/admin' : isVendor ? '/vendor' : '/dashboard'} className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <span className="font-bold text-xl text-gray-800">Gym<span className="text-primary">MS</span></span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {items.map(({ to, label, Icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active(to) ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className={`hidden md:flex items-center gap-1 ${roleCls}`}>
            <RoleIcon className="w-3 h-3" />{roleLabel}
          </span>

          <div className="relative" ref={dropRef}>
            <button onClick={() => setDrop(!drop)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-all">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{user?.username?.[0]?.toUpperCase()}</span>
              </div>
              <span className="hidden md:block text-sm font-medium">{user?.username}</span>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${drop ? 'rotate-180' : ''}`} />
            </button>

            {drop && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-sm">{user?.username}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <Link to="/profile" onClick={() => setDrop(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <UserIcon className="w-4 h-4" /> My Profile
                </Link>
                <button onClick={() => { logout(); navigate('/login') }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <ArrowRightOnRectangleIcon className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>

          <button onClick={() => setMobile(!mobile)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            {mobile ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobile && (
        <div className="lg:hidden border-t border-gray-100 px-4 py-3 space-y-1">
          {items.map(({ to, label, Icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${active(to) ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
          <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            <UserIcon className="w-4 h-4" /> Profile
          </Link>
          <button onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">
            <ArrowRightOnRectangleIcon className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </nav>
  )
}
