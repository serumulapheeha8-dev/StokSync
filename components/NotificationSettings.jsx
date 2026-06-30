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

export default function NotificationSettings() {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [permission, setPermission] = useState('default')
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setSupported(false)
      return
    }
    setPermission(Notification.permission)
  }, [])

  async function enableNotifications() {
    setStatus('working')
    setMessage('')
    try {
      if (Notification.permission === 'denied') {
        setStatus('error')
        setMessage('Notifications are blocked for this site. Open your browser site settings and set Notifications to "Allow", then tap this button again.')
        return
      }

      setMessage('Requesting permission...')
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') {
        setStatus('error')
        setMessage('Permission was not granted.')
        return
      }

      setMessage('Registering service worker...')
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      setMessage('Creating subscription...')
      let sub = await reg.pushManager.getSubscription()
      if (sub) {
        // Unsubscribe any old/stale one and create fresh, to guarantee it's valid right now
        await sub.unsubscribe()
      }
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      setMessage('Saving to your account...')
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub }),
      })
      const data = await res.json()

      if (data.success) {
        setStatus('success')
        setMessage('Notifications are now enabled on this device!')
      } else {
        setStatus('error')
        setMessage('Failed to save: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      setStatus('error')
      setMessage('Error: ' + err.message)
    }
  }

  if (!supported) {
    return (
      <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-500">
        Push notifications aren't supported in this browser/device.
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-semibold text-sm text-gray-900">Push Notifications</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Status on this device: {permission === 'granted' ? 'Allowed' : permission === 'denied' ? 'Blocked' : 'Not set'}
          </p>
        </div>
        <button
          onClick={enableNotifications}
          disabled={status === 'working'}
          className="px-4 py-2 text-xs bg-brand text-white rounded-xl font-medium disabled:opacity-60 flex-shrink-0"
        >
          {status === 'working' ? 'Working...' : 'Enable / Resync'}
        </button>
      </div>
      {message && (
        <p className={`text-xs mt-2 ${status === 'error' ? 'text-red-500' : status === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}