'use client'

export default function PaymentBadges() {
  const logos = [
    { src: '/payment-logos/visa.png', alt: 'Visa' },
    { src: '/payment-logos/mastercard.png', alt: 'Mastercard' },
    { src: '/payment-logos/payfast.svg', alt: 'PayFast' },
    { src: '/payment-logos/sid.png', alt: 'Instant EFT' },
    { src: '/payment-logos/mobicred.png', alt: 'Mobicred' },
  ]

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <p className="text-xs text-gray-400">Secure payments powered by</p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {logos.map(logo => (
          <img
            key={logo.alt}
            src={logo.src}
            alt={logo.alt}
            className="h-6 object-contain opacity-80"
          />
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
        <a href="/terms" className="underline hover:text-brand">Terms &amp; Conditions</a>
        <span>·</span>
        <a href="/privacy" className="underline hover:text-brand">Privacy Policy</a>
      </div>
    </div>
  )
}
