import React, { useState, useEffect } from 'react'
import { authAPI } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const DEFAULT_FORM = {
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
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)

  // Load Members
  const loadMembers = async () => {
    try {
      setLoading(true)

      const response = await authAPI.getMembers()

      // Handle different API response formats
      const data = response?.data

      if (Array.isArray(data)) {
        setMembers(data)
      } else if (Array.isArray(data?.results)) {
        setMembers(data.results)
      } else {
        setMembers([])
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  // Update form
  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Toggle member status
  const handleToggleStatus = async (id) => {
    try {
      await authAPI.toggleMemberStatus(id)

      toast.success('Member status updated')

      loadMembers()
    } catch (error) {
      console.error(error)
      toast.error('Failed to update status')
    }
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.password !== form.password2) {
      toast.error('Passwords do not match')
      return
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      setSaving(true)

      await authAPI.register(form)

      toast.success('Member added successfully')

      setModal(false)
      setForm(DEFAULT_FORM)

      loadMembers()
    } catch (error) {
      console.error(error)

      const errors = error?.response?.data

      if (errors && typeof errors === 'object') {
        Object.entries(errors).forEach(([key, value]) => {
          toast.error(
            `${key}: ${Array.isArray(value) ? value[0] : value}`
          )
        })
      } else {
        toast.error('Failed to add member')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Members
          </h1>
          <p className="text-sm text-gray-500">
            Total Members: {members.length}
          </p>
        </div>

        <button
          onClick={() => setModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  'Name',
                  'Email',
                  'Phone',
                  'Membership',
                  'Role',
                  'Status',
                  'Joined',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-left text-sm font-semibold text-gray-700"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    No members found
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50 transition"
                  >
                    {/* Name */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-800">
                        {member.user?.full_name ||
                          `${member.user?.first_name || ''} ${
                            member.user?.last_name || ''
                          }`}
                      </div>

                      <div className="text-xs text-gray-400">
                        @{member.user?.username}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {member.user?.email || '-'}
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {member.phone || '-'}
                    </td>

                    {/* Membership */}
                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium
                        ${
                          member.membership_type === 'VIP'
                            ? 'bg-yellow-100 text-yellow-700'
                            : member.membership_type === 'PREMIUM'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {member.membership_type || 'BASIC'}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {member.role}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() =>
                          handleToggleStatus(member.id)
                        }
                        className={`px-3 py-1 rounded-full text-xs font-medium transition
                        ${
                          member.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {member.is_active
                          ? 'Active'
                          : 'Inactive'}
                      </button>
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {member.created_at
                        ? new Date(
                            member.created_at
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Add New Member
              </h2>

              <button
                onClick={() => setModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['First Name', 'first_name', 'text'],
                  ['Last Name', 'last_name', 'text'],
                  ['Username', 'username', 'text'],
                  ['Email', 'email', 'email'],
                  ['Phone', 'phone', 'tel'],
                  ['Address', 'address', 'text'],
                ].map(([label, key, type]) => (
                  <div key={key}>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      {label}
                    </label>

                    <input
                      type={type}
                      required
                      value={form[key]}
                      onChange={(e) =>
                        handleChange(key, e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>

              {/* Role */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Role
                </label>

                <select
                  value={form.role}
                  onChange={(e) =>
                    handleChange('role', e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="MEMBER">Member</option>
                  <option value="VENDOR">Vendor</option>
                </select>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) =>
                      handleChange(
                        'password',
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    required
                    value={form.password2}
                    onChange={(e) =>
                      handleChange(
                        'password2',
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 border border-gray-300 rounded-xl py-2.5 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}