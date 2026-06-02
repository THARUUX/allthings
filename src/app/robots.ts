import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || "https://allthings.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/posts/", "/login", "/register"],
        disallow: ["/dashboard/", "/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
