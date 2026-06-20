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

    // Mark contribution as Paid
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

    // Send WhatsApp to member confirming their payment
    if (memberPhone) {
      await sendWhatsApp(memberPhone, 'payment_confirmed', [
        memberName, String(amount), groupName, month
      ])
    }

    // Get admin's phone and notify them
    if (contribution?.groups?.admin_id) {
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('phone, full_name')
        .eq('id', contribution.groups.admin_id)
        .single()

      if (adminProfile?.phone) {
        await sendWhatsApp(adminProfile.phone, 'payment_confirmed', [
          adminProfile.full_name || 'Admin', String(amount), groupName, month
        ])
      }

      // Also try push notification
      const { data: adminSub } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', contribution.groups.admin_id)
        .single()

      if (adminSub) {
        try {
          const webpush = await import('web-push')
          webpush.default.setVapidDetails(
            'mailto:info@echeloncrest.co.za',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
          )
          const subscription = JSON.parse(adminSub.subscription)
          await webpush.default.sendNotification(subscription, JSON.stringify({
            title: '💰 Payment Received!',
            body: `${memberName} paid R${amount} for ${groupName}`,
            url: '/dashboard',
          }))
          console.log('Push notification sent to admin')
        } catch (pushError) {
          console.error('Push error:', pushError.message)
        }
      }
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Error: ' + error.message, { status: 500 })
  }
}
