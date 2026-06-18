export async function POST(request) {
  try {
    const { to, templateName, params } = await request.json()

    // Format phone number: remove spaces, leading 0, add country code if needed
    let formattedPhone = to.replace(/\s+/g, '').replace(/^0/, '27')
    if (!formattedPhone.startsWith('27') && !formattedPhone.startsWith('+')) {
      formattedPhone = '27' + formattedPhone
    }
    formattedPhone = formattedPhone.replace('+', '')

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
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName || 'hello_world',
            language: { code: 'en_US' },
            components: params ? [
              {
                type: 'body',
                parameters: params.map(p => ({ type: 'text', text: p })),
              },
            ] : [],
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('WhatsApp API error:', JSON.stringify(data))
      return Response.json({ success: false, error: data.error?.message || 'WhatsApp send failed', details: data }, { status: 400 })
    }

    return Response.json({ success: true, messageId: data.messages?.[0]?.id })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
