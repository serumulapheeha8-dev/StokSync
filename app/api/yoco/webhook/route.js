import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const body = await request.json()

    // Verify it's a successful payment
    if (body.type !== 'payment.succeeded') {
      return new Response('OK', { status: 200 })
    }

    const contributionId = body.payload?.metadata?.contributionId
    if (!contributionId) return new Response('No contribution ID', { status: 200 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    await supabase
      .from('contributions')
      .update({ status: 'Paid', paid_at: new Date().toISOString() })
      .eq('id', contributionId)

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Yoco webhook error:', error)
    return new Response('Error', { status: 500 })
  }
}
