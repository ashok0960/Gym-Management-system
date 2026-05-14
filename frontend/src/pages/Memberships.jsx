import React, { useState, useEffect } from 'react'
import { membershipAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'

import { CheckIcon } from '@heroicons/react/24/outline'

export default function Memberships() {

  const { user } = useAuth()

  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const loadPlans = async () => {

      try {

        setLoading(true)

        const response = await membershipAPI.getPlans()

        console.log('Membership Plans Response:', response.data)

        // FIXED HERE
        const plansData = Array.isArray(response.data)
          ? response.data
          : response.data.results || response.data.data || []

        setPlans(plansData)

      } catch (error) {

        console.error(error)

        toast.error('Failed to load plans')

        setPlans([])

      } finally {

        setLoading(false)

      }
    }

    loadPlans()

  }, [])

  const upgrade = async (plan) => {

    try {

      await membershipAPI.upgrade({
        new_plan: plan.name
      })

      toast.success(`Upgraded to ${plan.name}!`)

    } catch (e) {

      toast.error(
        e.response?.data?.error || 'Upgrade failed'
      )

    }
  }

  if (loading) return <Spinner />

  // EMPTY STATE

  if (!Array.isArray(plans) || plans.length === 0) {

    return (

      <div className="space-y-4">

        <h1 className="page-title">
          Membership Plans
        </h1>

        <div className="card text-center py-12 text-gray-400">

          No plans available.

          <br />

          Ask admin to add plans via Django admin panel at

          <code className="text-primary ml-1">
            /admin
          </code>

        </div>

      </div>
    )
  }

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div className="text-center">

        <h1 className="page-title">
          Membership Plans
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          Choose the plan that fits your goals
        </p>

      </div>

      {/* PLANS GRID */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">

        {plans.map((plan, i) => {

          const isCurrent =
            user?.membership_type === plan.name

          const isPopular = i === 1

          return (

            <div
              key={plan.id || i}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
                isPopular
                  ? 'border-primary ring-2 ring-primary scale-105'
                  : 'border-gray-100'
              }`}
            >

              {/* POPULAR BADGE */}

              {isPopular && (

                <div className="bg-primary text-white text-xs font-bold text-center py-1.5">

                  ⭐ Most Popular

                </div>

              )}

              <div className="p-6">

                {/* PLAN NAME */}

                <h3 className="text-xl font-bold text-gray-800">

                  {plan.name || 'Premium Plan'}

                </h3>

                {/* DURATION */}

                <p className="text-gray-400 text-sm">

                  {plan.duration
                    ? plan.duration.replace('_', ' ')
                    : 'Monthly'}

                </p>

                {/* PRICE */}

                <div className="mt-4 mb-5">

                  <span className="text-4xl font-bold text-primary">

                    Rs. {plan.final_price || plan.price || 0}

                  </span>

                  <span className="text-gray-400 text-sm">

                    /

                    {plan.duration
                      ? plan.duration.toLowerCase()
                      : 'month'}

                  </span>

                  {/* DISCOUNT */}

                  {plan.discount_price && plan.price && (

                    <p className="text-xs text-green-600 mt-1">

                      <s className="text-gray-400">

                        Rs. {plan.price}

                      </s>

                      {' '}

                      {Math.round(
                        (
                          (plan.price - plan.discount_price) /
                          plan.price
                        ) * 100
                      )}% OFF

                    </p>

                  )}

                </div>

                {/* FEATURES */}

                <ul className="space-y-2 mb-6">

                  {(plan.features_list || []).map((feature, j) => (

                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >

                      <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />

                      {feature}

                    </li>

                  ))}

                </ul>

                {/* BUTTON */}

                <button
                  onClick={() => upgrade(plan)}
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    isCurrent
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-orange-600 text-white'
                  }`}
                >

                  {isCurrent
                    ? '✓ Current Plan'
                    : 'Upgrade Now'}

                </button>

              </div>

            </div>

          )
        })}

      </div>

    </div>
  )
}