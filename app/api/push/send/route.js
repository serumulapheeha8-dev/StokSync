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

    const nameParts = (memberName || 'Member').split(' ')
    const firstName = nameParts[0] || 'Member'
    const lastName = nameParts.slice(1).join(' ') || ''

    // Build payment data in EXACT order PayFast expects
    const paymentData = {
      merchant_id: String(merchantId),
      merchant_key: String(merchantKey),
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      name_first: firstName,
      name_last: lastName,
      email_address: memberEmail || 'test@test.com',
      m_payment_id: String(contributionId),
      amount: parseFloat(amount).toFixed(2),
      item_name: `StokSync - ${groupName}`,
    }

    // Generate signature
    function generateSignature(data, passPhrase = null) {
      let pfOutput = ''
      for (const key in data) {
        if (data[key] !== '') {
          pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, '+')}&`
        }
      }
      // Remove last &
      let getString = pfOutput.slice(0, -1)
      if (passPhrase !== null) {
        getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+')}`
      }
      return crypto.createHash('md5').update(getString).digest('hex')
    }

    const signature = generateSignature(paymentData, passphrase)

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