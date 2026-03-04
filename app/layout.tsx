import type React from "react"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body style={{ fontFamily: "Calibri, system-ui, sans-serif", margin: 0, background: "#fff" }}>{children}</body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
