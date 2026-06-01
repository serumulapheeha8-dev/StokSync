'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M9.15 2.48a2.6 2.6 0 013.7 0l6.6 6.6A2.6 2.6 0 0120.2 11v7.4A2.6 2.6 0 0117.6 21H14a1 1 0 01-1-1v-4h-4v4a1 1 0 01-1 1H4.4A2.6 2.6 0 011.8 18.4V11a2.6 2.6 0 01.75-1.82l6.6-6.7z"
          fill={active ? '#1D9E75' : 'none'}
          stroke={active ? '#1D9E75' : '#6b7280'}
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    href: '/groups',
    label: 'Groups',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="8" cy="7" r="3" stroke={active ? '#1D9E75' : '#6b7280'} strokeWidth="1.5" fill={active ? '#E1F5EE' : 'none'}/>
        <circle cx="15" cy="7" r="3" stroke={active ? '#1D9E75' : '#6b7280'} strokeWidth="1.5" fill={active ? '#E1F5EE' : 'none'}/>
        <path d="M1 18c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={active ? '#1D9E75' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M17 12c2.2.6 4 2.6 4 5" stroke={active ? '#1D9E75' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/contributions',
    label: 'Payments',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="1.5" y="4.5" width="19" height="13" rx="2.5"
          fill={active ? '#E1F5EE' : 'none'}
          stroke={active ? '#1D9E75' : '#6b7280'} strokeWidth="1.5"
        />
        <path d="M1.5 9h19" stroke={active ? '#1D9E75' : '#6b7280'} strokeWidth="1.5"/>
        <rect x="4" y="13" width="4" height="1.5" rx=".75" fill={active ? '#1D9E75' : '#6b7280'}/>
      </svg>
    ),
  },
  {
    href: '/payouts',
    label: 'Payouts',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2v18M5 7l6-5 6 5" stroke={active ? '#1D9E75' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 20h16" stroke={active ? '#1D9E75' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-2 pb-safe-bottom">
        {tabs.map(tab => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors ${
                active ? 'text-brand' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.icon(active)}
              <span className={`text-xs font-medium ${active ? 'text-brand' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
