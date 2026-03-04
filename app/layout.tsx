import type React from "react"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body style={{ fontFamily: "Calibri, system-ui, sans-serif", margin: 0, background: "#fff", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <main style={{ flex: 1 }}>{children}</main>
        <footer style={{ borderTop: "1px solid #d1d5db", padding: "16px 32px", fontSize: "12px", color: "#555" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px 16px", maxWidth: "900px" }}>
            <span>Dongemond Klimaattechniek B.V</span>
            <span>Telefoon: 0162-750861</span>
            <span>KvK: 71245340</span>
            <span>Benedenkerkstraat 57, 5165 CA Waspik</span>
            <span>Email: info@dongemondklimaattechniek.nl</span>
            <span>BtwNr: NL858635471B01</span>
            <span></span>
            <span>Website: www.dongemondklimaattechniek.nl</span>
            <span>IBAN: NL07RABO0329224719</span>
          </div>
        </footer>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
