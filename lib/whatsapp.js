export async function sendPaymentConfirmedWhatsApp({ phone, name, amount, groupName, month }) {
  if (!phone) return { success: false, error: 'No phone number' }
  try {
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phone,
        templateName: 'payment_confirmed',
        params: [name, String(amount), groupName, month],
      }),
    })
    return await res.json()
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function sendContributionReminderWhatsApp({ phone, name, amount, groupName, dueDate }) {
  if (!phone) return { success: false, error: 'No phone number' }
  try {
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phone,
        templateName: 'contribution_reminder',
        params: [name, String(amount), groupName, dueDate],
      }),
    })
    return await res.json()
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function sendPayoutScheduledWhatsApp({ phone, name, amount, groupName, payoutDate }) {
  if (!phone) return { success: false, error: 'No phone number' }
  try {
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phone,
        templateName: 'payout_scheduled',
        params: [name, String(amount), groupName, payoutDate],
      }),
    })
    return await res.json()
  } catch (error) {
    return { success: false, error: error.message }
  }
}
