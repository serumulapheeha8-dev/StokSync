import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="StokSync" width="36" height="36" style={{objectFit:'contain'}} />
            <span className="font-bold text-lg text-gray-900">StokSync</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 hidden sm:block">Sign in</Link>
            <Link href="/dashboard" className="text-sm bg-brand text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-dark transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-gray-900 via-navy to-gray-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm mb-8">
            <span className="w-2 h-2 bg-brand rounded-full animate-pulse"></span>
            Built for South Africa 🇿🇦
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-none">
            Your stokvel,<br/>
            <span className="text-brand">finally digital.</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            StokSync makes it easy to manage your stokvel group — track contributions, schedule payouts, and invite members via WhatsApp. No spreadsheets. No confusion.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-brand hover:bg-brand-dark text-white font-bold text-lg rounded-2xl transition-colors text-center">
              Start for free →
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium text-lg rounded-2xl transition-colors text-center border border-white/20">
              See how it works
            </a>
          </div>
          <p className="text-gray-500 text-sm mt-6">No credit card required · Free to get started</p>
        </div>

        {/* Stats bar */}
        <div className="max-w-3xl mx-auto mt-20 grid grid-cols-3 gap-4 relative z-10">
          {[
            { number: '100%', label: 'Free to start' },
            { number: 'R0', label: 'Setup cost' },
            { number: '5min', label: 'To get started' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-6 text-center backdrop-blur-sm">
              <p className="text-3xl sm:text-4xl font-black text-brand">{stat.number}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand font-semibold text-sm uppercase tracking-widest mb-3">Simple by design</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900">How StokSync works</h2>
            <p className="text-gray-500 text-lg mt-4 max-w-xl mx-auto">Get your stokvel group running digitally in three simple steps.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create your group',
                desc: 'Set up your stokvel with contribution amounts, cycle frequency, and payout order. Takes less than 2 minutes.',
                icon: '🏗️',
                color: 'bg-blue-50 border-blue-100',
              },
              {
                step: '02',
                title: 'Invite via WhatsApp',
                desc: 'Share a link directly to your members\' WhatsApp. They click, sign up, and are automatically added to your group.',
                icon: '📲',
                color: 'bg-green-50 border-green-100',
              },
              {
                step: '03',
                title: 'Track everything',
                desc: 'Members pay contributions, you confirm or they pay online. Payouts are scheduled automatically. Everyone stays informed.',
                icon: '📊',
                color: 'bg-purple-50 border-purple-100',
              },
            ].map((item) => (
              <div key={item.step} className={`${item.color} border rounded-3xl p-8 relative overflow-hidden`}>
                <span className="absolute top-4 right-4 text-6xl font-black text-black/5">{item.step}</span>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand font-semibold text-sm uppercase tracking-widest mb-3">Everything you need</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Built for real stokvels</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '💬', title: 'WhatsApp invites', desc: 'Invite members with a single tap. They join directly from WhatsApp.' },
              { icon: '💰', title: 'Contribution tracking', desc: 'Log and confirm contributions. Know exactly who has paid and who hasn\'t.' },
              { icon: '📅', title: 'Payout scheduling', desc: 'Plan your payout rotation in advance. No more confusion about whose turn it is.' },
              { icon: '🔔', title: 'Push notifications', desc: 'Instant alerts when members pay. Stay on top of your group without chasing anyone.' },
              { icon: '📱', title: 'Works on any phone', desc: 'Install on Android or iPhone. Works like a native app, no App Store needed.' },
              { icon: '🔒', title: 'Secure & private', desc: 'Your data stays private. Built with bank-level security and POPIA compliance.' },
            ].map((f) => (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-6 hover:bg-brand-light transition-colors group">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-brand-dark transition-colors">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand font-semibold text-sm uppercase tracking-widest mb-3">Real people, real stokvels</p>
            <h2 className="text-4xl sm:text-5xl font-black">What our members say</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                quote: "Before StokSync I used to chase members on WhatsApp every month. Now everything is tracked automatically. Game changer.",
                name: "Nomsa M.",
                role: "Stokvel Admin · Soweto",
                initial: "N",
              },
              {
                quote: "I can see exactly when my payout is coming and how much everyone has contributed. So much better than our old Excel sheet.",
                name: "Thabo K.",
                role: "Stokvel Member · Pretoria",
                initial: "T",
              },
              {
                quote: "Setting up took less than 5 minutes. I sent the WhatsApp link to my group and everyone was onboard the same day.",
                name: "Lerato D.",
                role: "Stokvel Admin · Johannesburg",
                initial: "L",
              },
            ].map((t) => (
              <div key={t.name} className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-brand text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center font-bold text-white">
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-brand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
            Ready to modernise your stokvel?
          </h2>
          <p className="text-white/80 text-xl mb-10">
            Join thousands of South Africans managing their stokvels digitally. Free to start, no credit card required.
          </p>
          <Link href="/dashboard" className="inline-block px-10 py-5 bg-white text-brand font-black text-xl rounded-2xl hover:bg-gray-100 transition-colors">
            Get started free →
          </Link>
          <p className="text-white/60 text-sm mt-4">
            By Echelon Crest (PTY) LTD · stoksync.co.za
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 bg-gray-900 text-gray-500 text-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="StokSync" width="24" height="24" style={{objectFit:'contain'}} />
            <span className="text-white font-semibold">StokSync</span>
            <span>by Echelon Crest (PTY) LTD</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/refund-policy" className="hover:text-white transition-colors">Refunds</Link>
          </div>
          <p>© 2026 All rights reserved</p>
        </div>
      </footer>

    </div>
  )
}