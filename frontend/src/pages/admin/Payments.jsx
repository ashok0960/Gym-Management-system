import React, { useState, useEffect } from 'react'
import { paymentAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { MagnifyingGlassIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await paymentAPI.getAll()
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || [])
        setPayments(data)
        setFiltered(data)
      } catch (e) {
        toast.error('Failed to load payments')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let data = [...payments]

    // status filter
    if (statusFilter !== 'ALL') {
      data = data.filter(p => p?.status === statusFilter)
    }

    // search filter
    if (search.trim()) {
      const s = search.toLowerCase()

      data = data.filter(p => {
        return (
          p?.member_details?.username?.toLowerCase().includes(s) ||
          p?.member_details?.email?.toLowerCase().includes(s) ||
          p?.transaction_id?.toLowerCase().includes(s)
        )
      })
    }

    setFiltered(data)
  }, [search, statusFilter, payments])

  const total = filtered.reduce((sum, p) => {
    const amount = Number(p?.amount || 0)
    return sum + amount
  }, 0)

  if (loading) return <Spinner />

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-gray-800">
          All Payments ({filtered.length})
        </h2>

        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
          <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-semibold">
            Total: Rs. {total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search member, email, transaction..."
            className="input-field pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input-field w-auto"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">

            <thead className="table-head">
              <tr>
                {['Date', 'Member', 'Plan', 'Amount', 'Method', 'Transaction ID', 'Status']
                  .map(h => (
                    <th key={h} className="px-4 py-3 text-left">
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-gray-400">
                    No payments found
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const date = p?.payment_date ? new Date(p.payment_date) : null

                  return (
                    <tr key={p.id} className="hover:bg-gray-50">

                      <td className="table-cell">
                        {date && !isNaN(date)
                          ? date.toLocaleDateString()
                          : '—'}
                      </td>

                      <td className="table-cell font-medium">
                        {p?.member_details?.username || '—'}
                        <br />
                        <span className="text-xs text-gray-400">
                          {p?.member_details?.email || ''}
                        </span>
                      </td>

                      <td className="table-cell">
                        {p?.plan_details?.name || '—'}
                      </td>

                      <td className="table-cell font-semibold text-green-700">
                        Rs. {Number(p?.amount || 0).toFixed(2)}
                      </td>

                      <td className="table-cell">
                        {p?.payment_method || '—'}
                      </td>

                      <td className="table-cell text-xs text-gray-400 font-mono">
                        {p?.transaction_id || '—'}
                      </td>

                      <td className="table-cell">
                        <span
                          className={
                            p?.status === 'COMPLETED'
                              ? 'badge-green'
                              : p?.status === 'FAILED'
                              ? 'badge-red'
                              : p?.status === 'REFUNDED'
                              ? 'badge-purple'
                              : 'badge-yellow'
                          }
                        >
                          {p?.status || 'UNKNOWN'}
                        </span>
                      </td>

                    </tr>
                  )
                })
              )}

            </tbody>

          </table>
        </div>
      </div>

    </div>
  )
}