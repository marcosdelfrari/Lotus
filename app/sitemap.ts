import type { MetadataRoute } from "next";
import { PUBLIC_SITEMAP_ENTRIES } from "@/lib/sitemap-data";
import { getSiteUrl } from "@/lib/site-url";

/**
 * /sitemap.xml — Sitemaps protocol
 * https://www.sitemaps.org/protocol.html
 *
 * Referenciado em /robots.txt. Atualize `PUBLIC_SITEMAP_ENTRIES`
 * (lastModified / novas rotas) ao publicar conteúdo público.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();

  return PUBLIC_SITEMAP_ENTRIES.map((entry) => ({
    url: entry.path === "/" ? `${site}/` : `${site}${entry.path}`,
    lastModified: new Date(entry.lastModified),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
