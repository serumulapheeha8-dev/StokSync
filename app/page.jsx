'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // If already logged in, go to dashboard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard')
    })
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4zm-2 17l-5-5 1.4-1.4L14 18.2l7.6-7.6L23 12l-9 9z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">StokSync</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your stokvel groups</p>
        </div>

        {!sent ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Thembi Nkosi"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="thembi@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand hover:bg-brand-dark text-white font-medium rounded-xl transition-colors disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send login link'}
            </button>
            <p className="text-center text-xs text-gray-400">
              We'll send a magic link to your email. No password needed.
            </p>
          </form>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-light mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 2C7.4 2 2 7.4 2 14s5.4 12 12 12 12-5.4 12-12S20.6 2 14 2zm-2 17l-5-5 1.4-1.4L12 16.2l7.6-7.6L21 10l-9 9z" fill="#1D9E75"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your email!</h2>
            <p className="text-gray-500 text-sm mb-2">
              We sent a login link to<br/>
              <span className="font-medium text-gray-900">{email}</span>
            </p>
            <p className="text-gray-400 text-xs">Click the link in the email to log in. Check your spam folder if you don't see it.</p>
            <button
              onClick={() => setSent(false)}
              className="mt-6 text-sm text-brand hover:underline"
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
