import crypto from 'crypto'

export async function POST(request) {
  try {
    const body = await request.json()
    const { amount, contributionId, memberName, memberEmail, groupName } = body

    const merchantId = process.env.PAYFAST_MERCHANT_ID
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY
    const passphrase = process.env.PAYFAST_PASSPHRASE
    const isSandbox = process.env.PAYFAST_SANDBOX === 'true'

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?contribution_id=${contributionId}`
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`
    const notifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payfast/notify`

    // Build payment data object
    const paymentData = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      name_first: memberName.split(' ')[0] || memberName,
      name_last: memberName.split(' ')[1] || '',
      email_address: memberEmail,
      m_payment_id: contributionId,
      amount: parseFloat(amount).toFixed(2),
      item_name: `StokSync Contribution - ${groupName}`,
      item_description: `Monthly contribution for ${groupName} stokvel`,
    }

    // Generate signature
    const signatureString = Object.entries(paymentData)
      .map(([key, val]) => `${key}=${encodeURIComponent(String(val).trim())}`)
      .join('&') + (passphrase ? `&passphrase=${encodeURIComponent(passphrase)}` : '')

    const signature = crypto.createHash('md5').update(signatureString).digest('hex')

    const payfastUrl = isSandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process'

    return Response.json({
      success: true,
      payfastUrl,
      paymentData: { ...paymentData, signature },
    })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
