export async function POST(request) {
  try {
    const { amount, contributionId, memberName, groupName } = await request.json()

    const response = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: Math.round(parseFloat(amount) * 100),
        currency: 'ZAR',
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?contribution_id=${contributionId}&provider=yoco`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
        failureUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
        metadata: {
          contributionId,
          memberName,
          groupName,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return Response.json({ success: false, error: data.message || 'Yoco error' }, { status: 400 })
    }

    return Response.json({
      success: true,
      checkoutUrl: data.redirectUrl,
      checkoutId: data.id,
    })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
