import React, { useState, useEffect } from 'react'
import { paymentAPI, membershipAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'

import {
  CreditCardIcon,
  CurrencyDollarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const STATUS_CLS = {
  COMPLETED: 'badge-green',
  PENDING: 'badge-yellow',
  FAILED: 'badge-red',
  REFUNDED: 'badge-blue'
}

const METHODS = [
  'CASH',
  'CARD',
  'ONLINE',
  'KHALTI',
  'ESEWA'
]

export default function Payments() {

  const { isMember } = useAuth()

  const [payments, setPayments] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  const [modal, setModal] = useState(false)

  const [processing, setProcessing] = useState(false)

  const [form, setForm] = useState({
    membership_plan: '',
    payment_method: 'CARD',
    amount: ''
  })

  // LOAD DATA

  const load = async () => {

    try {

      setLoading(true)

      const [pRes, plRes] = await Promise.all([
        paymentAPI.getHistory(),
        membershipAPI.getPlans()
      ])

      console.log('Payments Response:', pRes.data)
      console.log('Plans Response:', plRes.data)

      // SAFE PAYMENTS
      const paymentsData = Array.isArray(pRes.data)
        ? pRes.data
        : pRes.data.results || pRes.data.data || []

      // SAFE PLANS
      const plansData = Array.isArray(plRes.data)
        ? plRes.data
        : plRes.data.results || plRes.data.data || []

      setPayments(paymentsData)

      setPlans(plansData)

    } catch (error) {

      console.error(error)

      toast.error('Failed to load data')

      setPayments([])
      setPlans([])

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {

    load()

  }, [])

  // SELECT PLAN

  const selectPlan = (id) => {

    const selectedPlan = plans.find(
      p => p.id === parseInt(id)
    )

    setForm({
      ...form,
      membership_plan: id,
      amount: selectedPlan
        ? selectedPlan.final_price || selectedPlan.price
        : ''
    })
  }

  // PAYMENT

  const pay = async () => {

    if (!form.membership_plan) {

      toast.error('Select a plan')

      return
    }

    setProcessing(true)

    try {

      await paymentAPI.create({

        amount: form.amount,

        payment_method: form.payment_method,

        membership_plan: form.membership_plan

      })

      toast.success('Payment successful!')

      setModal(false)

      setForm({
        membership_plan: '',
        payment_method: 'CARD',
        amount: ''
      })

      load()

    } catch (error) {

      console.error(error)

      toast.error(
        error.response?.data?.error ||
        'Payment failed'
      )

    } finally {

      setProcessing(false)

    }
  }

  // TOTALS

  const completedPayments = payments.filter(
    p => p.status === 'COMPLETED'
  )

  const total = completedPayments.reduce(
    (sum, payment) =>
      sum + parseFloat(payment.amount || 0),
    0
  )

  if (loading) return <Spinner />

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="page-title">
            Payments
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Your payment history
          </p>

        </div>

        {isMember && (

          <button
            onClick={() => setModal(true)}
            className="btn-primary"
          >

            <CreditCardIcon className="w-5 h-5" />

            Make Payment

          </button>

        )}

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-blue-500 to-blue-600">

          <CurrencyDollarIcon className="w-7 h-7 mb-2 opacity-80" />

          <p className="text-xs opacity-90">
            Total Spent
          </p>

          <p className="text-2xl font-bold">
            Rs. {total.toFixed(2)}
          </p>

        </div>

        <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-green-500 to-green-600">

          <CreditCardIcon className="w-7 h-7 mb-2 opacity-80" />

          <p className="text-xs opacity-90">
            Total Transactions
          </p>

          <p className="text-2xl font-bold">
            {payments.length}
          </p>

        </div>

        <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-purple-500 to-purple-600">

          <CheckCircleIcon className="w-7 h-7 mb-2 opacity-80" />

          <p className="text-xs opacity-90">
            Completed
          </p>

          <p className="text-2xl font-bold">
            {completedPayments.length}
          </p>

        </div>

      </div>

      {/* PAYMENT TABLE */}

      <div className="card p-0 overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-100">

          <h2 className="font-semibold text-gray-800">
            Payment History
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="table-head">

              <tr>

                {[
                  'Date',
                  'Plan',
                  'Amount',
                  'Method',
                  'Status',
                  'Transaction ID'
                ].map(header => (

                  <th
                    key={header}
                    className="px-4 py-3 text-left"
                  >

                    {header}

                  </th>

                ))}

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {payments.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-gray-400"
                  >

                    No payments yet

                  </td>

                </tr>

              ) : (

                payments.map(payment => (

                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="table-cell">

                      {payment.payment_date
                        ? new Date(
                            payment.payment_date
                          ).toLocaleDateString()
                        : '—'}

                    </td>

                    <td className="table-cell">

                      {payment.plan_details?.name || '—'}

                    </td>

                    <td className="table-cell font-semibold">

                      Rs. {payment.amount}

                    </td>

                    <td className="table-cell">

                      {payment.payment_method}

                    </td>

                    <td className="table-cell">

                      <span
                        className={
                          STATUS_CLS[payment.status] ||
                          'badge-blue'
                        }
                      >

                        {payment.status}

                      </span>

                    </td>

                    <td className="table-cell font-mono text-xs text-gray-400">

                      {payment.transaction_id
                        ? `${String(
                            payment.transaction_id
                          ).slice(0, 12)}...`
                        : '—'}

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* PAYMENT MODAL */}

      {modal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">

            <h2 className="text-xl font-bold mb-4">
              Make Payment
            </h2>

            <div className="space-y-4">

              {/* PLAN */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">

                  Membership Plan

                </label>

                <select
                  className="input-field"
                  value={form.membership_plan}
                  onChange={e =>
                    selectPlan(e.target.value)
                  }
                >

                  <option value="">
                    Select plan
                  </option>

                  {plans.map(plan => (

                    <option
                      key={plan.id}
                      value={plan.id}
                    >

                      {plan.name} —

                      Rs. {plan.final_price || plan.price}/

                      {plan.duration
                        ? plan.duration.toLowerCase()
                        : 'month'}

                    </option>

                  ))}

                </select>

              </div>

              {/* PAYMENT METHODS */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">

                  Payment Method

                </label>

                <div className="grid grid-cols-3 gap-2">

                  {METHODS.map(method => (

                    <button
                      key={method}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          payment_method: method
                        })
                      }
                      className={`py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                        form.payment_method === method
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >

                      {method}

                    </button>

                  ))}

                </div>

              </div>

              {/* TOTAL */}

              {form.amount && (

                <div className="bg-gray-50 rounded-xl p-4 flex justify-between">

                  <span className="text-gray-600 font-medium">
                    Total
                  </span>

                  <span className="text-primary text-xl font-bold">

                    Rs. {form.amount}

                  </span>

                </div>

              )}

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  onClick={() => setModal(false)}
                  className="flex-1 btn-outline"
                >

                  Cancel

                </button>

                <button
                  onClick={pay}
                  disabled={
                    !form.membership_plan ||
                    processing
                  }
                  className="flex-1 btn-primary"
                >

                  {processing ? (

                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                  ) : (

                    'Pay Now'

                  )}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}