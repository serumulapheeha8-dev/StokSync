'use client'
import { useState, useEffect } from 'react'

const VAPID_PUBLIC_KEY = 'BIIx_O4dek5VAVMcXXpszrSQ0NkcibGVhX6oERX9exF1KUHMlodLIyIAJKWJjZtMy5FomKx5rNOR13wQInwJ1XE'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushPermission() {
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission === 'denied') return
    const dismissed = localStorage.getItem('pushDismissed')
    if (dismissed) return

    // If already granted, verify we actually have a saved subscription — if not, still show the prompt
    if (Notification.permission === 'granted') {
      checkExistingSubscription()
    } else {
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  async function checkExistingSubscription() {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (!sub) {
        // Permission granted but never actually subscribed — show prompt to fix it
        setTimeout(() => setShow(true), 3000)
      }
    } catch {
      setTimeout(() => setShow(true), 3000)
    }
  }

  async function requestPermission() {
    setStatus('asking')
    setMessage('')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        setMessage('Permission was not granted.')
        return
      }

      setMessage('Registering...')
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      setMessage('Subscribing...')
      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })
      }

      setMessage('Saving...')
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub }),
      })
      const data = await res.json()

      if (data.success) {
        setStatus('granted')
        setMessage('Notifications enabled successfully!')
        setTimeout(() => setShow(false), 2000)
      } else {
        setStatus('error')
        setMessage('Failed to save: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      setStatus('error')
      setMessage('Error: ' + err.message)
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
            {message && (
              <p className={`text-xs mt-1 ${status === 'error' || status === 'denied' ? 'text-red-300' : 'text-green-300'}`}>
                {message}
              </p>
            )}
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