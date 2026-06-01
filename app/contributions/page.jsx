'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function ContributionsPage() {
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }

      // Get all groups user is part of (as admin or member)
      const { data: adminGroups } = await supabase
        .from('groups')
        .select('id')
        .eq('admin_id', session.user.id)

      const { data: memberRows } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', session.user.id)

      const allGroupIds = [
        ...(adminGroups || []).map(g => g.id),
        ...(memberRows || []).map(m => m.group_id),
      ]

      if (allGroupIds.length === 0) { setLoading(false); return }

      const { data } = await supabase
        .from('contributions')
        .select('*, group_members(name), groups(name)')
        .in('group_id', [...new Set(allGroupIds)])
        .order('created_at', { ascending: false })

      setContributions(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'All' ? contributions : contributions.filter(c => c.status === filter)

  const totalPaid = contributions.filter(c => c.status === 'Paid').reduce((s, c) => s + c.amount, 0)
  const totalPending = contributions.filter(c => c.status === 'Pending').length

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
          <h1 className="text-xl font-semibold mb-4">Contributions</h1>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-brand-light rounded-2xl p-4">
              <p className="text-xs text-brand-dark mb-1">Total confirmed</p>
              <p className="text-xl font-semibold text-brand-dark">R{totalPaid.toLocaleString()}</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-4">
              <p className="text-xs text-amber-700 mb-1">Pending</p>
              <p className="text-xl font-semibold text-amber-600">{totalPending}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-4">
        {/* Filter chips */}
        <div className="flex gap-2 mb-4">
          {['All', 'Paid', 'Pending'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f ? 'bg-brand text-white' : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No contributions found</p>
          ) : (
            filtered.map(c => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
                  <span className="text-brand font-semibold text-xs">
                    {c.group_members?.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.group_members?.name}</p>
                  <p className="text-xs text-gray-400">{c.groups?.name} · {c.month}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${c.status === 'Paid' ? 'text-brand' : 'text-gray-900'}`}>
                    R{c.amount}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.status === 'Paid' ? 'bg-brand-light text-brand-dark' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Navbar />
    </div>
  )
}
