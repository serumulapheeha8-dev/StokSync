'use client'

import { useState } from 'react'

export default function PayButton({ contribution, member, group }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (contribution.status === 'Paid') {
    return (
      <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium flex-shrink-0">
        Paid ✓
      </span>
    )
  }

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/yoco/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: contribution.amount,
          contributionId: contribution.id,
          memberName: member?.name || 'Member',
          groupName: group?.name || 'Stokvel',
        }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Payment failed')
        setLoading(false)
        return
      }

      // Redirect to Yoco checkout
      window.location.href = data.checkoutUrl

    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end flex-shrink-0">
      <button
        onClick={handlePay}
        disabled={loading}
        style={{
          backgroundColor: '#1D9E75',
          color: 'white',
          border: 'none',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Loading...' : `Pay R${contribution.amount}`}
      </button>
      {error && <p style={{fontSize:'11px', color:'red', marginTop:'3px'}}>{error}</p>}
    </div>
  )
}
