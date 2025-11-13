"use client"

import HeroSection from "@/components/Hero"
import AllSections from "@/components/HomeSections"
import Footer from "@/components/Footer"
import { useEffect } from "react"

const metadata = {
  title: "DealHarbor - Student Marketplace for Great Deals",
  description:
    "Discover trending deals, verified sellers, and authentic products on DealHarbor. The ultimate student marketplace for buying and selling with confidence.",
  keywords: ["student marketplace", "deals", "ecommerce", "verified sellers", "student discounts"],
  authors: [{ name: "DealHarbor" }],
  creator: "DealHarbor",
  publisher: "DealHarbor",
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dealharbor.com",
    siteName: "DealHarbor",
    title: "DealHarbor - Student Marketplace for Great Deals",
    description: "Discover trending deals, verified sellers, and authentic products on DealHarbor.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DealHarbor - Student Marketplace",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DealHarbor",
    creator: "@DealHarbor",
    title: "DealHarbor - Student Marketplace for Great Deals",
    description: "Discover trending deals, verified sellers, and authentic products.",
    images: ["/og-image.jpg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  alternates: {
    canonical: "https://dealharbor.com",
  },
}

export default function Home() {
  useEffect(() => {
    // Set document title
    document.title = "DealHarbor - Student Marketplace for Great Deals"
  }, [])

  return (
    <main className="overflow-hidden">
      <HeroSection />

      <AllSections />

      {/* Footer with links and info */}
      <Footer />

      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "DealHarbor",
            url: "https://dealharbor.com",
            description: "Student marketplace for buying and selling authentic products with verified sellers",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://dealharbor.com/search?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "DealHarbor",
            url: "https://dealharbor.com",
            logo: "https://dealharbor.com/logo.png",
            description: "The ultimate student marketplace for discovering deals and verified sellers",
            sameAs: [
              "https://twitter.com/DealHarbor",
              "https://facebook.com/DealHarbor",
              "https://instagram.com/DealHarbor",
            ],
          }),
        }}
      />
    </main>
  )
}
