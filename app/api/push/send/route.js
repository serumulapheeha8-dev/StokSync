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

    // Get ALL subscriptions for this user (one per device)
    const { data: subs, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('subscription, endpoint')
      .eq('user_id', userId)

    if (fetchError) throw fetchError

    if (!subs || subs.length === 0) {
      return Response.json({ success: false, error: 'No subscriptions found for this user' })
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      url: url || '/',
    })

    const results = await Promise.allSettled(
      subs.map(async (row) => {
        const subscription = JSON.parse(row.subscription)
        try {
          await webpush.default.sendNotification(subscription, payload)
          return { endpoint: row.endpoint, success: true }
        } catch (err) {
          // If the subscription is expired/invalid (410/404), clean it up
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('user_id', userId)
              .eq('endpoint', row.endpoint)
          }
          throw err
        }
      })
    )

    const succeeded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return Response.json({
      success: succeeded > 0,
      sentTo: succeeded,
      failedCount: failed,
      totalDevices: subs.length,
    })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}