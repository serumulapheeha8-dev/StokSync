// WhatsApp webhook - handles Meta verification (GET) and incoming messages (POST)

const VERIFY_TOKEN = 'stoksync_webhook_2026'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified successfully')
    return new Response(challenge, { status: 200 })
  }

  console.error('WhatsApp webhook verification failed')
  return new Response('Forbidden', { status: 403 })
}

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('WhatsApp webhook received:', JSON.stringify(body))

    // Handle incoming messages if needed in the future
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value

    if (value?.messages?.[0]) {
      const message = value.messages[0]
      const from = message.from
      const text = message.text?.body
      console.log(`Incoming WhatsApp message from ${from}: ${text}`)
    }

    // Always return 200 quickly so Meta doesn't retry
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('WhatsApp webhook error:', error.message)
    return new Response('Error', { status: 500 })
  }
}