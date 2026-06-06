'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import InstallPrompt from '@/components/InstallPrompt'
import NotificationBell from '@/components/NotificationBell'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [groups, setGroups] = useState([])
  const [recentContributions, setRecentContributions] = useState([])
  const [stats, setStats] = useState({ totalSaved: 0, nextPayout: null, dueThisMonth: 0 })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      setUser(session.user)

      // Load profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setProfile(prof)

      // Load groups where user is admin OR member
      const { data: adminGroups } = await supabase
        .from('groups')
        .select('*, group_members(count)')
        .eq('admin_id', session.user.id)

      const { data: memberGroups } = await supabase
        .from('groups')
        .select('*, group_members(count)')
        .neq('admin_id', session.user.id)
        .in('id', 
          (await supabase.from('group_members').select('group_id').eq('user_id', session.user.id))
          .data?.map(m => m.group_id) || []
        )

      const allGroups = [...(adminGroups || []), ...(memberGroups || [])]
      setGroups(allGroups)

      // Load recent contributions
      const { data: contribs } = await supabase
        .from('contributions')
        .select('*, group_members(name), groups(name)')
        .in('group_id', allGroups.map(g => g.id))
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentContributions(contribs || [])

      // Calculate stats
      const totalSaved = allGroups.reduce((sum, g) => sum + (g.contribution_amount || 0), 0)
      const { data: nextPayoutData } = await supabase
        .from('payouts')
        .select('*, group_members(name)')
        .in('group_id', allGroups.map(g => g.id))
        .eq('status', 'Upcoming')
        .order('scheduled_date', { ascending: true })
        .limit(1)

      const { data: pendingContribs } = await supabase
        .from('contributions')
        .select('amount')
        .in('group_id', allGroups.map(g => g.id))
        .eq('status', 'Pending')

      setStats({
        totalSaved,
        nextPayout: nextPayoutData?.[0] || null,
        dueThisMonth: pendingContribs?.length || 0,
      })

      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"/>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-sm text-gray-400">Good day,</p>
            <h1 className="text-xl font-semibold text-gray-900">{firstName} 👋</h1>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-5 space-y-5">
        {/* Stats */}
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
            <p className="text-xs text-white/70 mb-1">Groups</p>
            <p className="text-2xl font-semibold text-white">{groups.length}</p>
          </div>
        </div>

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

        {/* Groups */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">My Stokvels</h2>
            <Link href="/groups/new" className="text-sm text-brand font-medium">+ New</Link>
          </div>
          {groups.length === 0 ? (
            <Link href="/groups/new" className="block bg-white rounded-2xl p-6 border border-dashed border-gray-200 text-center">
              <p className="text-gray-400 text-sm mb-1">No groups yet</p>
              <p className="text-brand font-medium text-sm">+ Create your first stokvel</p>
            </Link>
          ) : (
            <div className="space-y-3">
              {groups.slice(0, 3).map(group => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="block bg-white rounded-2xl p-4 border border-gray-100 hover:border-brand/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
                        <span className="text-brand font-semibold text-sm">
                          {group.name.charAt(0).toUpperCase()}
                        </span>
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
                <Link href="/groups" className="block text-center text-sm text-brand py-2">
                  View all {groups.length} groups →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
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
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.status === 'Paid' ? 'bg-brand-light text-brand-dark' : 'bg-amber-50 text-amber-600'
                    }`}>
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
