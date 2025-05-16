import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Minimal Discord Bot",
  description: "A minimal Discord bot implementation",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>{children}</body>
    </html>
  )
}


import './globals.css'