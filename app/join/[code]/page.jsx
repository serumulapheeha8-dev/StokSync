'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function JoinPage() {
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [joined, setJoined] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const params = useParams()
  const code = params.code
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      // Check auth status
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)

      // Load group info from invite code
      const { data, error } = await supabase
        .from('invite_links')
        .select('*, groups(id, name, contribution_amount, description)')
        .eq('code', code)
        .gte('expires_at', new Date().toISOString())
        .single()

      if (error || !data) {
        setError('This invite link is invalid or has expired.')
      } else {
        setGroup(data.groups)
      }
      setLoading(false)
    }
    load()
  }, [code])

  async function handleJoin() {
    if (!isLoggedIn) {
      // Save the invite code to localStorage so we can accept it after login
      localStorage.setItem('pendingInvite', code)
      router.push('/login')
      return
    }

    setJoining(true)
    setError('')

    const res = await fetch('/api/invite/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()

    if (data.success) {
      setJoined(true)
      setTimeout(() => router.push(`/groups/${data.groupId}`), 1500)
    } else {
      setError(data.error || 'Failed to join group')
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="StokSync" width="80" height="80" style={{ objectFit: 'contain', margin: '0 auto' }} />
          <p className="text-xs text-gray-400 mt-2">by Echelon Crest (PTY) LTD</p>
        </div>

        {error ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
            <div className="text-4xl mb-3">🔗</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Invalid Invite</h2>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-brand text-white font-medium rounded-xl"
            >
              Go to StokSync
            </button>
          </div>
        ) : joined ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">You've joined!</h2>
            <p className="text-gray-500 text-sm">Taking you to {group?.name}...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-brand-light flex items-center justify-center mx-auto mb-3">
                <span className="text-brand font-bold text-2xl">
                  {group?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{group?.name}</h2>
              <p className="text-brand font-semibold text-xl mt-1">
                R{group?.contribution_amount}/month
              </p>
              {group?.description && (
                <p className="text-gray-500 text-sm mt-2">{group.description}</p>
              )}
            </div>

            <div className="bg-brand-light rounded-xl p-4 mb-6">
              <p className="text-sm text-brand-dark text-center">
                You've been invited to join this stokvel group on StokSync
              </p>
            </div>

            {!isLoggedIn && (
              <p className="text-xs text-gray-400 text-center mb-4">
                You'll need to create an account or log in to join this group.
              </p>
            )}

            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full py-3 bg-brand hover:bg-brand-dark text-white font-medium rounded-xl transition-colors disabled:opacity-60"
            >
              {joining ? 'Joining...' : isLoggedIn ? `Join ${group?.name}` : 'Sign up to join'}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              StokSync helps South Africans manage their stokvel groups digitally.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
