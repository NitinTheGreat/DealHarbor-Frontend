import type React from "react"
// app/layout.tsx
import type { Metadata } from "next"
import { ToastProvider } from "@/components/ui/toast-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "DealHarbor",
  description: "Buy and sell with fellow VIT students in a secure, trusted marketplace",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
