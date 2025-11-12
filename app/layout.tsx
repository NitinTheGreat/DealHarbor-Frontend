import type React from "react"
// app/layout.tsx
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/ClientAuth"
import { Toaster } from "sonner"
import AppHeader from "@/components/AppHeader"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DealHarbor - University Marketplace",
  description: "Buy and sell items within your university community safely and securely.",
  keywords: ["university", "marketplace", "students", "buy", "sell", "dealharbor"],
  authors: [{ name: "DealHarbor Team" }],
  robots: "index, follow",
  manifest: "/manifest.json",
  themeColor: "#D97E96",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DealHarbor",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  openGraph: {
    title: "DealHarbor - University Marketplace",
    description: "Buy and sell items within your university community safely and securely.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DealHarbor - University Marketplace",
    description: "Buy and sell items within your university community safely and securely.",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppHeader />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--color-white)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                fontFamily: "var(--font-body)",
              },
              className: "sonner-toast",
            }}
            theme="light"
            richColors
          />
        </AuthProvider>
      </body>
    </html>
  )
}
