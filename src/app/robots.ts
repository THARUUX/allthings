import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Use safe helper to ensure protocol
import { getBaseUrl } from '@/lib/url';
const baseUrl = getBaseUrl().toString();

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
