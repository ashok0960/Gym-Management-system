import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  EyeIcon, EyeSlashIcon, ArrowRightIcon, UserIcon,
  BuildingStorefrontIcon, CheckCircleIcon, BoltIcon,
  EnvelopeIcon, ArrowLeftIcon,
} from '@heroicons/react/24/outline'

const ALLOWED_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
  'live.com', 'icloud.com', 'protonmail.com', 'ymail.com',
])

const isValidEmailDomain = (email) => {
  const domain = email.split('@')[1]?.toLowerCase()
  return domain && ALLOWED_DOMAINS.has(domain)
}

const STEPS_INFO = [
  { icon: '📧', title: 'Verify your email', desc: 'Enter your email and get a code' },
  { icon: '👤', title: 'Fill your details', desc: 'Complete your profile info' },
  { icon: '🚀', title: 'Start your journey', desc: 'Access your dashboard instantly' },
]

export default function Register() {
  const [step, setStep] = useState(1) // 1=email verify, 2=fill form
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [codeSent, setCodeSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [verifiedEmail, setVerifiedEmail] = useState('')

  const [form, setForm] = useState({
    username: '', first_name: '', last_name: '',
    phone: '', address: '', password: '', password2: '', role: 'MEMBER',
  })
  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [loading, setLoading] = useState(false)

  const otpRefs = useRef([])
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  useEffect(() => {
    if (codeSent) setTimeout(() => otpRefs.current[0]?.focus(), 100)
  }, [codeSent])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // ── Step 1: Send OTP ──
  const sendCode = async () => {
    if (!email.trim()) { toast.error('Enter your email first'); return }
    if (!isValidEmailDomain(email)) {
      toast.error('Only Gmail, Yahoo, Outlook, Hotmail, iCloud, or ProtonMail are allowed')
      return
    }
    setSending(true)
    try {
      await authAPI.sendVerificationCode({ email: email.trim() })
      setCodeSent(true)
      setCountdown(60)
      toast.success('Verification code sent! Check your inbox.')
    } catch (err) {
      const data = err.response?.data
      const msg = data?.email?.[0] || data?.email || data?.error || data?.detail || 'Could not send code'
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSending(false)
    }
  }

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      otpRefs.current[5]?.focus()
    }
  }

  // Proceed to step 2 — actual verification happens on final submit
  const proceedToForm = () => {
    const code = otp.join('')
    if (code.length !== 6) { toast.error('Enter the full 6-digit code'); return }
    setVerifiedEmail(email.trim())
    setStep(2)
  }

  // ── Step 2: Submit registration ──
  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) { toast.error('Passwords do not match'); return }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    const result = await register({
      ...form,
      email: verifiedEmail,
      email_code: otp.join(''),
    })
    if (result.success) {
      const u = result.user
      if (u.is_admin || u.role === 'ADMIN') navigate('/admin')
      else if (u.is_vendor || u.role === 'VENDOR') navigate('/vendor')
      else navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80"
          alt="Gym" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/95 via-gray-900/85 to-orange-900/50" />
        <div className="absolute top-1/4 -left-16 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-16 w-64 h-64 bg-orange-600/15 rounded-full blur-3xl" />

        <div className="relative flex flex-col justify-between p-12 w-full">
          <Link to="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/40">
              <span className="text-white font-black text-xl">G</span>
            </div>
            <span className="text-white font-black text-2xl">Gym<span className="text-orange-400">MS</span></span>
          </Link>

          <div>
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <BoltIcon className="w-3.5 h-3.5" /> Join 2,500+ members today
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Start Your<br /><span className="text-orange-400">Fitness Story</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-sm">
              Verify your email first, then complete your profile to get instant access.
            </p>
            <div className="space-y-5">
              {STEPS_INFO.map(({ icon, title, desc }, i) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${
                      (step === 1 && i === 0) || (step === 2 && i <= 1)
                        ? 'bg-orange-500/30 border-orange-500/50'
                        : 'bg-white/5 border-white/10'
                    }`}>{icon}</div>
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${
                      (step === 2 && i === 0) ? 'bg-green-500' : 'bg-orange-500'
                    }`}>
                      {step === 2 && i === 0
                        ? <CheckCircleIcon className="w-3 h-3 text-white" />
                        : <span className="text-white text-[9px] font-black">{i + 1}</span>}
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

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex -space-x-2">
              {['🧑', '👩', '🧔', '👱'].map((e, i) => (
                <div key={i} className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-sm">{e}</div>
              ))}
            </div>
            <div>
              <p className="text-white text-xs font-semibold">2,500+ active members</p>
              <p className="text-gray-500 text-xs">Join the community today</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
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

          {/* ── STEP 1: Email Verification ── */}
          {step === 1 && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-black text-gray-900 mb-2">Verify Your Email</h1>
                <p className="text-gray-500 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600">Sign in</Link>
                </p>
              </div>

              <div className="space-y-4">
                {/* Email input + Send button */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address</label>
                  <div className="flex gap-2">
                    <input type="email" required placeholder="ram@gmail.com"
                      className={`flex-1 px-4 py-3 bg-white border-2 rounded-xl text-sm focus:outline-none transition-colors placeholder-gray-300 ${
                        email && !isValidEmailDomain(email)
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-gray-200 focus:border-orange-500'
                      }`}
                      value={email}
                      onChange={e => { setEmail(e.target.value); setCodeSent(false); setOtp(['','','','','','']) }}
                      disabled={codeSent && countdown > 0}
                    />
                    <button type="button" onClick={sendCode}
                      disabled={sending || !email.trim() || !isValidEmailDomain(email) || (codeSent && countdown > 0)}
                      className="px-4 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold whitespace-nowrap transition-all">
                      {sending ? 'Sending...' : codeSent && countdown > 0 ? `Resend (${countdown}s)` : codeSent ? 'Resend' : 'Send Code'}
                    </button>
                  </div>
                  {codeSent && (
                    <p className="text-green-600 text-xs mt-1.5 flex items-center gap-1">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      Code sent to {email}. Check your inbox and spam folder.
                    </p>
                  )}
                  {!codeSent && email && !isValidEmailDomain(email) && (
                    <p className="text-red-500 text-xs mt-1.5">
                      ⚠ Only Gmail, Yahoo, Outlook, Hotmail, iCloud, or ProtonMail are accepted.
                    </p>
                  )}
                </div>

                {/* OTP boxes — shown after code sent */}
                {codeSent && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Enter 6-Digit Code</label>
                    <div className="flex gap-2 justify-center mb-2" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input key={i} ref={el => otpRefs.current[i] = el}
                          type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className={`w-12 h-14 text-center text-2xl font-black border-2 rounded-xl focus:outline-none transition-all ${
                            digit ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 bg-white focus:border-orange-500'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 text-center">Code expires in 10 minutes</p>
                  </div>
                )}

                <button type="button" onClick={codeSent ? proceedToForm : sendCode}
                  disabled={sending || (!codeSent && !email.trim()) || (codeSent && otp.some(d => !d))}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/30 text-sm">
                  {sending
                    ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : codeSent
                    ? <><EnvelopeIcon className="w-4 h-4" /><span>Verify & Continue</span><ArrowRightIcon className="w-4 h-4" /></>
                    : <><span>Send Verification Code</span><ArrowRightIcon className="w-4 h-4" /></>}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-5">
                <Link to="/home" className="hover:text-orange-500 transition-colors">← Back to Home</Link>
              </p>
            </>
          )}

          {/* ── STEP 2: Registration Form ── */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  <ArrowLeftIcon className="w-4 h-4" /> Back
                </button>
                <div className="flex-1">
                  <h1 className="text-3xl font-black text-gray-900">Create Account</h1>
                </div>
              </div>

              {/* Verified email badge */}
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-5">
                <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-700">Email verified: <strong>{verifiedEmail}</strong></span>
              </div>

              {/* Role selector */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { role: 'MEMBER', Icon: UserIcon, label: 'Member', sub: 'Book classes & track progress' },
                  { role: 'VENDOR', Icon: BuildingStorefrontIcon, label: 'Vendor', sub: 'Manage gym operations' },
                ].map(({ role, Icon, label, sub }) => (
                  <button key={role} type="button" onClick={() => set('role', role)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${form.role === role ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-300'}`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${form.role === role ? 'bg-orange-500' : 'bg-gray-100'}`}>
                      <Icon className={`w-5 h-5 ${form.role === role ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${form.role === role ? 'text-orange-600' : 'text-gray-700'}`}>{label}</p>
                      <p className="text-xs text-gray-400 leading-tight">{sub}</p>
                    </div>
                    {form.role === role && <CheckCircleIcon className="w-4 h-4 text-orange-500 ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">First Name</label>
                    <input type="text" required placeholder="Ram"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-300"
                      value={form.first_name} onChange={e => set('first_name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Last Name</label>
                    <input type="text" required placeholder="Sharma"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-300"
                      value={form.last_name} onChange={e => set('last_name', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Username</label>
                  <input type="text" required placeholder="ramsharma123"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-300"
                    value={form.username} onChange={e => set('username', e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Phone</label>
                    <input type="tel" required placeholder="98XXXXXXXX"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-300"
                      value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Address</label>
                    <input type="text" required placeholder="Kathmandu, Nepal"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-300"
                      value={form.address} onChange={e => set('address', e.target.value)} />
                  </div>
                </div>

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
                          form.password2 && form.password !== form.password2 ? 'border-red-400'
                          : form.password2 && form.password === form.password2 ? 'border-green-400'
                          : 'border-gray-200 focus:border-orange-500'}`}
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

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/30 text-sm mt-2">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><span>Create Account</span><ArrowRightIcon className="w-4 h-4" /></>}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-5">
                <Link to="/home" className="hover:text-orange-500 transition-colors">← Back to Home</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
