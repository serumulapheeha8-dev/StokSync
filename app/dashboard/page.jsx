'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import InstallPrompt from '@/components/InstallPrompt'
import NotificationSettings from '@/components/NotificationSettings'

// Simple Bar Chart Component (no external library needed)
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.amount), 1)
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <p className="text-xs text-gray-400 font-medium">R{d.amount >= 1000 ? (d.amount/1000).toFixed(1)+'k' : d.amount}</p>
          <div className="w-full rounded-t-lg bg-brand-light overflow-hidden" style={{height: '60px'}}>
            <div
              className="w-full bg-brand rounded-t-lg transition-all duration-500"
              style={{height: `${Math.round((d.amount / max) * 60)}px`, marginTop: `${60 - Math.round((d.amount / max) * 60)}px`}}
            />
          </div>
          <p className="text-xs text-gray-400 truncate w-full text-center">{d.label}</p>
        </div>
      ))}
    </div>
  )
}

// Donut Chart Component
function DonutChart({ paid, total }) {
  const percentage = total === 0 ? 0 : Math.round((paid / total) * 100)
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="#f0fdf4" strokeWidth="10"/>
          <circle
            cx="48" cy="48" r={radius} fill="none"
            stroke="#1D9E75" strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
            style={{transition: 'stroke-dashoffset 0.5s ease'}}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xl font-black text-brand">{percentage}%</p>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{paid} of {total}</p>
        <p className="text-xs text-gray-400">members paid</p>
        <p className="text-xs text-gray-400">this month</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [groups, setGroups] = useState([])
  const [recentContributions, setRecentContributions] = useState([])
  const [stats, setStats] = useState({
    nextPayout: null,
    dueThisMonth: 0,
    totalCollected: 0,
    thisMonthCollected: 0,
    thisMonthPaid: 0,
    thisMonthTotal: 0,
    monthlyData: [],
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
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

      const { data: adminGroups } = await supabase
        .from('groups')
        .select('*')
        .eq('admin_id', session.user.id)

      const { data: memberRows } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', session.user.id)

      const memberGroupIds = (memberRows || []).map(m => m.group_id)
      let memberGroups = []
      if (memberGroupIds.length > 0) {
        const adminGroupIds = (adminGroups || []).map(g => g.id)
        const nonAdminGroupIds = memberGroupIds.filter(id => !adminGroupIds.includes(id))
        if (nonAdminGroupIds.length > 0) {
          const { data } = await supabase
            .from('groups')
            .select('*')
            .in('id', nonAdminGroupIds)
          memberGroups = data || []
        }
      }

      const allGroups = [...(adminGroups || []), ...memberGroups]
      setGroups(allGroups)

      if (allGroups.length > 0) {
        const groupIds = allGroups.map(g => g.id)

        // Recent activity
        const { data: contribs } = await supabase
          .from('contributions')
          .select('*, group_members(name), groups(name)')
          .in('group_id', groupIds)
          .order('created_at', { ascending: false })
          .limit(5)
        setRecentContributions(contribs || [])

        // All paid contributions for stats
        const { data: allPaid } = await supabase
          .from('contributions')
          .select('amount, month, status')
          .in('group_id', groupIds)
          .eq('status', 'Paid')

        // All contributions for this month
        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
        const { data: allContribs } = await supabase
          .from('contributions')
          .select('amount, month, status')
          .in('group_id', groupIds)

        const thisMonthContribs = (allContribs || []).filter(c => c.month === currentMonth)
        const thisMonthPaid = thisMonthContribs.filter(c => c.status === 'Paid')
        const thisMonthCollected = thisMonthPaid.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)
        const totalCollected = (allPaid || []).reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)

        // Build last 6 months bar chart data
        const months = []
        for (let i = 5; i >= 0; i--) {
          const d = new Date()
          d.setMonth(d.getMonth() - i)
          const label = d.toLocaleString('default', { month: 'short' })
          const fullMonth = d.toLocaleString('default', { month: 'long', year: 'numeric' })
          const amount = (allPaid || [])
            .filter(c => c.month === fullMonth)
            .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)
          months.push({ label, amount })
        }

        // Next payout
        const { data: nextPayoutData } = await supabase
          .from('payouts')
          .select('*, group_members(name)')
          .in('group_id', groupIds)
          .eq('status', 'Upcoming')
          .order('scheduled_date', { ascending: true })
          .limit(1)

        const { data: pendingContribs } = await supabase
          .from('contributions')
          .select('amount')
          .in('group_id', groupIds)
          .eq('status', 'Pending')

        setStats({
          nextPayout: nextPayoutData?.[0] || null,
          dueThisMonth: pendingContribs?.length || 0,
          totalCollected,
          thisMonthCollected,
          thisMonthPaid: thisMonthPaid.length,
          thisMonthTotal: thisMonthContribs.length,
          monthlyData: months,
        })
      }

      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const firstName = profile?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] || 'there'

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
      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-sm text-gray-400">Good day,</p>
            <h1 className="text-xl font-semibold text-gray-900">{firstName} 👋</h1>
          </div>
          <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
            Log out
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-5 space-y-5">

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">My groups</p>
            <p className="text-2xl font-semibold">{groups.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Pending</p>
            <p className="text-2xl font-semibold text-amber-500">{stats.dueThisMonth}</p>
          </div>
          <div className="bg-brand rounded-2xl p-4">
            <p className="text-xs text-white/70 mb-1">Total</p>
            <p className="text-lg font-semibold text-white">R{stats.totalCollected >= 1000 ? (stats.totalCollected/1000).toFixed(1)+'k' : stats.totalCollected}</p>
          </div>
        </div>

        {/* Current balance + This month */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Current balance</p>
            <p className="text-xl font-bold text-gray-900">R{stats.totalCollected.toLocaleString('en-ZA')}</p>
            <p className="text-xs text-gray-400 mt-1">Total collected</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">This month</p>
            <p className="text-xl font-bold text-brand">R{stats.thisMonthCollected.toLocaleString('en-ZA')}</p>
            <p className="text-xs text-gray-400 mt-1">{stats.thisMonthPaid} contributions paid</p>
          </div>
        </div>

        {/* Charts row */}
        {groups.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {/* Bar chart */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 col-span-2 sm:col-span-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">6-month trend</p>
              <BarChart data={stats.monthlyData} />
            </div>

            {/* Donut chart */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 col-span-2 sm:col-span-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">This month's progress</p>
              <DonutChart paid={stats.thisMonthPaid} total={stats.thisMonthTotal} />
              {stats.thisMonthTotal === 0 && (
                <p className="text-xs text-gray-400 mt-2">No contributions logged yet this month</p>
              )}
            </div>
          </div>
        )}

        <NotificationSettings />

        {/* Next payout */}
        {stats.nextPayout && (
          <div className="bg-brand-light rounded-2xl p-4 border border-brand/20">
            <p className="text-xs font-medium text-brand-dark mb-1">Next payout</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{stats.nextPayout.group_members?.name}</p>
                <p className="text-sm text-gray-500">
                  {stats.nextPayout.scheduled_date
                    ? new Date(stats.nextPayout.scheduled_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' })
                    : 'Date TBD'}
                </p>
              </div>
              {stats.nextPayout.amount && (
                <p className="text-xl font-semibold text-brand">R{stats.nextPayout.amount.toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        {/* My Stokvels */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">My Stokvels</h2>
            <Link href="/groups/new" className="text-sm text-brand font-medium">+ New</Link>
          </div>
          {groups.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <p className="text-gray-400 text-sm mb-3">No stokvel groups yet</p>
              <Link href="/groups/new" className="text-brand font-medium text-sm">+ Create your first stokvel</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.slice(0, 3).map(group => (
                <Link key={group.id} href={`/groups/${group.id}`} className="block bg-white rounded-2xl p-4 border border-gray-100 hover:border-brand/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
                        <span className="text-brand font-semibold text-sm">{group.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{group.name}</p>
                        <p className="text-xs text-gray-400">R{group.contribution_amount}/month</p>
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 12l4-4-4-4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </Link>
              ))}
              {groups.length > 3 && (
                <Link href="/groups" className="block text-center text-sm text-brand py-2">View all {groups.length} groups →</Link>
              )}
            </div>
          )}
        </div>

        {/* Recent activity */}
        {recentContributions.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent activity</h2>
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
              {recentContributions.map(c => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.group_members?.name}</p>
                    <p className="text-xs text-gray-400">{c.groups?.name} · {c.month}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${c.status === 'Paid' ? 'text-brand' : 'text-amber-500'}`}>
                      {c.status === 'Paid' ? `+R${c.amount}` : 'Pending'}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'Paid' ? 'bg-brand-light text-brand-dark' : 'bg-amber-50 text-amber-600'}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <Navbar />
      <InstallPrompt />
    </div>
  )
}