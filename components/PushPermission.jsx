'use client'

import { useState, useEffect } from 'react'

export default function PushPermission() {
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission === 'granted') return
    if (Notification.permission === 'denied') return
    const dismissed = localStorage.getItem('pushDismissed')
    if (dismissed) return
    const timer = setTimeout(() => setShow(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  async function requestPermission() {
    setStatus('asking')
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setStatus('granted')
      setShow(false)
    } else {
      setStatus('denied')
      setShow(false)
    }
  }

  function handleDismiss() {
    setShow(false)
    localStorage.setItem('pushDismissed', 'true')
  }

  if (!show) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-gray-900 rounded-2xl shadow-lg p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5A1 1 0 003.5 15h13a1 1 0 00.866-1.5L16 11V8a6 6 0 00-6-6zM8.5 17a1.5 1.5 0 003 0h-3z" fill="white"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Enable Notifications</p>
            <p className="text-white/70 text-xs mt-0.5">Get alerts for contributions and payouts</p>
          </div>
          <button onClick={handleDismiss} className="text-white/50 hover:text-white">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={handleDismiss} className="flex-1 py-2 text-xs text-white/70 border border-white/20 rounded-xl">Not now</button>
          <button onClick={requestPermission} disabled={status === 'asking'} className="flex-1 py-2 text-xs bg-brand text-white rounded-xl font-medium disabled:opacity-60">
            {status === 'asking' ? 'Enabling...' : 'Enable'}
          </button>
        </div>
      </div>
    </div>
  )
}
