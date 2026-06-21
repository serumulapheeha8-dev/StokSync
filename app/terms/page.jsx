import Link from 'next/link'

export const metadata = {
  title: 'Terms & Conditions — StokSync',
}

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-brand hover:underline mb-6 inline-block">← Back to StokSync</Link>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Terms & Conditions</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: June 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using StokSync ("the App"), operated by Echelon Crest (PTY) LTD, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the App.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Description of Service</h2>
            <p>StokSync is a software tool that helps stokvel groups organize and track member contributions, payout schedules, and group membership. StokSync is a record-keeping and communication tool — it does not manage, guarantee, or take responsibility for the actual transfer of stokvel funds between members unless explicitly stated for a specific payment feature.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must provide accurate information when creating an account or group</li>
              <li>Group admins are responsible for accurately managing their stokvel's contribution and payout records</li>
              <li>You are responsible for safeguarding your login credentials</li>
              <li>You agree not to use the App for any unlawful purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Payments</h2>
            <p>Where StokSync integrates with third-party payment providers (such as Yoco or PayFast) to facilitate contribution payments, those transactions are subject to the respective payment provider's terms and conditions. Echelon Crest (PTY) LTD is not a bank or licensed financial institution and does not guarantee fund transfers between stokvel members.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Group Admin Responsibility</h2>
            <p>Stokvel group admins are independently responsible for the legitimacy, management, and financial integrity of their own stokvel groups. Echelon Crest (PTY) LTD is not a party to any agreement between stokvel members and bears no liability for disputes, mismanagement, or financial loss arising from a stokvel group's internal operations.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Limitation of Liability</h2>
            <p>StokSync is provided "as is" without warranties of any kind. To the maximum extent permitted by law, Echelon Crest (PTY) LTD shall not be liable for any indirect, incidental, or consequential damages arising from use of the App, including financial loss related to stokvel contributions or payouts.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Account Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent or harmful activity.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Changes to These Terms</h2>
            <p>We may update these Terms & Conditions from time to time. Continued use of the App after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Governing Law</h2>
            <p>These Terms are governed by the laws of the Republic of South Africa.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Contact Us</h2>
            <p>For questions about these Terms, contact us at:</p>
            <p className="mt-2 font-medium text-gray-900">echeloncrest584@gmail.com</p>
          </section>
        </div>
      </div>
    </div>
  )
}
