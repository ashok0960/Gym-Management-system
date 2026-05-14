import React, { useState, useEffect } from 'react'
import { dashboardAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'

export default function AdminReports() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { dashboardAPI.getStats().then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false)) }, [])
  if (loading) return <Spinner />

  const rows = [
    ['Total Members', stats?.total_members], ['Active Members', stats?.active_members], ['Inactive Members', stats?.inactive_members],
    ['New Members (Month)', stats?.new_members_this_month], ['New Members (Week)', stats?.new_members_this_week],
    ['Total Classes', stats?.total_classes], ["Today's Classes", stats?.todays_classes],
    ['Total Bookings', stats?.total_bookings], ['Upcoming Bookings', stats?.upcoming_bookings],
    ['Total Revenue', `$${stats?.total_revenue}`], ['Revenue (Month)', `$${stats?.revenue_this_month}`],
    ['Attendance Today', stats?.attendance_today], ['Attendance (Week)', stats?.attendance_this_week],
  ]

  return (
    <div className="card">
      <h2 className="section-title">System Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600 text-sm">{label}</span>
            <span className="font-bold text-gray-800">{value ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
