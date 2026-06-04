'use client'

import { usePushNotifications } from '@/hooks/usePushNotifications'

export default function NotificationBell() {
  const { permission, isSupported, isSubscribed, subscribe } = usePushNotifications()

  if (!isSupported) return null
  if (isSubscribed) return null
  if (permission === 'denied') return null

  return (
    <button
      onClick={subscribe}
      className="flex items-center gap-2 bg-navy-light text-navy text-xs font-medium px-3 py-1.5 rounded-full border border-navy/20 hover:bg-navy hover:text-white transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1a1 1 0 011 1v.3A4 4 0 0111 6v2l1 2H2L3 8V6a4 4 0 013-3.7V2a1 1 0 011-1zM5.5 11h3a1.5 1.5 0 01-3 0z" fill="currentColor"/>
      </svg>
      Enable notifications
    </button>
  )
}
