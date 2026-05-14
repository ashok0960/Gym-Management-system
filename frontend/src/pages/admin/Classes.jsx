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

const DEF = {
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
  const [form, setForm] = useState(DEF)

  // LOAD DATA
  const load = async () => {
    setLoading(true)
    try {
      const [cRes, tRes] = await Promise.all([
        classAPI.getAll(),
        trainerAPI.getAll(),
      ])

      setClasses(Array.isArray(cRes.data) ? cRes.data : [])
      setTrainers(Array.isArray(tRes.data) ? tRes.data : [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // OPEN MODAL
  const open = (c = null) => {
    setEditing(c)

    if (c) {
      setForm({
        name: c.name || '',
        class_type: c.class_type || 'YOGA',
        trainer: c.trainer || c.trainer_details?.id || '',
        description: c.description || '',
        capacity: c.capacity || '',
        day_of_week: c.day_of_week ?? 0,
        start_time: c.start_time || '09:00',
        end_time: c.end_time || '10:00',
        duration_minutes: c.duration_minutes || 60,
        location: c.location || '',
        difficulty_level: c.difficulty_level || 'BEGINNER',
        equipment_needed: c.equipment_needed || '',
      })
    } else {
      setForm(DEF)
    }

    setModal(true)
  }

  // HANDLE CHANGE
  const f = (k, v) => {
    setForm((p) => ({
      ...p,
      [k]: v,
    }))
  }

  // SUBMIT (FIXED payload)
  const submit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        trainer: form.trainer || null,
      }

      if (editing) {
        await classAPI.update(editing.id, payload)
        toast.success('Class updated!')
      } else {
        await classAPI.create(payload)
        toast.success('Class added!')
      }

      setModal(false)
      setEditing(null)
      setForm(DEF)
      load()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save class')
    }
  }

  // DELETE
  const del = async (id) => {
    if (!window.confirm('Delete this class?')) return

    try {
      await classAPI.delete(id)
      toast.success('Deleted')
      load()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete')
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">
          Classes ({classes.length})
        </h2>

        <button
          onClick={() => open()}
          className="btn-primary text-sm px-4 py-2"
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
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50"
                  >

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
                      <span
                        className={
                          c.difficulty_level === 'BEGINNER'
                            ? 'badge-green'
                            : c.difficulty_level ===
                              'INTERMEDIATE'
                            ? 'badge-yellow'
                            : 'badge-red'
                        }
                      >
                        {c.difficulty_level}
                      </span>
                    </td>

                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button
                          onClick={() => open(c)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => del(c.id)}
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

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">
                {editing ? 'Edit' : 'Add'} Class
              </h3>

              <button
                onClick={() => setModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3">

              <input
                className="input-field"
                placeholder="Class Name"
                value={form.name}
                onChange={(e) => f('name', e.target.value)}
                required
              />

              <select
                className="input-field"
                value={form.class_type}
                onChange={(e) => f('class_type', e.target.value)}
              >
                {CTYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>

              <select
                className="input-field"
                value={form.trainer}
                onChange={(e) => f('trainer', e.target.value)}
              >
                <option value="">No trainer</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <input
                className="input-field"
                placeholder="Location"
                value={form.location}
                onChange={(e) => f('location', e.target.value)}
                required
              />

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
                  className="flex-1 btn-primary"
                >
                  {editing ? 'Update' : 'Add'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}