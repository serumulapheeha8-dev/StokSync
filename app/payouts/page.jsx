'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [showAddPayout, setShowAddPayout] = useState(false)
  const [members, setMembers] = useState([])
  const [newPayout, setNewPayout] = useState({ group_id: '', member_id: '', scheduled_date: '', amount: '' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }
    setUserId(session.user.id)

    const { data: adminGroups } = await supabase
      .from('groups')
      .select('*')
      .eq('admin_id', session.user.id)

    setGroups(adminGroups || [])

    const allGroupIds = (adminGroups || []).map(g => g.id)
    if (allGroupIds.length === 0) { setLoading(false); return }

    const { data: allPayouts } = await supabase
      .from('payouts')
      .select('*, group_members(name, email), groups(name)')
      .in('group_id', allGroupIds)
      .order('scheduled_date', { ascending: true })

    setPayouts(allPayouts || [])

    const { data: allMembers } = await supabase
      .from('group_members')
      .select('*')
      .in('group_id', allGroupIds)
    setMembers(allMembers || [])

    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addPayout(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('payouts').insert({
      group_id: newPayout.group_id,
      member_id: newPayout.member_id,
      scheduled_date: newPayout.scheduled_date,
      amount: parseFloat(newPayout.amount),
      status: 'Upcoming',
    })
    setNewPayout({ group_id: '', member_id: '', scheduled_date: '', amount: '' })
    setShowAddPayout(false)
    setSaving(false)
    load()
  }

  async function markPayoutPaid(payoutId) {
    await supabase
      .from('payouts')
      .update({ status: 'Paid', paid_at: new Date().toISOString() })
      .eq('id', payoutId)
    load()
  }

  const filtered = selectedGroup === 'all' ? payouts : payouts.filter(p => p.group_id === selectedGroup)
  const upcoming = filtered.filter(p => p.status === 'Upcoming')
  const paid = filtered.filter(p => p.status === 'Paid')
  const isAdmin = (groupId) => groups.some(g => g.id === groupId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"/>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Payouts</h1>
            {groups.length > 0 && (
              <button
                onClick={() => setShowAddPayout(!showAddPayout)}
                className="bg-brand text-white text-sm font-medium px-4 py-2 rounded-xl"
              >
                + Schedule
              </button>
            )}
          </div>

          {/* Group filter */}
          {groups.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedGroup('all')}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedGroup === 'all' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                All groups
              </button>
              {groups.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroup(g.id)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedGroup === g.id ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-5 space-y-5">
        {/* Add payout form */}
        {showAddPayout && (
          <form onSubmit={addPayout} className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
            <p className="font-medium text-sm">Schedule a payout</p>
            <select
              value={newPayout.group_id}
              onChange={e => setNewPayout({ ...newPayout, group_id: e.target.value, member_id: '' })}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">Select group</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <select
              value={newPayout.member_id}
              onChange={e => setNewPayout({ ...newPayout, member_id: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">Select recipient</option>
              {members
                .filter(m => !newPayout.group_id || m.group_id === newPayout.group_id)
                .map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input
              type="date"
              value={newPayout.scheduled_date}
              onChange={e => setNewPayout({ ...newPayout, scheduled_date: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <input
              type="number"
              placeholder="Payout amount (R)"
              value={newPayout.amount}
              onChange={e => setNewPayout({ ...newPayout, amount: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAddPayout(false)} className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm bg-brand text-white rounded-xl disabled:opacity-60">{saving ? 'Saving...' : 'Schedule'}</button>
            </div>
          </form>
        )}

        {/* Upcoming payouts */}
        {upcoming.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Upcoming</h2>
            <div className="space-y-3">
              {upcoming.map((p, i) => {
                const isNext = i === 0
                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-2xl p-4 border ${isNext ? 'border-brand/30' : 'border-gray-100'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isNext ? 'bg-brand' : 'bg-brand-light'}`}>
                          <span className={`font-bold text-sm ${isNext ? 'text-white' : 'text-brand'}`}>
                            {p.group_members?.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{p.group_members?.name}</p>
                          <p className="text-xs text-gray-400">{p.groups?.name}</p>
                        </div>
                      </div>
                      {isNext && <span className="text-xs bg-brand text-white px-2 py-0.5 rounded-full">Next up</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-semibold text-gray-900">R{p.amount?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">
                          {p.scheduled_date
                            ? new Date(p.scheduled_date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'long' })
                            : 'Date TBD'}
                        </p>
                      </div>
                      {isAdmin(p.group_id) && (
                        <button
                          onClick={() => markPayoutPaid(p.id)}
                          className="text-sm bg-brand text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-dark transition-colors"
                        >
                          Mark paid
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Paid payouts */}
        {paid.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Completed</h2>
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
              {paid.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-500 font-semibold text-xs">{p.group_members?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{p.group_members?.name}</p>
                    <p className="text-xs text-gray-400">
                      {p.paid_at
                        ? new Date(p.paid_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
                        : p.groups?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-600">R{p.amount?.toLocaleString()}</p>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Paid ✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {payouts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 6v16M6 14h16" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-gray-400 mb-2">No payouts scheduled yet</p>
            {groups.length > 0 ? (
              <button onClick={() => setShowAddPayout(true)} className="text-brand font-medium text-sm">Schedule first payout →</button>
            ) : (
              <p className="text-gray-400 text-sm">Create a group first to schedule payouts</p>
            )}
          </div>
        )}
      </div>

      <Navbar />
    </div>
  )
}
