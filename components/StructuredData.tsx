"use client"

/**
 * Structured Data (JSON-LD) for SEO
 * Provides rich snippets and sitelinks in Google Search results
 */

interface StructuredDataProps {
    type?: "website" | "product" | "organization"
}

export function StructuredData({ type = "website" }: StructuredDataProps) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deal-harbor-frontend.vercel.app"

    // Organization schema - helps Google understand the brand
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "DealHarbor",
        url: siteUrl,
        logo: `${siteUrl}/og-image.png`,
        description: "The #1 trusted marketplace for university students",
        sameAs: [
            // Add social media URLs when available
            // "https://twitter.com/dealharbor",
            // "https://instagram.com/dealharbor",
        ],
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            availableLanguage: "English",
        },
    }

    // Website schema with SearchAction for sitelinks search box
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "DealHarbor",
        url: siteUrl,
        description: "University Student Marketplace - Buy and sell safely within your campus community",
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${siteUrl}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    }

    // WebApplication schema for app-like features
    const webAppSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "DealHarbor",
        url: siteUrl,
        applicationCategory: "ShoppingApplication",
        operatingSystem: "Any",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "1200",
            bestRating: "5",
            worstRating: "1",
        },
    }

    // Breadcrumb schema for main navigation pages
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: siteUrl,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Products",
                item: `${siteUrl}/products`,
            },
            {
                "@type": "ListItem",
                position: 3,
                name: "Search",
                item: `${siteUrl}/search`,
            },
        ],
    }

    const schemas = [organizationSchema, websiteSchema, webAppSchema, breadcrumbSchema]

    return (
        <>
            {schemas.map((schema, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
        </>
    )
}

// Product schema for individual product pages
export function ProductStructuredData({
    name,
    description,
    price,
    currency = "INR",
    image,
    seller,
    condition = "UsedCondition",
    availability = "InStock",
}: {
    name: string
    description: string
    price: number
    currency?: string
    image: string
    seller: string
    condition?: "NewCondition" | "UsedCondition" | "RefurbishedCondition"
    availability?: "InStock" | "OutOfStock" | "PreOrder"
}) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deal-harbor-frontend.vercel.app"

    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        image,
        offers: {
            "@type": "Offer",
            price,
            priceCurrency: currency,
            availability: `https://schema.org/${availability}`,
            itemCondition: `https://schema.org/${condition}`,
            seller: {
                "@type": "Person",
                name: seller,
            },
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
    )
}
