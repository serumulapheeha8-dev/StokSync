'use client'

import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if iOS
    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
    setIsIOS(ios)

    // Listen for Android install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    })

    // Show iOS prompt after 3 seconds if not installed
    if (ios) {
      const timer = setTimeout(() => {
        const dismissed = localStorage.getItem('installDismissed')
        if (!dismissed) setShowPrompt(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
    }
  }

  function handleDismiss() {
    setShowPrompt(false)
    localStorage.setItem('installDismissed', 'true')
  }

  if (!showPrompt || isInstalled) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z" fill="white"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">Install StokSync</p>
            <p className="text-xs text-gray-500 mt-0.5">by Echelon Crest (PTY) LTD</p>
            {isIOS ? (
              <p className="text-xs text-gray-400 mt-1">
                Tap <strong>Share</strong> then <strong>"Add to Home Screen"</strong>
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                Install for quick access on your phone
              </p>
            )}
          </div>
          <button onClick={handleDismiss} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M14 4L4 14M4 4l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {!isIOS && (
          <button
            onClick={handleInstall}
            className="w-full mt-3 py-2.5 bg-brand text-white text-sm font-medium rounded-xl hover:bg-brand-dark transition-colors"
          >
            Install app
          </button>
        )}
      </div>
    </div>
  )
}
