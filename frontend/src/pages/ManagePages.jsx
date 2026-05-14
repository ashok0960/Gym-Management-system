import React, { useState, useEffect } from 'react'
import { authAPI, classAPI, trainerAPI } from '../services/api'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'

// ─── Members ─────────────────────────────────────────────────────────────────
export function ManageMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => authAPI.getMembers().then(r => setMembers(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const toggle = async (id) => {
    try { await authAPI.toggleMemberStatus(id); toast.success('Status updated'); load() }
    catch { toast.error('Failed') }
  }

  if (loading) return <Spinner />

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Members ({members.length})</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-head">
            <tr>{['Name','Email','Phone','Membership','Role','Status','Joined'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.length === 0 ? (
              <tr><td colSpan="7" className="px-4 py-10 text-center text-gray-400">No members found</td></tr>
            ) : members.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">{m.user?.full_name}<br /><span className="text-xs text-gray-400">@{m.user?.username}</span></td>
                <td className="table-cell">{m.user?.email}</td>
                <td className="table-cell">{m.phone}</td>
                <td className="table-cell">
                  <span className={m.membership_type === 'VIP' ? 'badge-yellow' : m.membership_type === 'PREMIUM' ? 'badge-purple' : 'badge-blue'}>{m.membership_type}</span>
                </td>
                <td className="table-cell">{m.role}</td>
                <td className="table-cell">
                  <button onClick={() => toggle(m.id)} className={m.is_active ? 'badge-green cursor-pointer' : 'badge-red cursor-pointer'}>
                    {m.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="table-cell text-xs text-gray-400">{new Date(m.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Trainers ─────────────────────────────────────────────────────────────────
const SPECS = ['STRENGTH','CARDIO','YOGA','HIIT','NUTRITION','REHAB','BOXING','PILATES']
const T_DEF = { name:'', email:'', phone:'', specialization:'STRENGTH', experience_years:'', bio:'', qualification:'' }

export function ManageTrainers() {
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(T_DEF)

  const load = () => trainerAPI.getAll().then(r => setTrainers(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const open = (t = null) => { setEditing(t); setForm(t ? { name:t.name, email:t.email, phone:t.phone, specialization:t.specialization, experience_years:t.experience_years, bio:t.bio, qualification:t.qualification } : T_DEF); setModal(true) }

  const submit = async (e) => {
    e.preventDefault()
    try {
      editing ? await trainerAPI.update(editing.id, form) : await trainerAPI.create(form)
      toast.success(editing ? 'Updated!' : 'Added!')
      setModal(false); load()
    } catch { toast.error('Failed') }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this trainer?')) return
    try { await trainerAPI.delete(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  if (loading) return <Spinner />

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Trainers ({trainers.length})</h2>
        <button onClick={() => open()} className="btn-primary text-sm px-4 py-2"><PlusIcon className="w-4 h-4" />Add Trainer</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-head">
            <tr>{['Name','Specialization','Experience','Email','Phone','Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {trainers.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-10 text-center text-gray-400">No trainers found</td></tr>
            ) : trainers.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">{t.name}<br /><span className="text-xs text-gray-400">{t.qualification}</span></td>
                <td className="table-cell"><span className="badge-blue">{t.specialization_display}</span></td>
                <td className="table-cell">{t.experience_years} yrs</td>
                <td className="table-cell">{t.email}</td>
                <td className="table-cell">{t.phone}</td>
                <td className="table-cell">
                  <div className="flex gap-1">
                    <button onClick={() => open(t)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => del(t.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'Add'} Trainer</h3>
            <form onSubmit={submit} className="space-y-3">
              {[['Name','name','text'],['Email','email','email'],['Phone','phone','tel'],['Experience (years)','experience_years','number'],['Qualification','qualification','text']].map(([l,k,t]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
                  <input type={t} required className="input-field" value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <select className="input-field" value={form.specialization} onChange={e => setForm({...form,specialization:e.target.value})}>
                  {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea className="input-field" rows="2" value={form.bio} onChange={e => setForm({...form,bio:e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 btn-outline">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">{editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Classes ──────────────────────────────────────────────────────────────────
const CTYPES = ['YOGA','ZUMBA','CROSSFIT','BOXING','SPINNING','PILATES','AEROBICS','MEDITATION']
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const DIFF = ['BEGINNER','INTERMEDIATE','ADVANCED']
const C_DEF = { name:'', class_type:'YOGA', trainer:'', description:'', capacity:'', day_of_week:0, start_time:'09:00', end_time:'10:00', duration_minutes:60, location:'', difficulty_level:'BEGINNER', equipment_needed:'' }

export function ManageClasses() {
  const [classes, setClasses] = useState([])
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(C_DEF)

  const load = async () => {
    try {
      const [cRes, tRes] = await Promise.all([classAPI.getAll(), trainerAPI.getAll()])
      setClasses(cRes.data); setTrainers(tRes.data)
    } catch { toast.error('Failed') }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const open = (c = null) => { setEditing(c); setForm(c ? {...c, trainer: c.trainer || ''} : C_DEF); setModal(true) }

  const submit = async (e) => {
    e.preventDefault()
    try {
      editing ? await classAPI.update(editing.id, form) : await classAPI.create(form)
      toast.success(editing ? 'Updated!' : 'Added!')
      setModal(false); load()
    } catch { toast.error('Failed') }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this class?')) return
    try { await classAPI.delete(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  if (loading) return <Spinner />

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Classes ({classes.length})</h2>
        <button onClick={() => open()} className="btn-primary text-sm px-4 py-2"><PlusIcon className="w-4 h-4" />Add Class</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-head">
            <tr>{['Name','Type','Trainer','Schedule','Spots','Difficulty','Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {classes.length === 0 ? (
              <tr><td colSpan="7" className="px-4 py-10 text-center text-gray-400">No classes found</td></tr>
            ) : classes.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">{c.name}<br /><span className="text-xs text-gray-400">{c.location}</span></td>
                <td className="table-cell"><span className="badge-blue">{c.class_type}</span></td>
                <td className="table-cell">{c.trainer_details?.name || '—'}</td>
                <td className="table-cell text-xs">{DAYS[c.day_of_week]}<br />{c.start_time}–{c.end_time}</td>
                <td className="table-cell">{c.current_bookings}/{c.capacity}</td>
                <td className="table-cell">
                  <span className={c.difficulty_level === 'BEGINNER' ? 'badge-green' : c.difficulty_level === 'INTERMEDIATE' ? 'badge-yellow' : 'badge-red'}>{c.difficulty_level}</span>
                </td>
                <td className="table-cell">
                  <div className="flex gap-1">
                    <button onClick={() => open(c)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => del(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'Add'} Class</h3>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required className="input-field" value={form.name} onChange={e => setForm({...form,name:e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="input-field" value={form.class_type} onChange={e => setForm({...form,class_type:e.target.value})}>
                    {CTYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select className="input-field" value={form.difficulty_level} onChange={e => setForm({...form,difficulty_level:e.target.value})}>
                    {DIFF.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trainer</label>
                <select className="input-field" value={form.trainer} onChange={e => setForm({...form,trainer:e.target.value})}>
                  <option value="">No trainer</option>
                  {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                  <select className="input-field" value={form.day_of_week} onChange={e => setForm({...form,day_of_week:parseInt(e.target.value)})}>
                    {DAYS.map((d,i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" required className="input-field" value={form.location} onChange={e => setForm({...form,location:e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                  <input type="time" required className="input-field" value={form.start_time} onChange={e => setForm({...form,start_time:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                  <input type="time" required className="input-field" value={form.end_time} onChange={e => setForm({...form,end_time:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input type="number" required className="input-field" value={form.capacity} onChange={e => setForm({...form,capacity:e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field" rows="2" value={form.description} onChange={e => setForm({...form,description:e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 btn-outline">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">{editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
