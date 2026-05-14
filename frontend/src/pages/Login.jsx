import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { EyeIcon, EyeSlashIcon, BoltIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

const PERKS = [
  { emoji: '🏋️', text: 'Access 100+ weekly classes' },
  { emoji: '👨‍💼', text: 'Expert certified trainers' },
  { emoji: '📊', text: 'Track your progress live' },
  { emoji: '💳', text: 'Flexible membership plans' },
]

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { success, user } = await login(form.username, form.password)
    if (success) {
      if (user.is_admin || user.role === 'ADMIN') navigate('/admin')
      else if (user.is_vendor || user.role === 'VENDOR') navigate('/vendor')
      else navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
          alt="Gym"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/95 via-gray-900/80 to-orange-900/60" />

        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />

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
              <BoltIcon className="w-3.5 h-3.5" /> Welcome back, champion
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Your Fitness<br />
              <span className="text-orange-400">Journey Awaits</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-sm">
              Sign in to access your personalized dashboard, book classes, and track your progress.
            </p>

            <div className="space-y-4">
              {PERKS.map(({ emoji, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {emoji}
                  </div>
                  <span className="text-gray-300 text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <div className="border-l-2 border-orange-500 pl-4">
            <p className="text-gray-400 text-sm italic">"The only bad workout is the one that didn't happen."</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link to="/home" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xl">G</span>
              </div>
              <span className="font-black text-2xl text-gray-900">Gym<span className="text-orange-500">MS</span></span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Sign In</h1>
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                Create one free
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400"
                value={form.username}
                onChange={e => set('username', e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-400"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/30 text-sm"
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><span>Sign In</span><ArrowRightIcon className="w-4 h-4" /></>}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Register CTA */}
          <Link
            to="/register"
            className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-orange-500 text-gray-700 hover:text-orange-500 font-bold py-3.5 rounded-xl transition-all text-sm"
          >
            Create New Account
          </Link>

          {/* Back to home */}
          <p className="text-center text-xs text-gray-400 mt-6">
            <Link to="/home" className="hover:text-orange-500 transition-colors">← Back to Home</Link>
          </p>

        </div>
      </div>

    </div>
  )
}
