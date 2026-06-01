'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function GroupsPage() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      setUserId(session.user.id)

      const { data: adminGroups } = await supabase
        .from('groups')
        .select('*, group_members(id, name, status)')
        .eq('admin_id', session.user.id)
        .order('created_at', { ascending: false })

      const { data: memberRows } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', session.user.id)

      const memberGroupIds = memberRows?.map(m => m.group_id) || []
      let memberGroups = []
      if (memberGroupIds.length > 0) {
        const { data } = await supabase
          .from('groups')
          .select('*, group_members(id, name)')
          .in('id', memberGroupIds)
          .neq('admin_id', session.user.id)
        memberGroups = data || []
      }

      setGroups([...(adminGroups || []), ...memberGroups])
      setLoading(false)
    }
    load()
  }, [])

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
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-xl font-semibold">My Stokvels</h1>
          <Link
            href="/groups/new"
            className="bg-brand text-white text-sm font-medium px-4 py-2 rounded-xl"
          >
            + Create
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-5 space-y-3">
        {groups.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 6v16M6 14h16" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-gray-400 mb-4">No stokvel groups yet</p>
            <Link href="/groups/new" className="text-brand font-medium">Create your first group →</Link>
          </div>
        ) : (
          groups.map(group => {
            const memberCount = group.group_members?.length || 0
            const isAdmin = group.admin_id === userId
            return (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="block bg-white rounded-2xl p-5 border border-gray-100 hover:border-brand/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center">
                      <span className="text-brand font-bold text-lg">{group.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{group.name}</p>
                      <p className="text-xs text-gray-400">{group.cycle} · {memberCount} member{memberCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${isAdmin ? 'bg-brand-light text-brand-dark' : 'bg-gray-100 text-gray-500'}`}>
                    {isAdmin ? 'Admin' : 'Member'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-semibold text-gray-900">R{group.contribution_amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">per member / month</p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 15l5-5-5-5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </Link>
            )
          })
        )}
      </div>

      <Navbar />
    </div>
  )
}
