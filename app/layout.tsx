import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clouds MVP',
  description: 'Clouds MVP',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body>{children}</body>
    </html>
  )
}