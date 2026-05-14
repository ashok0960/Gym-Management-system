import React, { useState, useEffect } from 'react'
import { classAPI, trainerAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const CTYPES = [
  'YOGA',
  'ZUMBA',
  'CROSSFIT',
  'BOXING',
  'SPINNING',
  'PILATES',
  'AEROBICS',
  'MEDITATION',
]

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const DIFF = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

const DEFAULT_FORM = {
  name: '',
  class_type: 'YOGA',
  trainer: '',
  description: '',
  capacity: '',
  day_of_week: 0,
  start_time: '09:00',
  end_time: '10:00',
  duration_minutes: 60,
  location: '',
  difficulty_level: 'BEGINNER',
  equipment_needed: '',
}

export default function AdminClasses() {
  const [classes, setClasses] = useState([])
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  // LOAD DATA
  const loadData = async () => {
    try {
      setLoading(true)

      const [cRes, tRes] = await Promise.all([
        classAPI.getAll(),
        trainerAPI.getAll(),
      ])

      const classesData = cRes?.data
      const trainerData = tRes?.data

      setClasses(
        Array.isArray(classesData)
          ? classesData
          : classesData?.results || []
      )

      setTrainers(
        Array.isArray(trainerData)
          ? trainerData
          : trainerData?.results || []
      )
    } catch (error) {
      console.error(error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // OPEN MODAL
  const openModal = (c = null) => {
    setEditing(c)

    setForm(
      c
        ? {
            name: c.name || '',
            class_type: c.class_type || 'YOGA',
            trainer: c.trainer || '',
            description: c.description || '',
            capacity: c.capacity?.toString() || '',
            day_of_week: c.day_of_week ?? 0,
            start_time: c.start_time || '09:00',
            end_time: c.end_time || '10:00',
            duration_minutes:
              c.duration_minutes || 60,
            location: c.location || '',
            difficulty_level:
              c.difficulty_level || 'BEGINNER',
            equipment_needed:
              c.equipment_needed || '',
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

    if (!form.name || !form.location) {
      toast.error('Name and Location required')
      return
    }

    try {
      setSaving(true)

      const payload = {
        ...form,
        capacity: Number(form.capacity || 0),
        duration_minutes: Number(
          form.duration_minutes || 0
        ),
      }

      if (editing) {
        await classAPI.update(editing.id, payload)
        toast.success('Class updated!')
      } else {
        await classAPI.create(payload)
        toast.success('Class created!')
      }

      setModal(false)
      setEditing(null)
      setForm(DEFAULT_FORM)

      loadData()
    } catch (error) {
      console.error(error)
      toast.error('Operation failed')
    } finally {
      setSaving(false)
    }
  }

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class?')) return

    try {
      await classAPI.delete(id)
      toast.success('Deleted')
      loadData()
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
          Classes ({classes.length})
        </h2>

        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2 px-4 py-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Class
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
                  'Type',
                  'Trainer',
                  'Schedule',
                  'Spots',
                  'Difficulty',
                  'Actions',
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {classes.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    No classes found
                  </td>
                </tr>
              ) : (
                classes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">
                      {c.name}
                      <br />
                      <span className="text-xs text-gray-400">
                        {c.location}
                      </span>
                    </td>

                    <td className="table-cell">
                      <span className="badge-blue">
                        {c.class_type}
                      </span>
                    </td>

                    <td className="table-cell">
                      {c.trainer_details?.name || '—'}
                    </td>

                    <td className="table-cell text-xs">
                      {DAYS[c.day_of_week]}
                      <br />
                      {c.start_time}–{c.end_time}
                    </td>

                    <td className="table-cell">
                      {c.current_bookings}/{c.capacity}
                    </td>

                    <td className="table-cell">
                      <span className="badge-green">
                        {c.difficulty_level}
                      </span>
                    </td>

                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(c)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(c.id)}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">

            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold">
                {editing ? 'Edit Class' : 'Add Class'}
              </h3>

              <button
                onClick={() => setModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">

              {/* NAME */}
              <input
                className="input-field"
                placeholder="Class Name"
                value={form.name}
                onChange={(e) =>
                  handleChange('name', e.target.value)
                }
                required
              />

              {/* TYPE */}
              <select
                className="input-field"
                value={form.class_type}
                onChange={(e) =>
                  handleChange('class_type', e.target.value)
                }
              >
                {CTYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>

              {/* TRAINER */}
              <select
                className="input-field"
                value={form.trainer}
                onChange={(e) =>
                  handleChange('trainer', e.target.value)
                }
              >
                <option value="">No Trainer</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              {/* LOCATION */}
              <input
                className="input-field"
                placeholder="Location"
                value={form.location}
                onChange={(e) =>
                  handleChange('location', e.target.value)
                }
              />

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