import Link from 'next/link'

export const metadata = {
  title: 'Refund & Dispute Policy — StokSync',
}

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/" className="text-brand text-sm font-medium mb-6 inline-block">← Back to StokSync</Link>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Refund & Dispute Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: June 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Overview</h2>
            <p>
              StokSync, operated by Echelon Crest (PTY) LTD, is a record-keeping and coordination
              tool for stokvel (group savings) groups. This policy explains how refunds and payment
              disputes are handled for contributions made through the App.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Nature of Contributions</h2>
            <p>
              Contributions made through StokSync are payments between you and your stokvel group,
              facilitated by third-party payment processors (such as Yoco or PayFast). Echelon Crest
              (PTY) LTD does not set contribution amounts, schedules, or payout rules — these are
              determined by each stokvel group and its admin.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Incorrect or Duplicate Payments</h2>
            <p>
              If you believe you made a contribution payment in error, or were charged twice for
              the same contribution, please contact us immediately at{' '}
              <a href="mailto:echeloncrest584@gmail.com" className="text-brand">echeloncrest584@gmail.com</a>{' '}
              with your payment reference and group name. We will investigate and, where confirmed,
              coordinate a refund through the original payment processor.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Disputes Between Members and Admins</h2>
            <p>
              Disputes relating to stokvel contributions, payout schedules, or group decisions are
              between the group members and their admin, in line with that group's own rules.
              Echelon Crest (PTY) LTD is not a party to your stokvel agreement and does not mediate
              internal group disputes. We encourage groups to resolve such matters directly, and
              recommend keeping a written or WhatsApp record of agreements within the group.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Refund Eligibility</h2>
            <p>Refunds may be considered in the following cases:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>A technical error resulted in an incorrect amount being charged</li>
              <li>A duplicate payment was processed due to a system error</li>
              <li>A payment was made to the wrong group due to a confirmed app malfunction</li>
            </ul>
            <p className="mt-2">
              Refunds are <strong>not</strong> provided simply because a member changes their mind
              about a contribution already paid into a group, as this affects the group's pooled funds.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. How to Request a Refund</h2>
            <p>To request a refund or report a payment issue:</p>
            <ol className="list-decimal pl-5 space-y-1 mt-2">
              <li>Email <a href="mailto:echeloncrest584@gmail.com" className="text-brand">echeloncrest584@gmail.com</a></li>
              <li>Include your full name, group name, payment date and amount</li>
              <li>Attach a screenshot of the payment confirmation if available</li>
            </ol>
            <p className="mt-2">
              We aim to respond to all refund requests within 5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Payment Processor Timelines</h2>
            <p>
              Approved refunds are processed back to your original payment method via our payment
              processor (Yoco or PayFast). Refund processing times depend on the processor and your
              bank, and typically take 5–10 business days to reflect.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Contact Us</h2>
            <p>
              For any refund or dispute queries, contact:<br/>
              <strong>Echelon Crest (PTY) LTD</strong><br/>
              Email: <a href="mailto:echeloncrest584@gmail.com" className="text-brand">echeloncrest584@gmail.com</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
