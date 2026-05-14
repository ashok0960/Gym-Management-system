import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardAPI } from '../services/api'
import Spinner from '../components/common/Spinner'
import Attendance from './Attendance'
import AdminMembers from './admin/Members'
import AdminTrainers from './admin/Trainers'
import AdminClasses from './admin/Classes'
import AdminMemberships from './admin/Memberships'
import AdminPayments from './admin/Payments'
import AdminReports from './admin/Reports'
import { UsersIcon, CalendarIcon, CurrencyDollarIcon, ClipboardDocumentListIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#FF5722', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0']

export default function AdminPanel() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/members" element={<AdminMembers />} />
      <Route path="/trainers" element={<AdminTrainers />} />
      <Route path="/classes" element={<AdminClasses />} />
      <Route path="/memberships" element={<AdminMemberships />} />
      <Route path="/payments" element={<AdminPayments />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route path="/reports" element={<AdminReports />} />
    </Routes>
  )
}

function StatCard({ label, value, Icon, from, to }) {
  return (
    <div className={`rounded-2xl p-5 text-white bg-gradient-to-br ${from} ${to}`}>
      <Icon className="w-6 h-6 mb-2 opacity-80" />
      <p className="text-xs opacity-90">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { dashboardAPI.getStats().then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false)) }, [])
  if (loading) return <Spinner />

  const memberDist = (stats?.membership_distribution || []).map(m => ({ name: m.membership_type, value: m.count }))

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-900 to-red-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-2xl">🛡️</div>
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-red-200 text-sm">Welcome back, {user?.username} · Full system access</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Members" value={stats?.total_members ?? 0} Icon={UsersIcon} from="from-blue-500" to="to-blue-600" />
        <StatCard label="Active Members" value={stats?.active_members ?? 0} Icon={UsersIcon} from="from-green-500" to="to-green-600" />
        <StatCard label="Today's Classes" value={stats?.todays_classes ?? 0} Icon={CalendarIcon} from="from-orange-500" to="to-orange-600" />
        <StatCard label="Revenue (Month)" value={`Rs. ${stats?.revenue_this_month ?? 0}`} Icon={CurrencyDollarIcon} from="from-purple-500" to="to-purple-600" />
        <StatCard label="Attendance Today" value={stats?.attendance_today ?? 0} Icon={ClipboardDocumentListIcon} from="from-teal-500" to="to-teal-600" />
        <StatCard label="New Members/Month" value={stats?.new_members_this_month ?? 0} Icon={UsersIcon} from="from-pink-500" to="to-pink-600" />
        <StatCard label="Total Bookings" value={stats?.total_bookings ?? 0} Icon={CalendarIcon} from="from-indigo-500" to="to-indigo-600" />
        <StatCard label="Total Revenue" value={`Rs. ${stats?.total_revenue ?? 0}`} Icon={CurrencyDollarIcon} from="from-yellow-500" to="to-yellow-600" />
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
              <Pie data={memberDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}:${value}`} labelLine={false}>
                {memberDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Recent Payments</h2>
        {(stats?.recent_payments || []).length === 0
          ? <p className="text-gray-400 text-center py-4">No payments yet</p>
          : (
            <div className="divide-y divide-gray-100">
              {stats.recent_payments.map((p, i) => (
                <div key={i} className="flex justify-between items-center py-3">
                  <div><p className="font-medium text-sm">{p.member}</p><p className="text-xs text-gray-400">{p.date}</p></div>
                  <span className="text-green-600 font-semibold">Rs. {p.amount}</span>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
