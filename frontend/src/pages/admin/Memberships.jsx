import React, { useState, useEffect } from 'react'
import { membershipAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const DURATIONS = ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY']

const DEF = {
  name: '',
  duration: 'MONTHLY',
  price: '',
  discount_price: '',
  features: '',
  is_active: true
}

export default function AdminMemberships() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(DEF)

  const load = async () => {
    setLoading(true)
    try {
      const res = await membershipAPI.getPlans()
      setPlans(Array.isArray(res.data) ? res.data : (res.data?.results || []))
    } catch (e) {
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setForm(DEF)
    setEditing(null)
  }

  const open = (p = null) => {
    setEditing(p)

    setForm(
      p
        ? {
            name: p.name || '',
            duration: p.duration || 'MONTHLY',
            price: p.price ?? '',
            discount_price: p.discount_price ?? '',
            features: Array.isArray(p.features_list)
              ? p.features_list.join(', ')
              : p.features || '',
            is_active: Boolean(p.is_active)
          }
        : DEF
    )

    setModal(true)
  }

  const closeModal = () => {
    setModal(false)
    resetForm()
  }

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
        features: form.features // backend should split if needed
      }

      if (editing) {
        await membershipAPI.updatePlan(editing.id, payload)
        toast.success('Plan updated!')
      } else {
        await membershipAPI.createPlan(payload)
        toast.success('Plan created!')
      }

      closeModal()
      load()
    } catch (err) {
      const d = err.response?.data
      if (d) {
        Object.entries(d).forEach(([k, v]) =>
          toast.error(`${k}: ${Array.isArray(v) ? v[0] : v}`)
        )
      } else {
        toast.error('Failed')
      }
    }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this plan?')) return
    try {
      await membershipAPI.deletePlan(id)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">
          Membership Plans ({plans.length})
        </h2>

        <button onClick={() => open()} className="btn-primary text-sm px-4 py-2">
          <PlusIcon className="w-4 h-4" /> Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.length === 0 ? (
          <p className="text-gray-400 col-span-3 text-center py-10">
            No plans found
          </p>
        ) : (
          plans.map(p => (
            <div key={p.id} className="card relative">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{p.name}</h3>
                  <span className="badge-blue text-xs">{p.duration}</span>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => open(p)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => del(p.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                {p.discount_price ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">
                      Rs. {p.discount_price}
                    </span>
                    <span className="text-gray-400 line-through text-sm">
                      Rs. {p.price}
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    Rs. {p.price}
                  </span>
                )}
              </div>

              <ul className="space-y-1.5 mb-3">
                {(p.features_list || []).map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <span className={p.is_active ? 'badge-green' : 'badge-red'}>
                {p.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">
                {editing ? 'Edit' : 'Add'} Plan
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <input
                className="input-field"
                value={form.name}
                onChange={e => f('name', e.target.value)}
                placeholder="Plan Name"
                required
              />

              <select
                className="input-field"
                value={form.duration}
                onChange={e => f('duration', e.target.value)}
              >
                {DURATIONS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <input
                type="number"
                className="input-field"
                value={form.price}
                onChange={e => f('price', e.target.value)}
                placeholder="Price"
                required
              />

              <input
                type="number"
                className="input-field"
                value={form.discount_price}
                onChange={e => f('discount_price', e.target.value)}
                placeholder="Discount Price"
              />

              <textarea
                className="input-field"
                value={form.features}
                onChange={e => f('features', e.target.value)}
                placeholder="Feature1, Feature2, Feature3"
                rows="3"
                required
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => f('is_active', e.target.checked)}
                />
                Active
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 btn-outline">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}