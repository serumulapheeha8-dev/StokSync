'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { generateReceipt } from '@/lib/generateReceipt'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function MyProfilePage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)
  const router = useRouter()
  const supabase = createClient()

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    setUser(session.user)

    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    setProfile(prof)

    const { data: mems } = await supabase
      .from('group_members')
      .select('*, groups(id, name, contribution_amount)')
      .eq('user_id', session.user.id)
    setMemberships(mems || [])

    if (mems && mems.length > 0) {
      const memberIds = mems.map(m => m.id)
      const { data: contribs } = await supabase
        .from('contributions')
        .select('*')
        .in('member_id', memberIds)
        .order('created_at', { ascending: false })
      setContributions(contribs || [])
    }

    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function uploadAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    const fileExt = file.name.split('.').pop()
    const filePath = `profile-${user.id}-${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      await supabase.from('group_members').update({ avatar_url: publicUrl }).eq('user_id', user.id)
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
    }
    setUploadingAvatar(false)
  }

  const paidContribs = contributions.filter(c => c.status === 'Paid')
  const totalContributed = paidContribs.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)
  const missedPayments = contributions.filter(c => c.status === 'Pending').length
  const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member'
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

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
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-brand-light flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-brand font-black text-3xl">{fullName.charAt(0).toUpperCase()}</span>
                )}
              </div>
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
              <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-1">Member since {joinDate}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-5 space-y-5">

        {/* Contact info */}
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2h2l1 3-1.5 1.5a9 9 0 004 4L9 9l3 1v2a1 1 0 01-1 1A11 11 0 011 3a1 1 0 011-1z" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Phone</p>
              <p className="text-sm font-medium text-gray-900">{profile?.phone || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="#6b7280" strokeWidth="1.5"/>
                <path d="M1 5l6 4 6-4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <p className="text-xl font-bold text-brand">R{totalContributed.toLocaleString('en-ZA')}</p>
            <p className="text-xs text-gray-400 mt-1">Total paid</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <p className="text-xl font-bold text-gray-900">{memberships.length}</p>
            <p className="text-xs text-gray-400 mt-1">Groups</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <p className={`text-xl font-bold ${missedPayments > 0 ? 'text-amber-500' : 'text-green-600'}`}>{missedPayments}</p>
            <p className="text-xs text-gray-400 mt-1">Pending</p>
          </div>
        </div>

        {/* My groups */}
        {memberships.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">My stokvels</h2>
            <div className="space-y-3">
              {memberships.map(m => (
                <Link key={m.id} href={`/members/${m.id}`} className="block bg-white rounded-2xl p-4 border border-gray-100 hover:border-brand/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
                        <span className="text-brand font-semibold text-sm">{m.groups?.name?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{m.groups?.name}</p>
                        <p className="text-xs text-gray-400">R{m.groups?.contribution_amount}/month · Payout #{m.payout_order}</p>
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 12l4-4-4-4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent payment history */}
        {contributions.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent payments</h2>
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
              {contributions.slice(0, 5).map(c => {
                const mem = memberships.find(m => m.id === c.member_id)
                return (
                  <div key={c.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${c.status === 'Paid' ? 'bg-green-50' : 'bg-amber-50'}`}>
                        {c.status === 'Paid' ? (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2.5 7l3 3 6-6" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="7" r="5.5" stroke="#d97706" strokeWidth="1.5"/>
                            <path d="M7 4v3.5l2 2" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.month}</p>
                        <p className="text-xs text-gray-400">{mem?.groups?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${c.status === 'Paid' ? 'text-green-600' : 'text-amber-500'}`}>
                        {c.status === 'Paid' ? `+R${c.amount}` : `R${c.amount}`}
                      </p>
                      <div className="flex items-center gap-2 justify-end mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                          {c.status}
                        </span>
                        {c.status === 'Paid' && (
                          <button
                            onClick={() => { const grp = memberships.find(x => x.id === c.member_id); generateReceipt(c, grp, grp?.groups).catch(err => ale
                            className="text-xs text-brand hover:underline flex-shrink-0"
                          >
                            Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
      <Navbar />
    </div>
  )
}