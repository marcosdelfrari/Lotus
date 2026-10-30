export type PublicSitemapEntry = {
  /** Path canônico começando com `/`. */
  path: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
  /**
   * Data da última publicação/alteração relevante do conteúdo.
   * Atualize ao publicar mudanças na landing (ou novas páginas públicas).
   */
  lastModified: string;
};

/**
 * Páginas públicas indexáveis.
 * Deve permanecer alinhado com Allow/Disallow em `/robots.txt`.
 */
export const PUBLIC_SITEMAP_ENTRIES: readonly PublicSitemapEntry[] = [
  {
    path: "/",
    changeFrequency: "weekly",
    priority: 1,
    lastModified: "2026-10-30",
  },
];
