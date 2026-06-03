'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import InstallPrompt from '@/components/InstallPrompt'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
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
        data: { full_name: name, phone: phone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) { setError(error.message) } else { setSent(true) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <img src="/logo.png" alt="StokSync Logo" width="180" height="180" style={{objectFit:'contain'}} />
          </div>
          <p className="text-gray-400 text-xs mt-1">by Echelon Crest (PTY) LTD</p>
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
                placeholder="Your full name"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 0821234567"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
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
            <p className="text-gray-400 text-xs">Click the link in the email to log in. Check your spam if you don't see it.</p>
            <button onClick={() => setSent(false)} className="mt-6 text-sm text-brand hover:underline">
              Use a different email
            </button>
          </div>
        )}

        <div className="mt-10 text-center">
          <p className="text-xs text-gray-300">© 2025 Echelon Crest (PTY) LTD</p>
          <p className="text-xs text-gray-300 mt-0.5">All rights reserved</p>
        </div>
      </div>
      <InstallPrompt />
    </div>
  )
}