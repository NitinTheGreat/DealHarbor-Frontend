// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { ToastProvider } from "@/components/ui/toast-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "DealHarbor - VIT Student Marketplace",
    template: "%s | DealHarbor",
  },
  description:
    "Buy and sell with fellow VIT students in a secure, trusted marketplace. Your campus marketplace for textbooks, electronics, furniture, and more.",
  keywords: ["VIT", "student marketplace", "buy sell", "campus", "university", "textbooks", "electronics"],
  authors: [{ name: "DealHarbor Team" }],
  creator: "DealHarbor",
  publisher: "DealHarbor",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "DealHarbor - VIT Student Marketplace",
    description: "Buy and sell with fellow VIT students in a secure, trusted marketplace",
    siteName: "DealHarbor",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DealHarbor - VIT Student Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DealHarbor - VIT Student Marketplace",
    description: "Buy and sell with fellow VIT students in a secure, trusted marketplace",
    images: ["/og-image.jpg"],
  },
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d97e96" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="antialiased">
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
