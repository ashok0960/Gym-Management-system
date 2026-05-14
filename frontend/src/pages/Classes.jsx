import React, { useState, useEffect } from 'react'
import { classAPI, paymentAPI, membershipAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'
import { CalendarIcon, ClockIcon, UserIcon, MapPinIcon, CreditCardIcon, XMarkIcon } from '@heroicons/react/24/outline'

const TYPES = ['YOGA', 'ZUMBA', 'CROSSFIT', 'BOXING', 'SPINNING', 'PILATES', 'AEROBICS', 'MEDITATION']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const METHODS = ['CASH', 'CARD', 'ESEWA', 'KHALTI', 'ONLINE']

// Class booking fee in Rs.
const CLASS_FEE = 500

export default function Classes() {
  const { isMember } = useAuth()
  const [classes, setClasses] = useState([])
  const [bookedIds, setBookedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [payModal, setPayModal] = useState(null) // holds class object
  const [payMethod, setPayMethod] = useState('ESEWA')
  const [paying, setPaying] = useState(false)
  const [plans, setPlans] = useState([])

  const load = async () => {
    try {
      setLoading(true)
      const params = filter ? { type: filter } : {}
      const [cRes, bRes, plRes] = await Promise.all([
        classAPI.getAll(params),
        classAPI.myBookings(),
        membershipAPI.getPlans(),
      ])
      setClasses(Array.isArray(cRes.data) ? cRes.data : cRes.data?.results || [])
      const bookingData = Array.isArray(bRes.data) ? bRes.data : bRes.data?.results || []
      setBookedIds(new Set(bookingData.filter(b => b.status === 'CONFIRMED').map(b => b.gym_class)))
      setPlans(Array.isArray(plRes.data) ? plRes.data : plRes.data?.results || [])
    } catch {
      toast.error('Failed to load classes')
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const openPayModal = (cls) => {
    setPayModal(cls)
    setPayMethod('ESEWA')
  }

  const confirmBooking = async () => {
    if (!payModal) return
    setPaying(true)
    try {
      // Create payment record first
      const plan = plans[0] // use first active plan or null
      await paymentAPI.create({
        amount: CLASS_FEE,
        payment_method: payMethod,
        membership_plan: plan?.id || null,
        notes: `Class booking: ${payModal.name}`,
      })
      // Then book the class
      await classAPI.book(payModal.id)
      toast.success(`Booked "${payModal.name}" — Rs. ${CLASS_FEE} paid via ${payMethod}`)
      setPayModal(null)
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Booking failed')
    } finally {
      setPaying(false)
    }
  }

  const cancel = async (id) => {
    try {
      await classAPI.cancelBooking(id)
      toast.success('Booking cancelled')
      load()
    } catch {
      toast.error('Cancel failed')
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Fitness Classes</h1>
          <p className="text-gray-500 text-sm mt-1">{classes.length} classes available · Booking fee: Rs. {CLASS_FEE}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${!filter ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary'}`}>
            All
          </button>
          {TYPES.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${filter === t ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CalendarIcon className="w-16 h-16 mx-auto mb-3" />
          <p>No classes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map(cls => (
            <div key={cls.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div className="bg-gradient-to-r from-primary to-orange-400 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-lg">{cls.name}</h3>
                    <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full mt-1 inline-block">{cls.class_type_display}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${cls.difficulty_level === 'BEGINNER' ? 'bg-green-100 text-green-700' : cls.difficulty_level === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {cls.difficulty_level}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserIcon className="w-4 h-4 text-primary flex-shrink-0" />{cls.trainer_details?.name || 'TBA'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4 text-primary flex-shrink-0" />{DAYS[cls.day_of_week]}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 text-primary flex-shrink-0" />{cls.start_time} – {cls.end_time} ({cls.duration_minutes} min)
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPinIcon className="w-4 h-4 text-primary flex-shrink-0" />{cls.location}
                </div>
                {cls.description && <p className="text-xs text-gray-400 pt-1 line-clamp-2">{cls.description}</p>}

                <div className="pt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Available spots</span>
                    <span className="font-medium">{cls.available_spots} / {cls.capacity}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-primary rounded-full h-1.5"
                      style={{ width: `${Math.min(100, ((cls.capacity - cls.available_spots) / cls.capacity) * 100)}%` }} />
                  </div>
                </div>

                {/* Booking fee badge */}
                {isMember && !bookedIds.has(cls.id) && cls.available_spots > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 rounded-lg px-2 py-1">
                    <CreditCardIcon className="w-3.5 h-3.5" />
                    Booking fee: Rs. {CLASS_FEE}
                  </div>
                )}

                {isMember && (
                  <button
                    onClick={() => bookedIds.has(cls.id) ? cancel(cls.id) : openPayModal(cls)}
                    disabled={cls.available_spots === 0 && !bookedIds.has(cls.id)}
                    className={`w-full mt-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      bookedIds.has(cls.id) ? 'bg-red-500 hover:bg-red-600 text-white'
                      : cls.available_spots === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-orange-600 text-white'}`}>
                    {bookedIds.has(cls.id) ? 'Cancel Booking' : cls.available_spots === 0 ? 'Class Full' : 'Book & Pay'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Confirm Booking</h3>
              <button onClick={() => setPayModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 mb-4">
              <p className="font-semibold text-gray-800">{payModal.name}</p>
              <p className="text-sm text-gray-500">{DAYS[payModal.day_of_week]} · {payModal.start_time} – {payModal.end_time}</p>
              <p className="text-sm text-gray-500">{payModal.location}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                {METHODS.map(m => (
                  <button key={m} type="button" onClick={() => setPayMethod(m)}
                    className={`py-2 rounded-lg text-xs font-semibold border-2 transition-all ${payMethod === m ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3 mb-5">
              <span className="text-gray-600 font-medium text-sm">Total Amount</span>
              <span className="text-primary text-xl font-bold">Rs. {CLASS_FEE}</span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setPayModal(null)} className="flex-1 btn-outline">Cancel</button>
              <button onClick={confirmBooking} disabled={paying} className="flex-1 btn-primary">
                {paying ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Pay & Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
