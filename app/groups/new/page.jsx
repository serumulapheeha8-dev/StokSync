'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function NewGroupPage() {
  const [form, setForm] = useState({
    name: '',
    contribution_amount: '',
    cycle: 'Monthly',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }

    const { data, error: err } = await supabase
      .from('groups')
      .insert({
        name: form.name,
        contribution_amount: parseFloat(form.contribution_amount),
        cycle: form.cycle,
        description: form.description,
        admin_id: session.user.id,
        start_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    // Also add the admin as the first member
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', session.user.id)
      .single()

    await supabase.from('group_members').insert({
      group_id: data.id,
      user_id: session.user.id,
      name: profile?.full_name || session.user.email,
      email: session.user.email,
      payout_order: 1,
    })

    router.push(`/groups/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <h1 className="text-xl font-semibold">Create Stokvel</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-5 pt-6 space-y-5 pb-10">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Group name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Family Stokvel 2025"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contribution amount (R)</label>
          <input
            type="number"
            value={form.contribution_amount}
            onChange={e => setForm({ ...form, contribution_amount: e.target.value })}
            placeholder="e.g. 800"
            required
            min="1"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <p className="text-xs text-gray-400 mt-1">How much each member contributes per cycle</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contribution cycle</label>
          <select
            value={form.cycle}
            onChange={e => setForm({ ...form, cycle: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-white"
          >
            <option>Monthly</option>
            <option>Weekly</option>
            <option>Bi-weekly</option>
            <option>Quarterly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optional)</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="What is this stokvel for?"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="bg-brand-light rounded-xl p-4 text-sm text-brand-dark">
          <p className="font-medium mb-1">You'll be the admin 👑</p>
          <p className="text-brand-dark/70">As admin you can add members, confirm payments, and manage the payout schedule.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white font-medium rounded-xl transition-colors disabled:opacity-60"
        >
          {loading ? 'Creating...' : 'Create group'}
        </button>
      </form>
    </div>
  )
}
