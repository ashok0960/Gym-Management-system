import React, { useState, useEffect } from 'react'
import { authAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const DEF = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  address: '',
  password: '',
  password2: '',
  role: 'MEMBER',
}

export default function AdminMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(DEF)
  const [saving, setSaving] = useState(false)

  // SAFE LOAD FUNCTION
  const load = async () => {
    setLoading(true)

    try {
      const res = await authAPI.getMembers()

      const data = Array.isArray(res?.data)
        ? res.data
        : res?.data?.results || []

      setMembers(data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // TOGGLE STATUS
  const toggle = async (id) => {
    try {
      await authAPI.toggleMemberStatus(id)
      toast.success('Status updated')
      load()
    } catch (err) {
      console.error(err)
      toast.error('Failed')
    }
  }

  // INPUT HANDLER
  const f = (k, v) => {
    setForm((p) => ({
      ...p,
      [k]: v,
    }))
  }

  // SUBMIT MEMBER
  const submit = async (e) => {
    e.preventDefault()

    if (form.password !== form.password2) {
      toast.error('Passwords do not match')
      return
    }

    setSaving(true)

    try {
      await authAPI.register(form)

      toast.success('Member added!')
      setModal(false)
      setForm(DEF)
      load()
    } catch (err) {
      console.error(err)

      const d = err.response?.data

      if (d) {
        Object.entries(d).forEach(([k, v]) =>
          toast.error(
            `${k}: ${Array.isArray(v) ? v[0] : v}`
          )
        )
      } else {
        toast.error('Failed to add member')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">
          Members ({members.length})
        </h2>

        <button
          onClick={() => setModal(true)}
          className="btn-primary text-sm px-4 py-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Member
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
                  'Email',
                  'Phone',
                  'Membership',
                  'Role',
                  'Status',
                  'Joined',
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

              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    No members found
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-gray-50"
                  >

                    {/* NAME */}
                    <td className="table-cell font-medium">
                      {m.user?.full_name || '-'}
                      <br />
                      <span className="text-xs text-gray-400">
                        @{m.user?.username || ''}
                      </span>
                    </td>

                    {/* EMAIL */}
                    <td className="table-cell">
                      {m.user?.email || '-'}
                    </td>

                    {/* PHONE */}
                    <td className="table-cell">
                      {m.phone || '-'}
                    </td>

                    {/* MEMBERSHIP */}
                    <td className="table-cell">
                      <span
                        className={
                          m.membership_type === 'VIP'
                            ? 'badge-yellow'
                            : m.membership_type ===
                              'PREMIUM'
                            ? 'badge-purple'
                            : 'badge-blue'
                        }
                      >
                        {m.membership_type || 'BASIC'}
                      </span>
                    </td>

                    {/* ROLE */}
                    <td className="table-cell">
                      {m.role || '-'}
                    </td>

                    {/* STATUS */}
                    <td className="table-cell">
                      <button
                        onClick={() => toggle(m.id)}
                        className={
                          m.is_active
                            ? 'badge-green'
                            : 'badge-red'
                        }
                      >
                        {m.is_active
                          ? 'Active'
                          : 'Inactive'}
                      </button>
                    </td>

                    {/* DATE */}
                    <td className="table-cell text-xs text-gray-400">
                      {m.created_at
                        ? new Date(
                            m.created_at
                          ).toLocaleDateString()
                        : '-'}
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

            {/* HEADER */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">
                Add New Member
              </h3>

              <button
                onClick={() => setModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={submit}
              className="space-y-3"
            >

              <input
                className="input-field"
                placeholder="Username"
                value={form.username}
                onChange={(e) =>
                  f('username', e.target.value)
                }
                required
              />

              <input
                className="input-field"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  f('email', e.target.value)
                }
                required
              />

              <input
                className="input-field"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) =>
                  f('phone', e.target.value)
                }
              />

              <select
                className="input-field"
                value={form.role}
                onChange={(e) =>
                  f('role', e.target.value)
                }
              >
                <option value="MEMBER">
                  Member
                </option>
                <option value="TRAINER">
                  Trainer
                </option>
              </select>

              <input
                type="password"
                className="input-field"
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  f('password', e.target.value)
                }
                required
              />

              <input
                type="password"
                className="input-field"
                placeholder="Confirm Password"
                value={form.password2}
                onChange={(e) =>
                  f('password2', e.target.value)
                }
                required
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
                    ? 'Adding...'
                    : 'Add Member'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}
