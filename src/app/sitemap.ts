import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use safe helper to ensure protocol
import { getBaseUrl } from '@/lib/url';
const baseUrl = getBaseUrl().toString();

  let articleUrls: any[] = [];
  try {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });
    
    articleUrls = articles.map((a) => ({
      url: `${baseUrl}/posts/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    console.error("[SITEMAP GENERATION] Error querying articles:", error);
  }

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    ...articleUrls,
  ];
}
