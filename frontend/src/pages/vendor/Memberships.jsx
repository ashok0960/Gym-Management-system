import React, { useState, useEffect } from 'react'
import { membershipAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

const DURATIONS = [
  'MONTHLY',
  'QUARTERLY',
  'HALF_YEARLY',
  'YEARLY',
]

const DEFAULT_FORM = {
  name: '',
  duration: 'MONTHLY',
  price: '',
  discount_price: '',
  features: '',
  is_active: true,
}

export default function AdminMemberships() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  // LOAD PLANS
  const loadPlans = async () => {
    try {
      setLoading(true)

      const res = await membershipAPI.getPlans()

      const data = res?.data
      setPlans(
        Array.isArray(data)
          ? data
          : data?.results || []
      )
    } catch (error) {
      console.error(error)
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  // OPEN MODAL
  const openModal = (plan = null) => {
    setEditing(plan)

    setForm(
      plan
        ? {
            name: plan.name || '',
            duration: plan.duration || 'MONTHLY',
            price: plan.price || '',
            discount_price:
              plan.discount_price || '',
            features: Array.isArray(
              plan.features_list
            )
              ? plan.features_list.join(', ')
              : plan.features || '',
            is_active: plan.is_active ?? true,
          }
        : DEFAULT_FORM
    )

    setModal(true)
  }

  const handleChange = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }))
  }

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name || !form.price) {
      toast.error('Name and Price required')
      return
    }

    try {
      setSaving(true)

      const payload = {
        ...form,
        price: Number(form.price),
        discount_price: form.discount_price
          ? Number(form.discount_price)
          : null,
        features: form.features
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean)
          .join(', '),
      }

      if (editing) {
        await membershipAPI.updatePlan(
          editing.id,
          payload
        )
        toast.success('Plan updated!')
      } else {
        await membershipAPI.createPlan(payload)
        toast.success('Plan created!')
      }

      setModal(false)
      setEditing(null)
      setForm(DEFAULT_FORM)

      loadPlans()
    } catch (error) {
      console.error(error)
      toast.error('Operation failed')
    } finally {
      setSaving(false)
    }
  }

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return

    try {
      await membershipAPI.deletePlan(id)
      toast.success('Deleted')
      loadPlans()
    } catch (error) {
      console.error(error)
      toast.error('Delete failed')
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">
          Membership Plans ({plans.length})
        </h2>

        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2 px-4 py-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Plan
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {plans.length === 0 ? (
          <p className="text-gray-400 col-span-3 text-center py-10">
            No plans found
          </p>
        ) : (
          plans.map((p) => (
            <div
              key={p.id}
              className="card relative"
            >

              {/* HEADER */}
              <div className="flex justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">
                    {p.name}
                  </h3>
                  <span className="badge-blue text-xs">
                    {p.duration}
                  </span>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => openModal(p)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(p.id)
                    }
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* PRICE */}
              <div className="mb-3">
                {p.discount_price ? (
                  <div className="flex gap-2 items-baseline">
                    <span className="text-3xl font-bold text-primary">
                      Rs. {p.discount_price}
                    </span>
                    <span className="line-through text-gray-400 text-sm">
                      Rs. {p.price}
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    Rs. {p.price}
                  </span>
                )}
              </div>

              {/* FEATURES */}
              <ul className="space-y-1 text-sm text-gray-600 mb-3">
                {p.features_list?.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2"
                  >
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <span
                className={
                  p.is_active
                    ? 'badge-green'
                    : 'badge-red'
                }
              >
                {p.is_active
                  ? 'Active'
                  : 'Inactive'}
              </span>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">

            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-lg">
                {editing
                  ? 'Edit Plan'
                  : 'Add Plan'}
              </h3>

              <button
                onClick={() => setModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-3"
            >

              <input
                className="input-field"
                placeholder="Plan Name"
                value={form.name}
                onChange={(e) =>
                  handleChange('name', e.target.value)
                }
              />

              <select
                className="input-field"
                value={form.duration}
                onChange={(e) =>
                  handleChange(
                    'duration',
                    e.target.value
                  )
                }
              >
                {DURATIONS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>

              <input
                type="number"
                className="input-field"
                placeholder="Price"
                value={form.price}
                onChange={(e) =>
                  handleChange('price', e.target.value)
                }
              />

              <input
                type="text"
                className="input-field"
                placeholder="Features (comma separated)"
                value={form.features}
                onChange={(e) =>
                  handleChange(
                    'features',
                    e.target.value
                  )
                }
              />

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setModal(false)
                  }
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-primary"
                >
                  {saving
                    ? 'Saving...'
                    : editing
                    ? 'Update'
                    : 'Create'}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  )
}