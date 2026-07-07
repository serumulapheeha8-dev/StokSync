'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import InviteButton from '@/components/InviteButton'
import PayButton from '@/components/PayButton'

export default function GroupDetailPage() {
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [contributions, setContributions] = useState([])
  const [userId, setUserId] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('members')
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddContrib, setShowAddContrib] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '' })
  const [newContrib, setNewContrib] = useState({ member_id: '', month: '', amount: '' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    setUserId(session.user.id)

    const { data: grp } = await supabase
      .from('groups')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!grp) { router.push('/groups'); return }
    setGroup(grp)
    setIsAdmin(grp.admin_id === session.user.id)

    const { data: mems } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', params.id)
      .order('payout_order', { ascending: true })
    setMembers(mems || [])

    const { data: contribs } = await supabase
      .from('contributions')
      .select('*, group_members(name, email)')
      .eq('group_id', params.id)
      .order('created_at', { ascending: false })
    setContributions(contribs || [])

    setLoading(false)
  }

  useEffect(() => { load() }, [params.id])

  async function addMember(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('group_members').insert({
      group_id: params.id,
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone,
      payout_order: members.length + 1,
    })
    setNewMember({ name: '', email: '', phone: '' })
    setShowAddMember(false)
    setSaving(false)
    load()
  }

  async function addContribution(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('contributions').insert({
      group_id: params.id,
      member_id: newContrib.member_id,
      amount: parseFloat(newContrib.amount) || group.contribution_amount,
      month: newContrib.month,
      status: 'Pending',
    })
    setNewContrib({ member_id: '', month: '', amount: '' })
    setShowAddContrib(false)
    setSaving(false)
    load()
  }

  async function markPaid(contribId) {
    await supabase
      .from('contributions')
      .update({ status: 'Paid', paid_at: new Date().toISOString() })
      .eq('id', contribId)
    load()
  }

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  const paidThisMonth = contributions.filter(c => c.month === currentMonth && c.status === 'Paid').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"/>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">

      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => router.back()} className="text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold">{group.name}</h1>
              <p className="text-xs text-gray-400">R{group.contribution_amount} · {group.cycle}</p>
            </div>
            {isAdmin && (
              <span className="text-xs bg-brand-light text-brand-dark px-2 py-1 rounded-full font-medium">Admin</span>
            )}
          </div>

          {/* Stats */}
          {isAdmin && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-semibold">{members.length}</p>
                <p className="text-xs text-gray-400">Members</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-semibold text-brand">{paidThisMonth}</p>
                <p className="text-xs text-gray-400">Paid this month</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-semibold text-amber-500">{members.length - paidThisMonth}</p>
                <p className="text-xs text-gray-400">Pending</p>
              </div>
            </div>
          )}

          {/* Invite Button */}
          {isAdmin && (
            <InviteButton
              groupId={group.id}
              groupName={group.name}
              contributionAmount={group.contribution_amount}
            />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex max-w-lg mx-auto">
          {['members', 'contributions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab ? 'border-brand text-brand' : 'border-transparent text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-5">

        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <div>
            {isAdmin && (
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="w-full py-3 border border-dashed border-brand/40 text-brand text-sm font-medium rounded-xl mb-4 hover:bg-brand-light transition-colors"
              >
                + Add member
              </button>
            )}

            {showAddMember && (
              <form onSubmit={addMember} className="bg-white rounded-2xl p-4 border border-gray-100 mb-4 space-y-3">
                <p className="font-medium text-sm">New member</p>
                <input
                  type="text"
                  placeholder="Full name"
                  value={newMember.name}
                  onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={newMember.email}
                  onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={newMember.phone}
                  onChange={e => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddMember(false)} className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm bg-brand text-white rounded-xl disabled:opacity-60">{saving ? 'Adding...' : 'Add member'}</button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
              {members.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No members yet</p>
              ) : (
                members.map((member, i) => {
                  const memberContribs = contributions.filter(c => c.member_id === member.id)
                  const paidMonths = memberContribs.filter(c => c.status === 'Paid').length
                  return (
                    <div key={member.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/memb>
                      <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
                        <span className="text-brand font-semibold text-sm">{member.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.email} · Payout #{member.payout_order || i + 1}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">{paidMonths} paid</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* CONTRIBUTIONS TAB */}
        {activeTab === 'contributions' && (
          <div>
            {isAdmin && (
              <button
                onClick={() => setShowAddContrib(!showAddContrib)}
                className="w-full py-3 border border-dashed border-brand/40 text-brand text-sm font-medium rounded-xl mb-4 hover:bg-brand-light transition-colors"
              >
                + Log contribution
              </button>
            )}

            {showAddContrib && (
              <form onSubmit={addContribution} className="bg-white rounded-2xl p-4 border border-gray-100 mb-4 space-y-3">
                <p className="font-medium text-sm">Log contribution</p>
                <select
                  value={newContrib.member_id}
                  onChange={e => setNewContrib({ ...newContrib, member_id: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-white"
                >
                  <option value="">Select member</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Month (e.g. June 2026)"
                  value={newContrib.month}
                  onChange={e => setNewContrib({ ...newContrib, month: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <input
                  type="number"
                  placeholder="Amount (default)"
                  value={newContrib.amount}
                  onChange={e => setNewContrib({ ...newContrib, amount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddContrib(false)} className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm bg-brand text-white rounded-xl disabled:opacity-60">{saving ? 'Saving...' : 'Log it'}</button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
              {contributions.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No contributions logged yet</p>
              ) : (
                contributions.map(c => {
                  return (
                    <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900">{c.group_members?.name}</p>
                        <p className="text-xs text-gray-400">{c.month}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 flex-shrink-0">R{c.amount}</p>
                      {c.status === 'Paid' ? (
                        <span className="text-xs bg-brand-light text-brand-dark px-2.5 py-1 rounded-full font-medium flex-shrink-0">Paid ✓</span>
                      ) : (
                        <div className="flex gap-2 flex-shrink-0">
                          {isAdmin && (
                            <button
                              onClick={() => markPaid(c.id)}
                              className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full font-medium hover:bg-amber-100"
                            >
                              Confirm
                            </button>
                          )}
                          <PayButton
                            contribution={c}
                            member={c.group_members}
                            group={group}
                          />
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      <Navbar />
    </div>
  )
} 
