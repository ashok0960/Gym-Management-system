import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardAPI, classAPI } from '../services/api'
import Spinner from '../components/common/Spinner'
import { UsersIcon, CalendarIcon, CurrencyDollarIcon, ClipboardDocumentListIcon, CheckBadgeIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#FF5722', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0']

const StatCard = ({ label, value, Icon, from, to }) => (
  <div className={`rounded-2xl p-5 text-white bg-gradient-to-br ${from} ${to}`}>
    <Icon className="w-7 h-7 mb-2 opacity-80" />
    <p className="text-xs opacity-90 font-medium">{label}</p>
    <p className="text-2xl font-bold mt-0.5">{value}</p>
  </div>
)

export default function Dashboard() {
  const { user, isAdmin, isVendor, isMember } = useAuth()
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const promises = [classAPI.myBookings()]
        if (isAdmin || isVendor) promises.push(dashboardAPI.getStats())
        const results = await Promise.all(promises)
        setBookings(results[0].data.slice(0, 5))
        if (results[1]) setStats(results[1].data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <Spinner />

  if (isMember) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.first_name || user?.username}!</h1>
          <p className="text-gray-500 text-sm mt-1">Here's your fitness overview</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard label="Classes Booked" value={bookings.length} Icon={CalendarIcon} from="from-blue-500" to="to-blue-600" />
          <StatCard label="Membership" value={user?.membership_type || 'BASIC'} Icon={CheckBadgeIcon} from="from-orange-500" to="to-orange-600" />
          <StatCard label="Account Status" value={user?.is_active !== false ? 'Active' : 'Inactive'} Icon={ChartBarIcon} from="from-green-500" to="to-green-600" />
        </div>
        <div className="card">
          <h2 className="section-title">Recent Bookings</h2>
          {bookings.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <CalendarIcon className="w-12 h-12 mx-auto mb-2" />
              <p>No bookings yet. <Link to="/classes" className="text-primary hover:underline">Book a class</Link></p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.map(b => (
                <div key={b.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">{b.class_details?.name}</p>
                    <p className="text-xs text-gray-500">{b.class_details?.day_display} · {b.class_details?.start_time} – {b.class_details?.end_time}</p>
                  </div>
                  <span className={b.status === 'CONFIRMED' ? 'badge-green' : 'badge-red'}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Admin / Vendor
  const memberDist = (stats?.membership_distribution || []).map(m => ({ name: m.membership_type, value: m.count }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{isAdmin ? 'Admin' : 'Vendor'} Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.username}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Members" value={stats?.total_members ?? 0} Icon={UsersIcon} from="from-blue-500" to="to-blue-600" />
        <StatCard label="Active Members" value={stats?.active_members ?? 0} Icon={CheckBadgeIcon} from="from-green-500" to="to-green-600" />
        <StatCard label="Today's Classes" value={stats?.todays_classes ?? 0} Icon={CalendarIcon} from="from-orange-500" to="to-orange-600" />
        <StatCard label="Revenue (Month)" value={`$${stats?.revenue_this_month ?? 0}`} Icon={CurrencyDollarIcon} from="from-purple-500" to="to-purple-600" />
        <StatCard label="Attendance Today" value={stats?.attendance_today ?? 0} Icon={ClipboardDocumentListIcon} from="from-teal-500" to="to-teal-600" />
        <StatCard label="New Members/Month" value={stats?.new_members_this_month ?? 0} Icon={UsersIcon} from="from-pink-500" to="to-pink-600" />
        <StatCard label="Total Bookings" value={stats?.total_bookings ?? 0} Icon={CalendarIcon} from="from-indigo-500" to="to-indigo-600" />
        <StatCard label="Total Revenue" value={`$${stats?.total_revenue ?? 0}`} Icon={CurrencyDollarIcon} from="from-yellow-500" to="to-yellow-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats?.monthly_revenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#FF5722" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="section-title">Membership Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={memberDist} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {memberDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Recent Payments</h2>
        {(stats?.recent_payments || []).length === 0 ? (
          <p className="text-gray-400 text-center py-6">No payments yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.recent_payments.map((p, i) => (
              <div key={i} className="flex justify-between items-center py-3">
                <div>
                  <p className="font-medium text-sm">{p.member}</p>
                  <p className="text-xs text-gray-400">{p.date}</p>
                </div>
                <span className="text-green-600 font-semibold">${p.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
