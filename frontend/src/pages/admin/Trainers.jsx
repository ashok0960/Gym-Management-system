import React, { useState, useEffect } from 'react'
import { trainerAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

const SPECS = ['STRENGTH', 'CARDIO', 'YOGA', 'HIIT', 'NUTRITION', 'REHAB', 'BOXING', 'PILATES']

const DEF = {
  name: '',
  email: '',
  phone: '',
  specialization: 'STRENGTH',
  experience_years: '',
  bio: '',
  qualification: ''
}

export default function AdminTrainers() {
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(DEF)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const res = await trainerAPI.getAll()
      setTrainers(Array.isArray(res.data) ? res.data : (res.data?.results || []))
    } catch {
      toast.error('Failed to load trainers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const open = (t = null) => {
    setEditing(t)

    setForm(
      t
        ? {
            name: t.name || '',
            email: t.email || '',
            phone: t.phone || '',
            specialization: t.specialization || 'STRENGTH',
            experience_years: t.experience_years ?? '',
            bio: t.bio || '',
            qualification: t.qualification || ''
          }
        : DEF
    )

    setModal(true)
  }

  const closeModal = () => {
    setModal(false)
    setEditing(null)
    setForm(DEF)
  }

  const f = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        ...form,
        experience_years: form.experience_years ? Number(form.experience_years) : 0
      }

      if (editing) {
        await trainerAPI.update(editing.id, payload)
        toast.success('Trainer updated!')
      } else {
        await trainerAPI.create(payload)
        toast.success('Trainer added!')
      }

      closeModal()
      load()
    } catch (err) {
      const d = err.response?.data
      if (d) {
        Object.entries(d).forEach(([k, v]) => {
          toast.error(`${k}: ${Array.isArray(v) ? v[0] : v}`)
        })
      } else {
        toast.error('Request failed')
      }
    }

    setSaving(false)
  }

  const del = async (id) => {
    if (!window.confirm('Delete this trainer?')) return

    try {
      await trainerAPI.delete(id)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">
          Trainers ({trainers.length})
        </h2>

        <button
          onClick={() => open()}
          className="btn-primary text-sm px-4 py-2"
        >
          <PlusIcon className="w-4 h-4" /> Add Trainer
        </button>
      </div>

      {/* TABLE */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">

            <thead className="table-head">
              <tr>
                {['Name', 'Specialization', 'Experience', 'Email', 'Phone', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {trainers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-gray-400">
                    No trainers found
                  </td>
                </tr>
              ) : (
                trainers.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">

                    <td className="table-cell font-medium">
                      {t.name}
                      <br />
                      <span className="text-xs text-gray-400">
                        {t.qualification}
                      </span>
                    </td>

                    <td className="table-cell">
                      <span className="badge-blue">
                        {t.specialization_display || t.specialization}
                      </span>
                    </td>

                    <td className="table-cell">
                      {t.experience_years || 0} yrs
                    </td>

                    <td className="table-cell">{t.email}</td>
                    <td className="table-cell">{t.phone}</td>

                    <td className="table-cell">
                      <div className="flex gap-1">

                        <button
                          onClick={() => open(t)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => del(t.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">
                {editing ? 'Edit' : 'Add'} Trainer
              </h3>

              <button onClick={closeModal}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3">

              {[
                ['Name', 'name', 'text'],
                ['Email', 'email', 'email'],
                ['Phone', 'phone', 'tel'],
                ['Experience (years)', 'experience_years', 'number'],
                ['Qualification', 'qualification', 'text']
              ].map(([l, k, t]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {l}
                  </label>

                  <input
                    type={t}
                    className="input-field"
                    value={form[k]}
                    onChange={e => f(k, e.target.value)}
                    required
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>

                <select
                  className="input-field"
                  value={form.specialization}
                  onChange={e => f('specialization', e.target.value)}
                >
                  {SPECS.map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>

                <textarea
                  className="input-field"
                  rows="2"
                  value={form.bio}
                  onChange={e => f('bio', e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-primary"
                >
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add'}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}