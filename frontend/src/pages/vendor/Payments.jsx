import React, { useState, useEffect } from 'react'
import { paymentAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import {
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // LOAD PAYMENTS
  useEffect(() => {
    const load = async () => {
      try {
        const res = await paymentAPI.getAll()

        const data = Array.isArray(res?.data)
          ? res.data
          : res?.data?.results || []

        setPayments(data)
        setFiltered(data)
      } catch (error) {
        console.error(error)
        toast.error('Failed to load payments')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // FILTER LOGIC
  useEffect(() => {
    let data = [...payments]

    // STATUS FILTER (case-safe)
    if (statusFilter !== 'ALL') {
      data = data.filter(
        (p) =>
          (p.status || '')
            .toUpperCase() ===
          statusFilter.toUpperCase()
      )
    }

    // SEARCH FILTER (safe string handling)
    if (search.trim()) {
      const q = search.toLowerCase()

      data = data.filter((p) => {
        const username =
          p.member_details?.username?.toLowerCase() ||
          ''

        const email =
          p.member_details?.email?.toLowerCase() ||
          ''

        const txn =
          p.transaction_id?.toLowerCase() || ''

        return (
          username.includes(q) ||
          email.includes(q) ||
          txn.includes(q)
        )
      })
    }

    setFiltered(data)
  }, [search, statusFilter, payments])

  // TOTAL (safe number conversion)
  const total = filtered
    .filter(
      (p) =>
        (p.status || '').toUpperCase() === 'COMPLETED'
    )
    .reduce((sum, p) => {
      const amount = Number(p.amount || 0)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)

  if (loading) return <Spinner />

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-gray-800">
          Payments ({filtered.length})
        </h2>

        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
          <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-semibold">
            Total: Rs. {total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3">

        {/* SEARCH */}
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search member, email, transaction..."
            className="input-field pl-9"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* STATUS */}
        <select
          className="input-field w-auto"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="ALL">All Status</option>
          <option value="COMPLETED">
            Completed
          </option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">
            Refunded
          </option>
        </select>
      </div>

      {/* TABLE */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">

            <thead className="table-head">
              <tr>
                {[
                  'Date',
                  'Member',
                  'Plan',
                  'Amount',
                  'Method',
                  'Transaction ID',
                  'Status',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    No payments found
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50"
                  >

                    {/* DATE */}
                    <td className="table-cell">
                      {p.payment_date
                        ? new Date(
                            p.payment_date
                          ).toLocaleDateString()
                        : '-'}
                    </td>

                    {/* MEMBER */}
                    <td className="table-cell font-medium">
                      {p.member_details
                        ?.username || '-'}
                      <br />
                      <span className="text-xs text-gray-400">
                        {p.member_details?.email ||
                          ''}
                      </span>
                    </td>

                    {/* PLAN */}
                    <td className="table-cell">
                      {p.plan_details?.name || '—'}
                    </td>

                    {/* AMOUNT */}
                    <td className="table-cell font-semibold text-green-700">
                      Rs. {p.amount || 0}
                    </td>

                    {/* METHOD */}
                    <td className="table-cell">
                      {p.payment_method || '-'}
                    </td>

                    {/* TXN */}
                    <td className="table-cell text-xs text-gray-400 font-mono">
                      {p.transaction_id || '-'}
                    </td>

                    {/* STATUS */}
                    <td className="table-cell">
                      <span
                        className={
                          (p.status || '')
                            .toUpperCase() ===
                          'COMPLETED'
                            ? 'badge-green'
                            : (p.status || '')
                                .toUpperCase() ===
                              'FAILED'
                            ? 'badge-red'
                            : (p.status || '')
                                .toUpperCase() ===
                              'REFUNDED'
                            ? 'badge-purple'
                            : 'badge-yellow'
                        }
                      >
                        {p.status || 'UNKNOWN'}
                      </span>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>
        </div>
      </div>

    </div>
  )
}