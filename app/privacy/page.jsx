import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — StokSync',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-brand hover:underline mb-6 inline-block">← Back to StokSync</Link>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: June 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Introduction</h2>
            <p>StokSync is owned and operated by Echelon Crest (PTY) LTD ("we", "us", "our"), a company registered in South Africa. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use the StokSync application ("the App").</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Information We Collect</h2>
            <p>We collect the following information when you use StokSync:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Full name and email address (used for account creation and login)</li>
              <li>WhatsApp/phone number (used for sending notifications)</li>
              <li>Stokvel group information you create or are added to (group name, contribution amounts, member lists)</li>
              <li>Contribution and payout records you log within the App</li>
              <li>Payment information processed by our third-party payment providers (Yoco, PayFast) — we do not store your card details</li>
              <li>Device and usage information (for push notifications and app performance)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To create and manage your StokSync account</li>
              <li>To enable stokvel group management features (contributions, payouts, member tracking)</li>
              <li>To send you WhatsApp and push notifications related to your stokvel activity</li>
              <li>To process payments through our payment partners</li>
              <li>To improve and maintain the App</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Data Sharing</h2>
            <p>We do not sell your personal information. We may share limited information with:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Payment processors (Yoco, PayFast) to facilitate contribution payments</li>
              <li>Meta/WhatsApp Business Platform to deliver notification messages</li>
              <li>Supabase (our database and hosting provider) for secure data storage</li>
              <li>Law enforcement or regulators where legally required</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Data Security</h2>
            <p>We use industry-standard security measures, including encrypted data storage and secure authentication, to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Your Rights</h2>
            <p>Under the Protection of Personal Information Act (POPIA), you have the right to access, correct, or request deletion of your personal information. To exercise these rights, contact us at the email below.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Data Retention</h2>
            <p>We retain your information for as long as your account is active or as needed to provide our services. You may request account deletion at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or how your data is handled, contact us at:</p>
            <p className="mt-2 font-medium text-gray-900">echeloncrest584@gmail.com</p>
          </section>
        </div>
      </div>
    </div>
  )
}
