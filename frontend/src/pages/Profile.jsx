import React, { useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'

const GENDER = [{ v: 'M', l: 'Male' }, { v: 'F', l: 'Female' }, { v: 'O', l: 'Other' }]

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [tab, setTab] = useState('info')

  const loadProfile = () => {
    authAPI.getProfile().then(r => {
      setProfile(r.data)
      setForm({
        first_name: r.data.user?.first_name || '',
        last_name: r.data.user?.last_name || '',
        email: r.data.user?.email || '',
        phone: r.data.phone || '',
        address: r.data.address || '',
        date_of_birth: r.data.date_of_birth || '',
        gender: r.data.gender || '',
        emergency_contact_name: r.data.emergency_contact_name || '',
        emergency_contact_phone: r.data.emergency_contact_phone || '',
        medical_conditions: r.data.medical_conditions || '',
      })
    }).catch(() => toast.error('Failed to load profile')).finally(() => setLoading(false))
  }

  useEffect(() => { loadProfile() }, [])

  const saveProfile = async (e) => {
    e.preventDefault()
    try {
      await authAPI.updateProfile(form)
      toast.success('Profile updated!')
      setEditing(false)
      loadProfile()
    } catch { toast.error('Update failed') }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    try {
      await authAPI.changePassword(pwForm)
      toast.success('Password changed!')
      setPwForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      const d = err.response?.data
      if (d) Object.values(d).forEach(v => toast.error(Array.isArray(v) ? v[0] : v))
      else toast.error('Failed')
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-primary to-orange-400 rounded-2xl p-8 text-white text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold">{user?.username?.[0]?.toUpperCase()}</span>
        </div>
        <h2 className="text-2xl font-bold">{profile?.user?.full_name}</h2>
        <p className="opacity-90 text-sm">{profile?.user?.email}</p>
        <div className="flex justify-center gap-3 mt-4 flex-wrap">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{profile?.role}</span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{profile?.membership_type}</span>
          <span className={`px-3 py-1 rounded-full text-sm ${profile?.is_active ? 'bg-green-400/30' : 'bg-red-400/30'}`}>
            {profile?.is_active ? 'Active' : 'Inactive'}
          </span>
          {profile?.membership_end && (
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Expires: {profile.membership_end}</span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {['info', 'password'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            {t === 'info' ? 'Profile Info' : 'Change Password'}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="card">
          {!editing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['Full Name', profile?.user?.full_name],
                  ['Username', profile?.user?.username],
                  ['Email', profile?.user?.email],
                  ['Phone', profile?.phone],
                  ['Address', profile?.address],
                  ['Date of Birth', profile?.date_of_birth],
                  ['Gender', profile?.gender],
                  ['Membership Start', profile?.membership_start],
                  ['Membership End', profile?.membership_end || 'N/A'],
                  ['Emergency Contact', profile?.emergency_contact_name],
                  ['Emergency Phone', profile?.emergency_contact_phone],
                ].map(([label, val]) => (
                  <div key={label} className="border-b border-gray-100 pb-3">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="font-medium text-sm mt-0.5">{val || '—'}</p>
                  </div>
                ))}
                {profile?.medical_conditions && (
                  <div className="md:col-span-2 border-b border-gray-100 pb-3">
                    <p className="text-xs text-gray-400">Medical Conditions</p>
                    <p className="font-medium text-sm mt-0.5">{profile.medical_conditions}</p>
                  </div>
                )}
              </div>
              <button onClick={() => setEditing(true)} className="btn-primary mt-6">Edit Profile</button>
            </>
          ) : (
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'First Name', key: 'first_name', type: 'text' },
                  { label: 'Last Name', key: 'last_name', type: 'text' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Phone', key: 'phone', type: 'tel' },
                  { label: 'Date of Birth', key: 'date_of_birth', type: 'date' },
                  { label: 'Emergency Contact Name', key: 'emergency_contact_name', type: 'text' },
                  { label: 'Emergency Contact Phone', key: 'emergency_contact_phone', type: 'tel' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input type={type} className="input-field" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select className="input-field" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select</option>
                    {GENDER.map(g => <option key={g.v} value={g.v}>{g.l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea className="input-field" rows="2" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
                <textarea className="input-field" rows="2" value={form.medical_conditions} onChange={e => setForm({ ...form, medical_conditions: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditing(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === 'password' && (
        <div className="card">
          <form onSubmit={changePassword} className="space-y-4 max-w-sm">
            {[
              { label: 'Current Password', key: 'old_password' },
              { label: 'New Password', key: 'new_password' },
              { label: 'Confirm New Password', key: 'confirm_password' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type="password" required className="input-field" value={pwForm[key]} onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })} />
              </div>
            ))}
            <button type="submit" className="btn-primary">Change Password</button>
          </form>
        </div>
      )}
    </div>
  )
}
