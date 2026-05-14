import React, { useState, useEffect, useRef } from 'react'
import { supportAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon,
  SparklesIcon, UserCircleIcon, ShieldCheckIcon,
} from '@heroicons/react/24/outline'

function MsgBubble({ msg }) {
  const isUser = msg.sender_type === 'USER'
  const isAI = msg.sender_type === 'AI'
  const isStaff = msg.sender_type === 'STAFF'

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
        isUser ? 'bg-orange-500' : isAI ? 'bg-purple-500' : 'bg-blue-500'}`}>
        {isUser
          ? <UserCircleIcon className="w-4 h-4 text-white" />
          : isAI
          ? <SparklesIcon className="w-4 h-4 text-white" />
          : <ShieldCheckIcon className="w-4 h-4 text-white" />}
      </div>

      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        {!isUser && (
          <span className="text-[10px] text-gray-400 px-1">{msg.sender_name}</span>
        )}
        <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-orange-500 text-white rounded-tr-sm'
            : isStaff
            ? 'bg-blue-50 text-blue-900 border border-blue-100 rounded-tl-sm'
            : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
          {msg.message}
        </div>
        <span className="text-[10px] text-gray-300 px-1">
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

export default function SupportWidget() {
  const { isAuthenticated, isAdmin, isVendor } = useAuth()
  const [open, setOpen] = useState(false)
  const [ticket, setTicket] = useState(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pulse, setPulse] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Staff view state
  const [staffTickets, setStaffTickets] = useState([])
  const [activeTicket, setActiveTicket] = useState(null)
  const [staffInput, setStaffInput] = useState('')
  const [staffSending, setStaffSending] = useState(false)

  const isStaff = isAdmin || isVendor

  useEffect(() => {
    if (!isAuthenticated) return
    if (open) {
      if (isStaff) loadStaffTickets()
      else loadMyTicket()
    }
  }, [open, isAuthenticated])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.messages, activeTicket?.messages])

  // Pulse when new staff reply arrives
  useEffect(() => {
    if (ticket?.messages?.some(m => m.sender_type === 'STAFF')) {
      setPulse(true)
      setTimeout(() => setPulse(false), 3000)
    }
  }, [ticket])

  const loadMyTicket = async () => {
    setLoading(true)
    try {
      const res = await supportAPI.getMyTicket()
      setTicket(res.data)
    } catch { /* no ticket yet */ }
    finally { setLoading(false) }
  }

  const loadStaffTickets = async () => {
    try {
      const res = await supportAPI.getStaffTickets()
      const data = Array.isArray(res.data) ? res.data : res.data?.results || []
      setStaffTickets(data)
    } catch { }
  }

  const loadActiveTicket = async (id) => {
    try {
      const res = await supportAPI.getTicketDetail(id)
      setActiveTicket(res.data)
    } catch { }
  }

  const sendMessage = async (e) => {
    e?.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    try {
      const res = await supportAPI.sendMessage(input.trim())
      setTicket(res.data)
      setInput('')
      setTimeout(() => inputRef.current?.focus(), 100)
    } catch {
      // ignore
    } finally {
      setSending(false)
    }
  }

  const staffReply = async (e) => {
    e?.preventDefault()
    if (!staffInput.trim() || staffSending || !activeTicket) return
    setStaffSending(true)
    try {
      const res = await supportAPI.staffReply(activeTicket.id, staffInput.trim())
      setActiveTicket(res.data)
      setStaffInput('')
      loadStaffTickets()
    } catch { }
    finally { setStaffSending(false) }
  }

  const resolveTicket = async (id) => {
    try {
      await supportAPI.updateStatus(id, 'RESOLVED')
      loadStaffTickets()
      if (activeTicket?.id === id) setActiveTicket(null)
    } catch { }
  }

  if (!isAuthenticated) return null

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          open ? 'bg-gray-700 rotate-0' : 'bg-orange-500 hover:bg-orange-600'
        } ${pulse ? 'ring-4 ring-blue-400 ring-offset-2' : ''}`}
      >
        {open
          ? <XMarkIcon className="w-6 h-6 text-white" />
          : <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />}
        {/* Unread dot */}
        {!open && pulse && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ height: '520px' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              {isStaff ? <ShieldCheckIcon className="w-5 h-5 text-white" /> : <SparklesIcon className="w-5 h-5 text-white" />}
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">
                {isStaff ? 'Support Inbox' : 'GymMS Support'}
              </p>
              <p className="text-orange-100 text-xs">
                {isStaff ? `${staffTickets.length} escalated ticket(s)` : 'AI-powered · Staff escalation'}
              </p>
            </div>
            <button onClick={() => setOpen(false)}>
              <XMarkIcon className="w-5 h-5 text-white/80 hover:text-white" />
            </button>
          </div>

          {/* ── STAFF VIEW ── */}
          {isStaff ? (
            <div className="flex flex-1 overflow-hidden">
              {/* Ticket list */}
              <div className={`${activeTicket ? 'hidden' : 'flex'} flex-col w-full overflow-y-auto`}>
                {staffTickets.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm">No escalated tickets</p>
                    <button onClick={loadStaffTickets} className="mt-3 text-xs text-orange-500 hover:underline">Refresh</button>
                  </div>
                ) : (
                  staffTickets.map(t => (
                    <button key={t.id} onClick={() => loadActiveTicket(t.id)}
                      className="text-left px-4 py-3 border-b border-gray-50 hover:bg-orange-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-gray-800">@{t.member_username}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          t.status === 'RESOLVED' ? 'bg-green-100 text-green-700'
                          : t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'}`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{t.last_message || t.subject}</p>
                    </button>
                  ))
                )}
              </div>

              {/* Active ticket chat */}
              {activeTicket && (
                <div className="flex flex-col w-full">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
                    <button onClick={() => setActiveTicket(null)} className="text-xs text-orange-500 hover:underline">← Back</button>
                    <span className="text-sm font-semibold text-gray-700 flex-1 truncate">@{activeTicket.member_username}</span>
                    {activeTicket.status !== 'RESOLVED' && (
                      <button onClick={() => resolveTicket(activeTicket.id)}
                        className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full hover:bg-green-200">
                        Resolve
                      </button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                    {activeTicket.messages.map(m => <MsgBubble key={m.id} msg={m} />)}
                    <div ref={bottomRef} />
                  </div>
                  <form onSubmit={staffReply} className="flex gap-2 p-3 border-t border-gray-100">
                    <input
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                      placeholder="Reply to member..."
                      value={staffInput}
                      onChange={e => setStaffInput(e.target.value)}
                    />
                    <button type="submit" disabled={staffSending || !staffInput.trim()}
                      className="w-9 h-9 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <PaperAirplaneIcon className="w-4 h-4 text-white" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* ── USER VIEW ── */
            <>
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !ticket || ticket.messages?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-3">
                      <SparklesIcon className="w-7 h-7 text-orange-500" />
                    </div>
                    <p className="font-semibold text-gray-800 mb-1">GymMS Assistant</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Ask me about classes, memberships, payments, trainers, or attendance. Complex issues get escalated to our staff!
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {['How to book a class?', 'Membership plans', 'Payment methods'].map(q => (
                        <button key={q} onClick={() => setInput(q)}
                          className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  ticket.messages.map(m => <MsgBubble key={m.id} msg={m} />)
                )}
                <div ref={bottomRef} />
              </div>

              {ticket?.is_escalated && (
                <div className="mx-3 mb-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 flex-shrink-0" />
                  Escalated to staff — waiting for reply
                </div>
              )}

              <form onSubmit={sendMessage} className="flex gap-2 p-3 border-t border-gray-100">
                <input
                  ref={inputRef}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                  placeholder="Ask anything..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
                />
                <button type="submit" disabled={sending || !input.trim()}
                  className="w-9 h-9 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-xl flex items-center justify-center flex-shrink-0 transition-all">
                  {sending
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <PaperAirplaneIcon className="w-4 h-4 text-white" />}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
