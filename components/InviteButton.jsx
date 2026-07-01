'use client'

import { useState } from 'react'

export default function InviteButton({ groupId, groupName, contributionAmount }) {
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [show, setShow] = useState(false)

  async function generateInvite() {
    setLoading(true)
    try {
      const res = await fetch('/api/invite/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
      })
      const data = await res.json()
      if (data.success) {
        const link = `${window.location.origin}/join/${data.code}`
        setInviteLink(link)
        setShow(true)
      }
    } catch (err) {
      console.error('Invite error:', err)
    }
    setLoading(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWhatsApp() {
    const message = `Hi! You've been invited to join *${groupName}* stokvel on StokSync.\n\nContribution: R${contributionAmount}/month\n\nClick the link to register and view your group:\n${inviteLink}\n\n_Powered by StokSync by Echelon Crest (PTY) LTD_`
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <div>
      {!show ? (
        <button
          onClick={generateInvite}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 5h2v2H7V5zm0 3h2v4H7V8z" fill="white"/>
          </svg>
          {loading ? 'Generating...' : 'Invite Members'}
        </button>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mt-3">
          <p className="text-sm font-medium text-gray-900 mb-3">Share invite link</p>

          {/* Link display */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-3">
            <p className="text-xs text-gray-600 flex-1 truncate">{inviteLink}</p>
            <button
              onClick={copyLink}
              className="text-xs text-brand font-medium flex-shrink-0"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          {/* WhatsApp share button */}
          <button
            onClick={shareWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Share via WhatsApp
          </button>

          <button
            onClick={() => setShow(false)}
            className="w-full text-center text-xs text-gray-400 mt-2 py-1"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
