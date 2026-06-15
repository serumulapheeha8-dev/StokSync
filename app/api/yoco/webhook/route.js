import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('Yoco webhook received:', JSON.stringify(body))

    if (body.type !== 'payment.succeeded') {
      return new Response('OK - not a success event', { status: 200 })
    }

    const contributionId = body.payload?.metadata?.contributionId
    if (!contributionId) return new Response('No contribution ID', { status: 200 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Mark contribution as Paid
    const { data: contribution, error: updateError } = await supabase
      .from('contributions')
      .update({ status: 'Paid', paid_at: new Date().toISOString() })
      .eq('id', contributionId)
      .select('*, groups(name, admin_id), group_members(name)')
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return new Response('Update failed', { status: 500 })
    }

    // Get admin's push subscription and send notification
    if (contribution?.groups?.admin_id) {
      console.log('Looking for admin subscription, admin_id:', contribution.groups.admin_id)
      const { data: adminSub, error: subError } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', contribution.groups.admin_id)
        .single()

      console.log('Admin subscription found:', !!adminSub, 'Error:', subError?.message)

      if (adminSub) {
        try {
          const webpush = await import('web-push')
          webpush.default.setVapidDetails(
            'mailto:info@echeloncrest.co.za',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
          )

          const subscription = JSON.parse(adminSub.subscription)
          const payload = JSON.stringify({
            title: '💰 Payment Received!',
            body: `${contribution.group_members?.name} paid R${contribution.amount} for ${contribution.groups?.name}`,
            url: '/dashboard',
          })

          console.log('Sending push notification...')
          await webpush.default.sendNotification(subscription, payload)
          console.log('Push notification sent successfully')
        } catch (pushError) {
          console.error('Push notification error:', pushError.message, pushError.stack)
        }
      } else {
        console.log('No admin subscription found - admin has not enabled notifications')
      }
    } else {
      console.log('No admin_id found on contribution.groups')
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Yoco webhook error:', error)
    return new Response('Error: ' + error.message, { status: 500 })
  }
}
