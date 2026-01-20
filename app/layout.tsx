import type React from "react"
// app/layout.tsx
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/ClientAuth"
import { Toaster } from "sonner"
import AppHeader from "@/components/AppHeader"
import { Analytics } from "@vercel/analytics/next"
import { StructuredData } from "@/components/StructuredData"
const inter = Inter({ subsets: ["latin"] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deal-harbor-frontend.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DealHarbor - University Student Marketplace | Buy & Sell Safely",
    template: "%s | DealHarbor",
  },
  description: "DealHarbor is the #1 trusted marketplace for university students. Buy and sell textbooks, electronics, furniture, and more within your campus community. Verified students only.",
  keywords: [
    "university marketplace",
    "student marketplace",
    "college buy sell",
    "campus marketplace",
    "student deals",
    "textbooks for sale",
    "used electronics",
    "student furniture",
    "dealharbor",
    "deal harbor",
    "university buy sell",
    "college students marketplace",
    "verified student marketplace",
  ],
  authors: [{ name: "DealHarbor Team" }],
  creator: "DealHarbor",
  publisher: "DealHarbor",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "DealHarbor",
    title: "DealHarbor - University Student Marketplace",
    description: "The #1 trusted marketplace for university students. Buy and sell textbooks, electronics, furniture, and more within your campus community.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DealHarbor - University Student Marketplace",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DealHarbor - University Student Marketplace",
    description: "The #1 trusted marketplace for university students. Buy and sell textbooks, electronics, furniture, and more.",
    images: ["/og-image.png"],
    creator: "@dealharbor",
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "Shopping",
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
        <StructuredData />

        <AuthProvider>
          <AppHeader />
          {children}
          <Analytics />
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
