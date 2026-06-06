'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

function PaymentSuccessContent() {
  const [contribution, setContribution] = useState(null)
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const contributionId = searchParams.get('contribution_id')
    if (contributionId) {
      const checkPayment = async () => {
        const { data } = await supabase
          .from('contributions')
          .select('*, groups(name), group_members(name)')
          .eq('id', contributionId)
          .single()
        if (data) setContribution(data)
      }
      checkPayment()
      const interval = setInterval(checkPayment, 2000)
      setTimeout(() => clearInterval(interval), 30000)
      return () => clearInterval(interval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-light mb-6">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 4C11.2 4 4 11.2 4 20s7.2 16 16 16 16-7.2 16-16S28.8 4 20 4zm-3 23l-6-6 1.8-1.8L17 23.4l10.2-10.2L29 15l-12 12z" fill="#1D9E75"/>
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 text-sm mb-6">Your contribution has been received</p>

        {contribution && (
          <div className="bg-brand-light rounded-2xl p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Member</span>
              <span className="text-sm font-medium">{contribution.group_members?.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Group</span>
              <span className="text-sm font-medium">{contribution.groups?.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-sm font-medium text-brand">R{contribution.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Month</span>
              <span className="text-sm font-medium">{contribution.month}</span>
            </div>
          </div>
        )}

        <Link href="/dashboard" className="block w-full py-3 bg-brand text-white font-medium rounded-xl text-center hover:bg-brand-dark transition-colors">
          Back to Dashboard
        </Link>
        <p className="text-xs text-gray-400 mt-4">Powered by PayFast · Echelon Crest (PTY) LTD</p>
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"/></div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}