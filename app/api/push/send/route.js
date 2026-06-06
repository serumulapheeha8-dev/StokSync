import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { userId, title, body, url } = await request.json()

    const webpush = await import('web-push')
    
    webpush.default.setVapidDetails(
      'mailto:info@echeloncrest.co.za',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    )

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: sub } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId)
      .single()

    if (!sub) return Response.json({ success: false, error: 'No subscription found' })

    const subscription = JSON.parse(sub.subscription)
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      url: url || '/',
    })

    await webpush.default.sendNotification(subscription, payload)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}