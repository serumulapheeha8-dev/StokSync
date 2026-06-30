import { createClient } from '@supabase/supabase-js'

async function sendWhatsApp(to, templateName, params) {
  if (!to) return
  try {
    let phone = to.replace(/\s+/g, '').replace(/^0/, '27').replace('+', '')
    if (!phone.startsWith('27')) phone = '27' + phone

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en_US' },
            components: params ? [{
              type: 'body',
              parameters: params.map(p => ({ type: 'text', text: String(p) })),
            }] : [],
          },
        }),
      }
    )
    const data = await response.json()
    if (!response.ok) {
      console.error('WhatsApp send error:', JSON.stringify(data))
    } else {
      console.log('WhatsApp sent to:', phone, 'messageId:', data.messages?.[0]?.id)
    }
  } catch (err) {
    console.error('WhatsApp error:', err.message)
  }
}

async function sendPushToUser(supabase, userId, title, body, url) {
  try {
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('subscription, endpoint')
      .eq('user_id', userId)

    if (error) {
      console.error('Push fetch error:', error.message)
      return
    }

    if (!subs || subs.length === 0) {
      console.log('No push subscriptions found for user:', userId)
      return
    }

    const webpush = await import('web-push')
    webpush.default.setVapidDetails(
      'mailto:info@echeloncrest.co.za',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    )

    const payload = JSON.stringify({ title, body, url: url || '/' })

    for (const row of subs) {
      try {
        const subscription = JSON.parse(row.subscription)
        await webpush.default.sendNotification(subscription, payload)
        console.log('Push sent to device:', row.endpoint?.slice(-12))
      } catch (sendErr) {
        console.error('Push send failed for device:', row.endpoint?.slice(-12), sendErr.message)
        // Clean up dead subscriptions
        if (sendErr.statusCode === 410 || sendErr.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', userId)
            .eq('endpoint', row.endpoint)
        }
      }
    }
  } catch (err) {
    console.error('Push overall error:', err.message)
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('Yoco webhook received, type:', body.type)

    if (body.type !== 'payment.succeeded') {
      return new Response('OK', { status: 200 })
    }

    const contributionId = body.payload?.metadata?.contributionId
    if (!contributionId) return new Response('No contribution ID', { status: 200 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: contribution, error: updateError } = await supabase
      .from('contributions')
      .update({ status: 'Paid', paid_at: new Date().toISOString() })
      .eq('id', contributionId)
      .select('*, groups(name, admin_id), group_members(name, phone, email)')
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return new Response('Update failed', { status: 500 })
    }

    console.log('Contribution marked as Paid:', contributionId)

    const memberName = contribution?.group_members?.name || 'Member'
    const amount = contribution?.amount || '0'
    const groupName = contribution?.groups?.name || 'Stokvel'
    const month = contribution?.month || 'this month'
    const memberPhone = contribution?.group_members?.phone
    const adminId = contribution?.groups?.admin_id

    // WhatsApp to member — isolated, won't block anything else
    if (memberPhone) {
      await sendWhatsApp(memberPhone, 'payment_confirmed', [
        memberName, String(amount), groupName, month
      ])
    }

    if (adminId) {
      // WhatsApp to admin — isolated
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('phone, full_name')
        .eq('id', adminId)
        .single()

      if (adminProfile?.phone) {
        await sendWhatsApp(adminProfile.phone, 'payment_confirmed', [
          adminProfile.full_name || 'Admin', String(amount), groupName, month
        ])
      }

      // Push to ALL of admin's devices — isolated, runs regardless of WhatsApp result
      await sendPushToUser(
        supabase,
        adminId,
        '💰 Payment Received!',
        `${memberName} paid R${amount} for ${groupName}`,
        '/dashboard'
      )
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error.message)
    return new Response('Error: ' + error.message, { status: 500 })
  }
}