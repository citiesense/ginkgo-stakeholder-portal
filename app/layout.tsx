import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stakeholder Portal',
  description: 'Business Improvement District Stakeholder Management Portal',
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
