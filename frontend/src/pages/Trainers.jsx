import React, { useState, useEffect } from 'react'
import { trainerAPI } from '../services/api'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'

import {
  EnvelopeIcon,
  PhoneIcon,
  StarIcon
} from '@heroicons/react/24/outline'

const SPECS = [
  'STRENGTH',
  'CARDIO',
  'YOGA',
  'HIIT',
  'NUTRITION',
  'REHAB',
  'BOXING',
  'PILATES'
]

export default function Trainers() {

  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {

    const loadTrainers = async () => {

      try {

        setLoading(true)

        const params = filter
          ? { specialization: filter }
          : {}

        const response = await trainerAPI.getAll(params)

        console.log('Trainer Response:', response.data)

        // FIXED HERE
        const trainersData = Array.isArray(response.data)
          ? response.data
          : response.data.results || response.data.data || []

        setTrainers(trainersData)

      } catch (error) {

        console.error(error)

        toast.error('Failed to load trainers')

        setTrainers([])

      } finally {

        setLoading(false)

      }
    }

    loadTrainers()

  }, [filter])

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">

      <div>
        <h1 className="page-title">
          Our Trainers
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          {Array.isArray(trainers) ? trainers.length : 0} certified professionals
        </p>
      </div>

      {/* FILTER BUTTONS */}

      <div className="flex flex-wrap gap-2">

        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
            !filter
              ? 'bg-primary text-white border-primary'
              : 'border-gray-200 text-gray-600 hover:border-primary'
          }`}
        >
          All
        </button>

        {SPECS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              filter === s
                ? 'bg-primary text-white border-primary'
                : 'border-gray-200 text-gray-600 hover:border-primary'
            }`}
          >
            {s}
          </button>
        ))}

      </div>

      {/* EMPTY STATE */}

      {!Array.isArray(trainers) || trainers.length === 0 ? (

        <div className="text-center py-16 text-gray-400">
          No trainers found
        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {trainers.map(t => (

            <div
              key={t.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
            >

              {/* TOP HEADER */}

              <div className="bg-gradient-to-r from-primary to-orange-400 h-20 relative">

                {t.experience_years > 5 && (
                  <div className="absolute top-3 right-3 bg-yellow-400 rounded-full p-1.5">

                    <StarIcon className="w-4 h-4 text-white" />

                  </div>
                )}

              </div>

              {/* CARD CONTENT */}

              <div className="px-6 pb-6 -mt-8 text-center">

                {/* AVATAR */}

                <div className="w-16 h-16 bg-white rounded-full border-4 border-white shadow flex items-center justify-center mx-auto mb-3">

                  <span className="text-2xl font-bold text-primary">
                    {t.name ? t.name[0] : 'T'}
                  </span>

                </div>

                {/* NAME */}

                <h3 className="font-bold text-gray-800">
                  {t.name || 'Unknown Trainer'}
                </h3>

                {/* SPECIALIZATION */}

                <p className="text-primary text-sm font-medium">
                  {t.specialization_display || 'Trainer'}
                </p>

                {/* EXPERIENCE */}

                <p className="text-gray-400 text-xs mt-1">

                  {t.experience_years || 0} yrs

                  {t.qualification && ` · ${t.qualification}`}

                </p>

                {/* CONTACT */}

                <div className="mt-3 space-y-1 text-sm text-gray-600">

                  {t.email && (
                    <div className="flex items-center justify-center gap-2">

                      <EnvelopeIcon className="w-4 h-4" />

                      {t.email}

                    </div>
                  )}

                  {t.phone && (
                    <div className="flex items-center justify-center gap-2">

                      <PhoneIcon className="w-4 h-4" />

                      {t.phone}

                    </div>
                  )}

                </div>

                {/* BIO */}

                {t.bio && (
                  <p className="text-xs text-gray-400 mt-3 line-clamp-2">
                    {t.bio}
                  </p>
                )}

                {/* SOCIAL LINKS */}

                {(t.instagram || t.facebook) && (

                  <div className="flex justify-center gap-3 mt-3">

                    {t.instagram && (
                      <a
                        href={t.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Instagram
                      </a>
                    )}

                    {t.facebook && (
                      <a
                        href={t.facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Facebook
                      </a>
                    )}

                  </div>

                )}

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  )
}