import React, { useState, useEffect } from 'react'
import {
  attendanceAPI,
  classAPI,
  authAPI
} from '../services/api'

import { useAuth } from '../context/AuthContext'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'

import {
  CheckCircleIcon,
  ClockIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline'

export default function Attendance() {

  const { user, isAdmin, isVendor } = useAuth()

  const canManage = isAdmin || isVendor

  const [attendance, setAttendance] = useState([])
  const [todayClasses, setTodayClasses] = useState([])
  const [members, setMembers] = useState([])

  const [loading, setLoading] = useState(true)

  const [selectedMember, setSelectedMember] = useState('')

  const [qr, setQr] = useState(null)

  // LOAD DATA

  const load = async () => {

    try {

      setLoading(true)

      const jsDay = new Date().getDay()

      const day = jsDay === 0
        ? 6
        : jsDay - 1

      const [aRes, cRes] = await Promise.all([

        attendanceAPI.getToday(),

        classAPI.getAll({ day })

      ])

      console.log('Attendance Response:', aRes.data)
      console.log('Classes Response:', cRes.data)

      // SAFE ATTENDANCE
      const attendanceData = Array.isArray(aRes.data)
        ? aRes.data
        : aRes.data.results || aRes.data.data || []

      // SAFE CLASSES
      const classesData = Array.isArray(cRes.data)
        ? cRes.data
        : cRes.data.results || cRes.data.data || []

      setAttendance(attendanceData)

      setTodayClasses(classesData)

      // MEMBERS

      if (canManage) {

        const mRes = await authAPI.getMembers()

        console.log('Members Response:', mRes.data)

        const membersData = Array.isArray(mRes.data)
          ? mRes.data
          : mRes.data.results || mRes.data.data || []

        setMembers(membersData)

      }

    } catch (error) {

      console.error(error)

      toast.error('Failed to load attendance')

      setAttendance([])
      setTodayClasses([])
      setMembers([])

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {

    load()

  }, [canManage])

  // MARK ATTENDANCE

  const mark = async (
    memberId,
    classId = null
  ) => {

    try {

      await attendanceAPI.mark({

        member_id: memberId,

        ...(classId && {
          class_id: classId
        })

      })

      toast.success('Attendance marked!')

      load()

    } catch (error) {

      console.error(error)

      toast.error(
        error.response?.data?.error ||
        'Failed to mark attendance'
      )

    }
  }

  // GENERATE QR

  const generateQR = async () => {

    try {

      const res = await attendanceAPI.generateQR()

      console.log('QR Response:', res.data)

      setQr(res.data)

      setTimeout(() => {

        setQr(null)

      }, 60000)

    } catch (error) {

      console.error(error)

      toast.error('Failed to generate QR')

    }
  }

  if (loading) return <Spinner />

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex items-center justify-between flex-wrap gap-4">

        <div>

          <h1 className="page-title">
            Attendance
          </h1>

          <p className="text-gray-500 text-sm mt-1">

            {new Date().toLocaleDateString(
              'en-US',
              {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }
            )}

          </p>

        </div>

        {canManage && (

          <button
            onClick={generateQR}
            className="btn-primary"
          >

            <QrCodeIcon className="w-5 h-5" />

            Generate QR Code

          </button>

        )}

      </div>

      {/* QR SECTION */}

      {qr && (

        <div className="bg-gradient-to-r from-primary to-orange-400 rounded-2xl p-6 text-white text-center">

          <QrCodeIcon className="w-12 h-12 mx-auto mb-3 opacity-80" />

          <p className="text-sm opacity-90 mb-2">

            Scan to mark attendance
            (expires in 60s)

          </p>

          <p className="text-4xl font-bold font-mono tracking-widest">

            {qr.code || '------'}

          </p>

        </div>

      )}

      {/* MANUAL ATTENDANCE */}

      {canManage && (

        <div className="card">

          <h2 className="section-title">
            Mark Attendance
          </h2>

          <div className="flex gap-3 flex-wrap">

            <select
              value={selectedMember}
              onChange={e =>
                setSelectedMember(e.target.value)
              }
              className="input-field flex-1 min-w-48"
            >

              <option value="">
                Select member
              </option>

              {members.map(member => (

                <option
                  key={member.id}
                  value={member.user?.id}
                >

                  {member.user?.username}

                  {' — '}

                  {member.membership_type}

                </option>

              ))}

            </select>

            <button
              onClick={() => mark(selectedMember)}
              disabled={!selectedMember}
              className="btn-primary disabled:opacity-50"
            >

              Mark Present

            </button>

          </div>

        </div>

      )}

      {/* TODAY ATTENDANCE */}

      <div className="card">

        <h2 className="section-title">

          Today's Attendance
          ({attendance.length})

        </h2>

        {attendance.length === 0 ? (

          <div className="text-center py-8 text-gray-400">

            <ClockIcon className="w-12 h-12 mx-auto mb-2" />

            <p>
              No attendance recorded today
            </p>

          </div>

        ) : (

          <div className="divide-y divide-gray-100">

            {attendance.map(record => (

              <div
                key={record.id}
                className="flex items-center justify-between py-3"
              >

                <div>

                  <p className="font-medium text-sm">

                    {record.member_details?.username ||
                      'Unknown Member'}

                  </p>

                  <p className="text-xs text-gray-500">

                    Check-in:

                    {' '}

                    {record.check_in_time
                      ? new Date(
                          record.check_in_time
                        ).toLocaleTimeString()
                      : '—'}

                  </p>

                  {record.class_details && (

                    <p className="text-xs text-gray-400">

                      Class:

                      {' '}

                      {record.class_details.name}

                    </p>

                  )}

                </div>

                <CheckCircleIcon className="w-6 h-6 text-green-500" />

              </div>

            ))}

          </div>

        )}

      </div>

      {/* TODAY CLASSES */}

      {canManage &&
        todayClasses.length > 0 && (

        <div className="card">

          <h2 className="section-title">
            Today's Classes
          </h2>

          <div className="divide-y divide-gray-100">

            {todayClasses.map(cls => (

              <div
                key={cls.id}
                className="flex items-center justify-between py-3"
              >

                <div>

                  <p className="font-medium text-sm">

                    {cls.name}

                  </p>

                  <p className="text-xs text-gray-500">

                    {cls.start_time}

                    {' – '}

                    {cls.end_time}

                    {' · '}

                    {cls.trainer_details?.name || 'TBA'}

                  </p>

                </div>

                <button
                  onClick={() => {
                    if (!selectedMember) {
                      toast.error('Select a member first')
                      return
                    }
                    mark(selectedMember, cls.id)
                  }}
                  className="btn-primary text-sm px-4 py-2"
                >

                  Mark

                </button>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>
  )
}
