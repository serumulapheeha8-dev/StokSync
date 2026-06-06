import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const body = await request.text()
    const params = new URLSearchParams(body)
    const data = Object.fromEntries(params)

    // Verify payment status
    if (data.payment_status !== 'COMPLETE') {
      return new Response('Payment not complete', { status: 200 })
    }

    const contributionId = data.m_payment_id

    // Update contribution status in Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { error } = await supabase
      .from('contributions')
      .update({
        status: 'Paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', contributionId)

    if (error) {
      console.error('Supabase update error:', error)
      return new Response('Error updating contribution', { status: 500 })
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('ITN error:', error)
    return new Response('Error', { status: 500 })
  }
}
