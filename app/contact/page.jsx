import Link from 'next/link'

export const metadata = {
  title: 'Contact Us — StokSync',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-brand hover:underline mb-6 inline-block">← Back to StokSync</Link>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500 mb-8">We're here to help. Reach out to us using the details below.</p>

        <div className="space-y-6">
          <div className="bg-brand-light rounded-2xl p-6 border border-brand/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2 5l8 6 8-6M2 5v10a1 1 0 001 1h14a1 1 0 001-1V5M2 5a1 1 0 011-1h14a1 1 0 011 1" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="font-semibold text-gray-900">Email Support</p>
            </div>
            <p className="text-sm text-gray-600 mb-1">For general queries, technical support, or feedback:</p>
            <a href="mailto:echeloncrest584@gmail.com" className="text-brand-dark font-medium hover:underline">
              echeloncrest584@gmail.com
            </a>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p className="font-semibold text-gray-900 mb-2">Company Details</p>
            <p className="text-sm text-gray-600">Echelon Crest (PTY) LTD</p>
            <p className="text-sm text-gray-600">Republic of South Africa</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p className="font-semibold text-gray-900 mb-2">Response Time</p>
            <p className="text-sm text-gray-600">We aim to respond to all queries within 1–2 business days.</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4 text-sm text-gray-400">
          <Link href="/privacy" className="hover:text-brand">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-brand">Terms & Conditions</Link>
          <Link href="/refund-policy" className="hover:text-brand">Refund Policy</Link>
        </div>
      </div>
    </div>
  )
}
