'use client'

import { useState } from 'react'

export default function PayButton({ contribution, member, group }) {
  const [loading, setLoading] = useState(false)

  if (contribution.status === 'Paid') {
    return (
      <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
        Paid ✓
      </span>
    )
  }

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
          memberEmail: member?.email || 'test@test.com',
          groupName: group?.name || 'Stokvel',
        }),
      })

      const data = await res.json()

      if (!data.success) {
        alert('Payment error: ' + (data.error || 'Unknown error'))
        setLoading(false)
        return
      }

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
      alert('Error: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      style={{
        backgroundColor: '#1D9E75',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {loading ? 'Loading...' : `Pay R${contribution.amount}`}
    </button>
  )
}