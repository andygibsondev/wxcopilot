import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aerodrome Weather',
  description: 'Aviation weather information for UK aerodromes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

