'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function MemberProfilePage() {
  const [member, setMember] = useState(null)
  const [group, setGroup] = useState(null)
  const [contributions, setContributions] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const fileInputRef = useRef(null)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    // Get member details
    const { data: mem } = await supabase
      .from('group_members')
      .select('*, groups(*)')
      .eq('id', params.memberId)
      .single()

    if (!mem) { router.back(); return }

    setMember(mem)
    setGroup(mem.groups)
    setNotes(mem.notes || '')
    setIsAdmin(mem.groups?.admin_id === session.user.id)

    // Get all contributions for this member
    const { data: contribs } = await supabase
      .from('contributions')
      .select('*')
      .eq('member_id', params.memberId)
      .order('created_at', { ascending: false })

    setContributions(contribs || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [params.memberId])

  async function uploadAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    const fileExt = file.name.split('.').pop()
    const filePath = `member-${params.memberId}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      await supabase
        .from('group_members')
        .update({ avatar_url: publicUrl })
        .eq('id', params.memberId)

      setMember(prev => ({ ...prev, avatar_url: publicUrl }))
    }
    setUploadingAvatar(false)
  }

  async function saveNotes() {
    setSavingNotes(true)
    await supabase
      .from('group_members')
      .update({ notes })
      .eq('id', params.memberId)
    setMember(prev => ({ ...prev, notes }))
    setEditingNotes(false)
    setSavingNotes(false)
  }

  // Computed stats
  const paidContribs = contributions.filter(c => c.status === 'Paid')
  const pendingContribs = contributions.filter(c => c.status === 'Pending')
  const totalContributed = paidContribs.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)
  const missedPayments = pendingContribs.length

  // Contribution streak (consecutive months paid)
  const streak = (() => {
    let count = 0
    const sorted = [...paidContribs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    for (const c of sorted) {
      if (c.status === 'Paid') count++
      else break
    }
    return count
  })()

  const joinDate = member?.joined_at
    ? new Date(member.joined_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Unknown'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"/>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-6 border-b border-gray-100">
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.back()} className="text-gray-400 mb-4 flex items-center gap-1 text-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Back
          </button>

          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-brand-light flex items-center justify-center overflow-hidden">
                {member?.avatar_url ? (
                  <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-brand font-black text-3xl">{member?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              {isAdmin && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand rounded-full flex items-center justify-center shadow-sm"
                >
                  {uploadingAvatar ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"/>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 2v8M2 6h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{member?.name}</h1>
              <p className="text-sm text-gray-400">{group?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-brand-light text-brand-dark px-2 py-0.5 rounded-full font-medium">
                  Payout #{member?.payout_order || '—'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  missedPayments === 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {missedPayments === 0 ? '✓ All paid' : `${missedPayments} pending`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-5 space-y-5">

        {/* Contact info */}
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 7a3 3 0 100-6 3 3 0 000 6zM1 13c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900">{member?.email || '—'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2h2l1 3-1.5 1.5a9 9 0 004 4L9 9l3 1v2a1 1 0 01-1 1A11 11 0 011 3a1 1 0 011-1z" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-900">{member?.phone || '—'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="#6b7280" strokeWidth="1.5"/>
                  <path d="M4 1v2M10 1v2M1 6h12" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400">Join date</p>
                <p className="text-sm font-medium text-gray-900">{joinDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Total contributed</p>
            <p className="text-2xl font-bold text-brand">R{totalContributed.toLocaleString('en-ZA')}</p>
            <p className="text-xs text-gray-400 mt-1">{paidContribs.length} payments</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Missed payments</p>
            <p className={`text-2xl font-bold ${missedPayments > 0 ? 'text-amber-500' : 'text-green-600'}`}>
              {missedPayments}
            </p>
            <p className="text-xs text-gray-400 mt-1">{missedPayments === 0 ? 'Perfect record' : 'pending'}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Payment streak</p>
            <p className="text-2xl font-bold text-gray-900">{streak}</p>
            <p className="text-xs text-gray-400 mt-1">consecutive months</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Outstanding</p>
            <p className={`text-2xl font-bold ${pendingContribs.length > 0 ? 'text-amber-500' : 'text-green-600'}`}>
              R{pendingContribs.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0).toLocaleString('en-ZA')}
            </p>
            <p className="text-xs text-gray-400 mt-1">unpaid amount</p>
          </div>
        </div>

        {/* Admin notes */}
        {isAdmin && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Admin notes</p>
              {!editingNotes ? (
                <button onClick={() => setEditingNotes(true)} className="text-xs text-brand font-medium">
                  {notes ? 'Edit' : '+ Add note'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setEditingNotes(false); setNotes(member?.notes || '') }} className="text-xs text-gray-400">Cancel</button>
                  <button onClick={saveNotes} disabled={savingNotes} className="text-xs text-brand font-medium">{savingNotes ? 'Saving...' : 'Save'}</button>
                </div>
              )}
            </div>
            {editingNotes ? (
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add private notes about this member..."
                rows={3}
                className="w-full text-sm text-gray-700 bg-gray-50 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            ) : (
              <p className="text-sm text-gray-500">{notes || 'No notes yet.'}</p>
            )}
          </div>
        )}

        {/* Payment history */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment history</h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {contributions.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No contributions yet</p>
            ) : (
              contributions.map(c => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      c.status === 'Paid' ? 'bg-green-50' : 'bg-amber-50'
                    }`}>
                      {c.status === 'Paid' ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2.5 7l3 3 6-6" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M7 4v3.5l2 2" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
                          <circle cx="7" cy="7" r="5.5" stroke="#d97706" strokeWidth="1.5"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.month}</p>
                      <p className="text-xs text-gray-400">
                        {c.paid_at
                          ? new Date(c.paid_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
                          : c.status === 'Pending' ? 'Not yet paid' : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${c.status === 'Paid' ? 'text-green-600' : 'text-amber-500'}`}>
                      {c.status === 'Paid' ? `+R${c.amount}` : `R${c.amount}`}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <Navbar />
    </div>
  )
}