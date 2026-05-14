import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  HomeIcon, UsersIcon, UserGroupIcon, CalendarIcon, CurrencyDollarIcon,
  ClipboardDocumentListIcon, CreditCardIcon,
  ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon, ChevronDownIcon, BuildingStorefrontIcon,
} from '@heroicons/react/24/outline'

const LINKS = [
  { to: '/vendor', label: 'Dashboard', Icon: HomeIcon },
  { to: '/vendor/members', label: 'Members', Icon: UsersIcon },
  { to: '/vendor/trainers', label: 'Trainers', Icon: UserGroupIcon },
  { to: '/vendor/classes', label: 'Classes', Icon: CalendarIcon },
  { to: '/vendor/memberships', label: 'Plans', Icon: CreditCardIcon },
  { to: '/vendor/payments', label: 'Payments', Icon: CurrencyDollarIcon },
  { to: '/vendor/attendance', label: 'Attendance', Icon: ClipboardDocumentListIcon },
]

export default function VendorNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [mobile, setMobile] = useState(false)
  const [drop, setDrop] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDrop(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  useEffect(() => setMobile(false), [pathname])

  const active = (to) => to === '/vendor' ? pathname === to : pathname.startsWith(to)
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="bg-purple-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/vendor" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center">
            <BuildingStorefrontIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">Gym<span className="text-purple-300">MS</span></span>
          <span className="text-xs bg-purple-500 px-2 py-0.5 rounded-full font-semibold hidden sm:inline">VENDOR</span>
        </Link>

        <div className="hidden xl:flex items-center gap-0.5">
          {LINKS.map(({ to, label, Icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active(to) ? 'bg-purple-600 text-white' : 'text-purple-200 hover:bg-purple-800 hover:text-white'}`}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={dropRef}>
            <button onClick={() => setDrop(!drop)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-purple-800 transition-all">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{user?.username?.[0]?.toUpperCase()}</span>
              </div>
              <span className="hidden md:block text-sm font-medium">{user?.username}</span>
              <ChevronDownIcon className={`w-4 h-4 text-purple-300 transition-transform ${drop ? 'rotate-180' : ''}`} />
            </button>
            {drop && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    <BuildingStorefrontIcon className="w-3 h-3" /> Vendor
                  </span>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <ArrowRightOnRectangleIcon className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
          <button onClick={() => setMobile(!mobile)} className="xl:hidden p-2 rounded-lg hover:bg-purple-800">
            {mobile ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobile && (
        <div className="xl:hidden border-t border-purple-800 px-4 py-3 space-y-1">
          {LINKS.map(({ to, label, Icon }) => (
            <Link key={to} to={to} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${active(to) ? 'bg-purple-600 text-white' : 'text-purple-200 hover:bg-purple-800'}`}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-purple-800 rounded-lg">
            <ArrowRightOnRectangleIcon className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </nav>
  )
}
