import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  EyeIcon, EyeSlashIcon, ArrowRightIcon, UserIcon,
  BuildingStorefrontIcon, CheckCircleIcon, BoltIcon,
} from '@heroicons/react/24/outline'

const STEPS_INFO = [
  { icon: '👤', title: 'Create your account', desc: 'Fill in your personal details' },
  { icon: '🚀', title: 'Start your journey', desc: 'Access your dashboard instantly' },
]

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone: '', address: '', password: '', password2: '', role: 'MEMBER',
  })
  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) { toast.error('Passwords do not match'); return }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    const result = await register(form)
    if (result.success) {
      navigate(result.user.is_vendor || result.user.role === 'VENDOR' ? '/vendor' : '/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80"
          alt="Gym"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/95 via-gray-900/85 to-orange-900/50" />

        {/* Glow blobs */}
        <div className="absolute top-1/4 -left-16 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-16 w-64 h-64 bg-orange-600/15 rounded-full blur-3xl" />

        <div className="relative flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/40">
              <span className="text-white font-black text-xl">G</span>
            </div>
            <span className="text-white font-black text-2xl">Gym<span className="text-orange-400">MS</span></span>
          </Link>

          {/* Main copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <BoltIcon className="w-3.5 h-3.5" /> Join 2,500+ members today
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Start Your<br />
              <span className="text-orange-400">Fitness Story</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-sm">
              Create your free account and get instant access to classes, trainers, and your personal fitness dashboard.
            </p>

            {/* Steps */}
            <div className="space-y-5">
              {STEPS_INFO.map(({ icon, title, desc }, i) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/30 rounded-xl flex items-center justify-center text-lg">
                      {icon}
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-[9px] font-black">{i + 1}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{title}</p>
                    <p className="text-gray-500 text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex -space-x-2">
              {['🧑', '👩', '🧔', '👱'].map((e, i) => (
                <div key={i} className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-sm">
                  {e}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white text-xs font-semibold">2,500+ active members</p>
              <p className="text-gray-500 text-xs">Join the community today</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-7/12 flex items-center justify-center bg-gray-50 px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-lg">

          {/* Mobile logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <Link to="/home" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xl">G</span>
              </div>
              <span className="font-black text-2xl text-gray-900">Gym<span className="text-orange-500">MS</span></span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { role: 'MEMBER', Icon: UserIcon, label: 'Member', sub: 'Book classes & track progress' },
            ].map(({ role, Icon, label, sub }) => (
              <button
                key={role}
                type="button"
                onClick={() => set('role', role)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  form.role === role
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-orange-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  form.role === role ? 'bg-orange-500' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${form.role === role ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${form.role === role ? 'text-orange-600' : 'text-gray-700'}`}>{label}</p>
                  <p className="text-xs text-gray-400 leading-tight">{sub}</p>
                </div>
                {form.role === role && (
                  <CheckCircleIcon className="w-4 h-4 text-orange-500 ml-auto flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">

            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">First Name</label>
                <input type="text" required placeholder="John"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-300"
                  value={form.first_name} onChange={e => set('first_name', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Last Name</label>
                <input type="text" required placeholder="Doe"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-300"
                  value={form.last_name} onChange={e => set('last_name', e.target.value)} />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Username</label>
              <input type="text" required placeholder="johndoe123"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-300"
                value={form.username} onChange={e => set('username', e.target.value)} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" required placeholder="john@example.com"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-300"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Phone</label>
                <input type="tel" required placeholder="+1 555 0000"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-300"
                  value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Address</label>
                <input type="text" required placeholder="City, Country"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-300"
                  value={form.address} onChange={e => set('address', e.target.value)} />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required placeholder="Min 8 chars"
                    className="w-full px-4 py-3 pr-10 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-300"
                    value={form.password} onChange={e => set('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm</label>
                <div className="relative">
                  <input type={showPw2 ? 'text' : 'password'} required placeholder="Repeat password"
                    className={`w-full px-4 py-3 pr-10 bg-white border-2 rounded-xl text-sm focus:outline-none transition-colors placeholder-gray-300 ${
                      form.password2 && form.password !== form.password2
                        ? 'border-red-400 focus:border-red-500'
                        : form.password2 && form.password === form.password2
                        ? 'border-green-400 focus:border-green-500'
                        : 'border-gray-200 focus:border-orange-500'
                    }`}
                    value={form.password2} onChange={e => set('password2', e.target.value)} />
                  <button type="button" onClick={() => setShowPw2(!showPw2)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw2 ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                {form.password2 && form.password !== form.password2 && (
                  <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/30 text-sm mt-2"
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><span>Create Account</span><ArrowRightIcon className="w-4 h-4" /></>}
            </button>

          </form>

          {/* Back to home */}
          <p className="text-center text-xs text-gray-400 mt-5">
            <Link to="/home" className="hover:text-orange-500 transition-colors">← Back to Home</Link>
          </p>

        </div>
      </div>

    </div>
  )
}
