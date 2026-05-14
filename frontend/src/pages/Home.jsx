import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Bars3Icon, XMarkIcon, BoltIcon, UserGroupIcon, CalendarDaysIcon,
  CreditCardIcon, ChartBarIcon, ShieldCheckIcon, StarIcon,
  ArrowRightIcon, CheckCircleIcon, PhoneIcon, EnvelopeIcon, MapPinIcon,
} from '@heroicons/react/24/outline'

const FEATURES = [
  {
    Icon: UserGroupIcon,
    title: 'Expert Trainers',
    desc: 'Work with certified professionals who craft personalized plans to hit your goals faster.',
    color: 'from-orange-500 to-red-500',
  },
  {
    Icon: CalendarDaysIcon,
    title: 'Class Scheduling',
    desc: 'Book yoga, HIIT, boxing and more with one tap. Never miss a session again.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    Icon: CreditCardIcon,
    title: 'Flexible Memberships',
    desc: 'Monthly, quarterly or yearly plans. Upgrade or cancel anytime — no hidden fees.',
    color: 'from-green-500 to-teal-500',
  },
  {
    Icon: ChartBarIcon,
    title: 'Progress Tracking',
    desc: 'Visual dashboards show your attendance, bookings and fitness journey at a glance.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    Icon: BoltIcon,
    title: 'Attendance System',
    desc: 'QR-based check-in keeps your records accurate and your streaks unbroken.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    Icon: ShieldCheckIcon,
    title: 'Secure & Reliable',
    desc: 'JWT-protected accounts and encrypted data so your information stays private.',
    color: 'from-teal-500 to-cyan-500',
  },
]

const PLANS = [
  { name: 'Basic', price: 2900, period: 'month', features: ['Access to gym floor', '2 group classes/week', 'Locker room access', 'Basic progress tracking'], highlight: false },
  { name: 'Premium', price: 4900, period: 'month', features: ['Everything in Basic', 'Unlimited group classes', '1 PT session/month', 'Nutrition guidance', 'Priority booking'], highlight: true },
  { name: 'VIP', price: 9900, period: 'month', features: ['Everything in Premium', '4 PT sessions/month', 'Dedicated trainer', 'Spa & sauna access', 'Guest passes (2/month)'], highlight: false },
]

const STATS = [
  { value: '2,500+', label: 'Active Members' },
  { value: '50+', label: 'Expert Trainers' },
  { value: '100+', label: 'Weekly Classes' },
  { value: '98%', label: 'Satisfaction Rate' },
]

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Premium Member', text: 'Lost 15kg in 4 months. The trainers are incredible and the app makes booking so easy!', rating: 5 },
  { name: 'James K.', role: 'VIP Member', text: 'Best gym management system I\'ve used. Everything from payments to scheduling is seamless.', rating: 5 },
  { name: 'Priya S.', role: 'Basic Member', text: 'Affordable plans and amazing classes. The attendance tracker keeps me motivated every day.', rating: 5 },
]

export default function Home() {
  const { isAuthenticated, isAdmin, isTrainer, isVendor } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const dashLink = isAdmin ? '/admin' : (isTrainer || isVendor) ? '/trainer' : '/dashboard'

  const scrollTo = (id) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">G</span>
            </div>
            <span className={`font-black text-xl ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              Gym<span className="text-orange-400">MS</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {[['Features', 'features'], ['Plans', 'plans'], ['Testimonials', 'testimonials'], ['Contact', 'contact']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)}
                className={`text-sm font-medium transition-colors hover:text-orange-400 ${scrolled ? 'text-gray-700' : 'text-white/90'}`}>
                {label}
              </button>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <button onClick={() => navigate(dashLink)}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all">
                Go to Dashboard <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link to="/login"
                  className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
                  Sign In
                </Link>
                <Link to="/register"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg">
            {menuOpen
              ? <XMarkIcon className="w-6 h-6 text-gray-900" />
              : <Bars3Icon className={`w-6 h-6 ${scrolled ? 'text-gray-900' : 'text-white'}`} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2 shadow-xl">
            {[['Features', 'features'], ['Plans', 'plans'], ['Testimonials', 'testimonials'], ['Contact', 'contact']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-lg">
                {label}
              </button>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <button onClick={() => navigate(dashLink)}
                  className="btn-primary w-full">
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn-outline text-center">Sign In</Link>
                  <Link to="/register" className="btn-primary text-center">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80"
            alt="Gym"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-900/70 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <BoltIcon className="w-3.5 h-3.5" /> #1 Gym Management Platform
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              Transform Your<br />
              <span className="text-orange-400">Body & Mind</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-xl">
              The all-in-one gym management system. Book classes, track progress, manage memberships — all from one powerful platform.
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <button onClick={() => navigate(dashLink)}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-xl shadow-orange-500/30">
                  Open Dashboard <ArrowRightIcon className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <Link to="/register"
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-xl shadow-orange-500/30">
                    Start Free Today <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                  <Link to="/login"
                    className="flex items-center gap-2 border-2 border-white/30 hover:border-white text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <div className="w-0.5 h-8 bg-white/30 rounded-full" />
          <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-gray-900 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-black text-orange-400 mb-1">{value}</p>
                <p className="text-gray-400 text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-orange-500 text-sm font-bold uppercase tracking-widest">Why Choose Us</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2 mb-4">Everything You Need</h2>
            <p className="text-gray-500 max-w-xl mx-auto">A complete platform built for modern gyms — from member management to real-time analytics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GYM PHOTO SECTION ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-orange-500 text-sm font-bold uppercase tracking-widest">Our Facility</span>
              <h2 className="text-4xl font-black text-gray-900 mt-2 mb-6">
                World-Class Equipment,<br />
                <span className="text-orange-500">Expert Guidance</span>
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Our state-of-the-art facility is equipped with the latest machines, free weights, and dedicated zones for cardio, strength, yoga, and more. Every corner is designed to push your limits.
              </p>
              <ul className="space-y-3 mb-8">
                {['Modern cardio & strength equipment', 'Dedicated yoga & stretching studio', 'Olympic lifting platforms', 'Certified personal trainers on-site', 'Clean locker rooms & showers'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-700 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              {!isAuthenticated && (
                <Link to="/register"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg">
                  Join Now <ArrowRightIcon className="w-4 h-4" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80"
                alt="Gym equipment" className="rounded-2xl w-full h-56 object-cover shadow-lg" />
              <img src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80"
                alt="Training" className="rounded-2xl w-full h-56 object-cover shadow-lg mt-8" />
              <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80"
                alt="Yoga class" className="rounded-2xl w-full h-56 object-cover shadow-lg -mt-8" />
              <img src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80"
                alt="Weights" className="rounded-2xl w-full h-56 object-cover shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section id="plans" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-orange-500 text-sm font-bold uppercase tracking-widest">Pricing</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2 mb-4">Simple, Transparent Plans</h2>
            <p className="text-gray-500 max-w-xl mx-auto">No contracts, no surprises. Pick the plan that fits your goals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map(({ name, price, period, features, highlight }) => (
              <div key={name}
                className={`rounded-2xl p-8 relative transition-all duration-300 hover:-translate-y-1 ${highlight
                  ? 'bg-gray-900 text-white shadow-2xl shadow-gray-900/30 scale-105'
                  : 'bg-white border border-gray-100 shadow-sm'}`}>
                {highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className={`text-xl font-black mb-2 ${highlight ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-black ${highlight ? 'text-orange-400' : 'text-orange-500'}`}>Rs. {price.toLocaleString()}</span>
                  <span className={`text-sm ${highlight ? 'text-gray-400' : 'text-gray-400'}`}>/{period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className={`w-4 h-4 flex-shrink-0 ${highlight ? 'text-orange-400' : 'text-orange-500'}`} />
                      <span className={highlight ? 'text-gray-300' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={isAuthenticated ? dashLink : '/register'}
                  className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${highlight
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white'}`}>
                  {isAuthenticated ? 'Manage Plan' : 'Get Started'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-orange-500 text-sm font-bold uppercase tracking-widest">Testimonials</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2 mb-4">What Our Members Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, rating }) => (
              <div key={name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-orange-400 fill-orange-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{name}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      {!isAuthenticated && (
        <section className="relative py-24 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1600&q=80"
            alt="CTA" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gray-950/80" />
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Ready to Start Your<br /><span className="text-orange-400">Fitness Journey?</span>
            </h2>
            <p className="text-gray-300 mb-10 text-lg">Join thousands of members already transforming their lives.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register"
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-xl shadow-orange-500/30">
                Create Free Account <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link to="/login"
                className="flex items-center gap-2 border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-xl font-bold text-base transition-all">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CONTACT ── */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-orange-500 text-sm font-bold uppercase tracking-widest">Contact</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2 mb-4">Get In Touch</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { Icon: MapPinIcon, label: 'Address', value: '123 Fitness Street, Gym City' },
              { Icon: PhoneIcon, label: 'Phone', value: '+1 (555) 123-4567' },
              { Icon: EnvelopeIcon, label: 'Email', value: 'info@gymms.com' },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-orange-500" />
                </div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{label}</p>
                <p className="text-gray-700 font-medium text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black">G</span>
            </div>
            <span className="font-black text-white">Gym<span className="text-orange-400">MS</span></span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} GymMS. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <Link to="/login" className="hover:text-orange-400 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-orange-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
