import React, { useState, useEffect } from 'react'
import { trainerAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const SPECS = [
  'STRENGTH',
  'CARDIO',
  'YOGA',
  'HIIT',
  'NUTRITION',
  'REHAB',
  'BOXING',
  'PILATES',
]

const DEFAULT_FORM = {
  name: '',
  email: '',
  phone: '',
  specialization: 'STRENGTH',
  experience_years: '',
  bio: '',
  qualification: '',
}

export default function AdminTrainers() {
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  // ✅ LOAD TRAINERS
  const loadTrainers = async () => {
    try {
      setLoading(true)

      const res = await trainerAPI.getAll()

      const data = res?.data

      setTrainers(Array.isArray(data) ? data : data?.results || [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load trainers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrainers()
  }, [])

  // ✅ OPEN MODAL (safe mapping)
  const openModal = (trainer = null) => {
    setEditing(trainer)

    setForm(
      trainer
        ? {
            name: trainer.name || '',
            email: trainer.email || '',
            phone: trainer.phone || '',
            specialization: trainer.specialization || 'STRENGTH',
            experience_years:
              trainer.experience_years?.toString() || '',
            bio: trainer.bio || '',
            qualification: trainer.qualification || '',
          }
        : DEFAULT_FORM
    )

    setModal(true)
  }

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // ✅ SUBMIT (CREATE / UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name || !form.email) {
      toast.error('Name and Email required')
      return
    }

    try {
      setSaving(true)

      const payload = {
        ...form,
        experience_years: Number(form.experience_years || 0),
      }

      if (editing) {
        await trainerAPI.update(editing.id, payload)
        toast.success('Trainer updated!')
      } else {
        await trainerAPI.create(payload)
        toast.success('Trainer added!')
      }

      setModal(false)
      setEditing(null)
      setForm(DEFAULT_FORM)

      loadTrainers()
    } catch (error) {
      console.error(error)
      toast.error('Operation failed')
    } finally {
      setSaving(false)
    }
  }

  // ✅ DELETE
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trainer?')) return

    try {
      await trainerAPI.delete(id)
      toast.success('Deleted successfully')
      loadTrainers()
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
          Trainers ({trainers.length})
        </h2>

        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2 px-4 py-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Trainer
        </button>
      </div>

      {/* TABLE */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                {[
                  'Name',
                  'Specialization',
                  'Experience',
                  'Email',
                  'Phone',
                  'Actions',
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {trainers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    No trainers found
                  </td>
                </tr>
              ) : (
                trainers.map((t) => (
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
                        {t.specialization_display ||
                          t.specialization}
                      </span>
                    </td>

                    <td className="table-cell">
                      {t.experience_years || 0} yrs
                    </td>

                    <td className="table-cell">{t.email}</td>
                    <td className="table-cell">{t.phone}</td>

                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(t)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(t.id)}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">

            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold">
                {editing ? 'Edit Trainer' : 'Add Trainer'}
              </h3>

              <button
                onClick={() => setModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">

              {[
                ['Name', 'name', 'text'],
                ['Email', 'email', 'email'],
                ['Phone', 'phone', 'tel'],
                ['Experience', 'experience_years', 'number'],
                ['Qualification', 'qualification', 'text'],
              ].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">
                    {label}
                  </label>

                  <input
                    type={type}
                    className="input-field"
                    value={form[key]}
                    onChange={(e) =>
                      handleChange(key, e.target.value)
                    }
                    required={key === 'name' || key === 'email'}
                  />
                </div>
              ))}

              {/* SPECIALIZATION */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Specialization
                </label>

                <select
                  className="input-field"
                  value={form.specialization}
                  onChange={(e) =>
                    handleChange('specialization', e.target.value)
                  }
                >
                  {SPECS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* BIO */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Bio
                </label>

                <textarea
                  className="input-field"
                  rows="3"
                  value={form.bio}
                  onChange={(e) =>
                    handleChange('bio', e.target.value)
                  }
                />
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
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
                    : 'Add'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}