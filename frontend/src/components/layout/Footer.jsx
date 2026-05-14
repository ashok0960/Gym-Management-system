import React from 'react'
import { Link } from 'react-router-dom'
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="font-bold text-lg text-white">Gym<span className="text-primary">MS</span></span>
            </div>
            <p className="text-sm leading-relaxed">Transform your body, elevate your mind. The ultimate fitness management system.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[['Classes', '/classes'], ['Trainers', '/trainers'], ['Memberships', '/memberships']].map(([l, p]) => (
                <li key={p}><Link to={p} className="hover:text-primary transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><MapPinIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /><span>123 Fitness Street, Gym City</span></li>
              <li className="flex items-center gap-2"><PhoneIcon className="w-4 h-4 text-primary flex-shrink-0" /><span>+1 (555) 123-4567</span></li>
              <li className="flex items-center gap-2"><EnvelopeIcon className="w-4 h-4 text-primary flex-shrink-0" /><span>info@gymms.com</span></li>
              <li className="flex items-start gap-2"><ClockIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /><span>Mon–Fri: 5AM–11PM<br />Sat–Sun: 6AM–9PM</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Newsletter</h4>
            <p className="text-sm mb-3">Get updates on classes and offers.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Your email" className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-primary" />
              <button className="px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition-all">Go</button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
          <p>© {new Date().getFullYear()} GymMS. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
