import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:' + process.env.VAPID_EMAIL,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export async function POST(request) {
  try {
    const { userId, title, body, url } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Get user's push subscription
    const { data: subData } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId)
      .single()

    if (!subData) {
      return Response.json({ success: false, error: 'No subscription found' })
    }

    const subscription = JSON.parse(subData.subscription)
    const payload = JSON.stringify({
      title,
      body,
      url: url || '/dashboard',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
    })

    await webpush.sendNotification(subscription, payload)

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
