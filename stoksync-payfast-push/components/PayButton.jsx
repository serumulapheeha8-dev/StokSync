'use client'

import { useState } from 'react'

export default function PayButton({ contribution, member, group }) {
  const [loading, setLoading] = useState(false)

  async function handlePay() {
    setLoading(true)
    try {
      const res = await fetch('/api/payfast/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: contribution.amount,
          contributionId: contribution.id,
          memberName: member?.name || 'Member',
          memberEmail: member?.email || '',
          groupName: group?.name || 'Stokvel',
        }),
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      // Build PayFast form and submit
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = data.payfastUrl

      Object.entries(data.paymentData).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      alert('Payment error: ' + error.message)
      setLoading(false)
    }
  }

  if (contribution.status === 'Paid') {
    return (
      <span className="text-xs bg-brand-light text-brand-dark px-2.5 py-1 rounded-full font-medium flex-shrink-0">
        Paid ✓
      </span>
    )
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="text-xs bg-brand text-white px-3 py-1.5 rounded-full font-medium flex-shrink-0 hover:bg-brand-dark transition-colors disabled:opacity-60"
    >
      {loading ? 'Loading...' : 'Pay R' + contribution.amount}
    </button>
  )
}
