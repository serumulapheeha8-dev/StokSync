'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import PayButton from '@/components/PayButton'
import PaymentBadges from '@/components/PaymentBadges'

export default function ContributionsPage() {
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | pending | paid
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }

      const { data: adminGroups } = await supabase
        .from('groups')
        .select('id')
        .eq('admin_id', session.user.id)

      const { data: memberRows } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', session.user.id)

      const groupIds = [
        ...new Set([
          ...(adminGroups || []).map(g => g.id),
          ...(memberRows || []).map(m => m.group_id),
        ]),
      ]

      if (groupIds.length === 0) { setLoading(false); return }

      const { data: contribs } = await supabase
        .from('contributions')
        .select('*, groups(name), group_members(name, email, phone)')
        .in('group_id', groupIds)
        .order('created_at', { ascending: false })

      setContributions(contribs || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = contributions.filter(c => {
    if (filter === 'pending') return c.status !== 'Paid'
    if (filter === 'paid') return c.status === 'Paid'
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-semibold mb-4">Contributions</h1>
          <div className="flex gap-2">
            {['all', 'pending', 'paid'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                  filter === f ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-5">
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No contributions found</p>
          ) : (
            filtered.map(c => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{c.group_members?.name}</p>
                  <p className="text-xs text-gray-400">{c.groups?.name} · {c.month}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 flex-shrink-0">R{c.amount}</p>
                <PayButton
                  contribution={c}
                  member={c.group_members}
                  group={c.groups}
                />
              </div>
            ))
          )}
        </div>

        {/* PayFast / PayGate compliance: payment method logos + Terms link, shown on checkout flow */}
        <PaymentBadges />
      </div>

      <Navbar />
    </div>
  )
}
