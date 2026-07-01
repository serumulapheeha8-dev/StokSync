import './globals.css'

export const metadata = {
  title: 'StokSync',
  description: 'Manage your stokvel groups easily',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#1D9E75" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="StokSync" />
        <meta name="facebook-domain-verification" content="jii73vb3mngzpmfcneo5kdsqgdke5a" />
      </head>
      <body>{children}</body>
    </html>
  )
}
