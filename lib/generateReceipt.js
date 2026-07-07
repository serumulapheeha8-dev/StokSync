'use client'

// Generates and downloads a PDF receipt for a paid contribution
export async function generateReceipt(contribution, member, group) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ format: 'a5', orientation: 'portrait' })

  const pageW = doc.internal.pageSize.width
  const pageH = doc.internal.pageSize.height

  // Receipt number from contribution ID
  const receiptNum = 'SS-' + new Date().getFullYear() + '-' + contribution.id.replace('-', '').substring(0, 6).toUpperCase()
  const paymentDate = contribution.paid_at
    ? new Date(contribution.paid_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })

  const paymentMethod = contribution.payment_method || 'Manual confirmation'

  // ---- HEADER ----
  doc.setFillColor(27, 58, 87)
  doc.rect(0, 0, pageW, 38, 'F')

  // Logo
  doc.addImage('data:image/png;base64,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', 'PNG', 8, 6, 20, 20)

  // Company name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('StokSync', 33, 16)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('by Echelon Crest (PTY) LTD · Reg. 2026/420468/07', 33, 22)
  doc.text('www.stoksync.co.za', 33, 28)

  // RECEIPT label on right
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(29, 158, 117)
  doc.text('RECEIPT', pageW - 10, 20, { align: 'right' })

  // ---- RECEIPT META ----
  let y = 46

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Receipt Number', 10, y)
  doc.text('Date', pageW/2, y)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(27, 58, 87)
  doc.text(receiptNum, 10, y + 6)
  doc.text(paymentDate, pageW/2, y + 6)
  y += 16

  // Divider
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(10, y, pageW - 10, y)
  y += 8

  // ---- PAID TO / FROM ----
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Member', 10, y)
  doc.text('Group', pageW/2, y)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  const memberName = member?.name || 'Member'
  const groupName = group?.name || 'Stokvel'
  doc.text(memberName, 10, y + 6)
  doc.text(groupName, pageW/2, y + 6)

  if (member?.email) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(member.email, 10, y + 12)
  }
  y += 22

  // Divider
  doc.line(10, y, pageW - 10, y)
  y += 8

  // ---- PAYMENT DETAILS ----
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Description', 10, y)
  y += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 30, 30)
  doc.text('Stokvel contribution - ' + (contribution.month || ''), 10, y)
  y += 10

  // Details table
  const details = [
    ['Payment Method', paymentMethod],
    ['Status', 'Paid'],
    ['Month', contribution.month || '—'],
  ]

  details.forEach(([label, value]) => {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(label, 10, y)
    doc.setTextColor(30, 30, 30)
    doc.text(value, pageW/2, y)
    y += 7
  })

  y += 4
  // Divider
  doc.line(10, y, pageW - 10, y)
  y += 8

  // ---- AMOUNT BOX ----
  doc.setFillColor(240, 253, 244)
  doc.roundedRect(10, y, pageW - 20, 22, 3, 3, 'F')
  doc.setDrawColor(29, 158, 117)
  doc.setLineWidth(0.5)
  doc.roundedRect(10, y, pageW - 20, 22, 3, 3, 'S')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Amount Paid', 16, y + 9)

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(27, 58, 87)
  doc.text(, pageW - 14, y + 14, { align: 'right' })

  y += 30

  // ---- STATUS STAMP ----
  doc.setFillColor(29, 158, 117)
  doc.roundedRect(pageW/2 - 20, y, 40, 12, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('✓ PAID', pageW/2, y + 8, { align: 'center' })
  y += 20

  // ---- FOOTER ----
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(10, pageH - 18, pageW - 10, pageH - 18)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(150, 150, 150)
  doc.text('This receipt is electronically generated by StokSync and is valid without a signature.', pageW/2, pageH - 12, { align: 'center' })
  doc.text('Echelon Crest (PTY) LTD · Reg. 2026/420468/07 · www.stoksync.co.za', pageW/2, pageH - 7, { align: 'center' })

  // Save
  const filename = 
  doc.save(filename)
}