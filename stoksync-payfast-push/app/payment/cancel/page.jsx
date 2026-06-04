'use client'

import Link from 'next/link'

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 4C11.2 4 4 11.2 4 20s7.2 16 16 16 16-7.2 16-16S28.8 4 20 4zm5 19l-1.8 1.8L20 22.8l-3.2 2-1.8-1.8L17.2 20l-2-3.2 1.8-1.8L20 17.2l3.2-2 1.8 1.8L22.8 20l2 3z" fill="#ef4444"/>
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Payment Cancelled</h1>
        <p className="text-gray-500 text-sm mb-6">Your payment was not completed. No money was taken.</p>

        <Link
          href="/contributions"
          className="block w-full py-3 bg-brand text-white font-medium rounded-xl text-center hover:bg-brand-dark transition-colors mb-3"
        >
          Try again
        </Link>
        <Link
          href="/dashboard"
          className="block w-full py-3 border border-gray-200 text-gray-600 font-medium rounded-xl text-center hover:bg-gray-50 transition-colors"
        >
          Back to Dashboard
        </Link>

        <p className="text-xs text-gray-400 mt-4">
          Powered by PayFast · Echelon Crest (PTY) LTD
        </p>
      </div>
    </div>
  )
}
