import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deal-harbor-frontend.vercel.app"

    // Static pages
    const staticPages = [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 1,
        },
        {
            url: `${siteUrl}/products`,
            lastModified: new Date(),
            changeFrequency: "hourly" as const,
            priority: 0.9,
        },
        {
            url: `${siteUrl}/search`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.8,
        },
        {
            url: `${siteUrl}/login`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
        {
            url: `${siteUrl}/signup`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
    ]

    // In production, you could fetch dynamic product pages from backend:
    // const products = await fetch(`${process.env.API_BASE_URL}/api/products?limit=1000`)
    // const productPages = products.map(p => ({
    //   url: `${siteUrl}/products/${p.id}`,
    //   lastModified: new Date(p.updatedAt),
    //   changeFrequency: 'weekly' as const,
    //   priority: 0.7,
    // }))

    return staticPages
}
