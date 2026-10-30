/**
 * Content negotiation para Markdown for Agents.
 * @see https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 * @see https://isitagentready.com/.well-known/agent-skills/markdown-negotiation/SKILL.md
 */

import { CONTENT_SIGNAL_VALUE } from "@/lib/content-signals";

type AcceptPart = {
  type: string;
  q: number;
};

function parseAccept(header: string | null): AcceptPart[] {
  if (!header?.trim()) return [];

  return header.split(",").map((raw) => {
    const segments = raw.trim().split(";").map((s) => s.trim());
    const type = (segments[0] ?? "*/*").toLowerCase();
    let q = 1;
    for (const param of segments.slice(1)) {
      const [key, value] = param.split("=").map((s) => s.trim());
      if (key === "q" && value) {
        const parsed = Number.parseFloat(value);
        if (Number.isFinite(parsed)) q = parsed;
      }
    }
    return { type, q };
  });
}

function qualityFor(parts: AcceptPart[], wanted: string): number | null {
  let best: number | null = null;
  for (const part of parts) {
    if (part.q <= 0) continue;
    const matches =
      part.type === wanted ||
      part.type === "*/*" ||
      (part.type.endsWith("/*") &&
        wanted.startsWith(part.type.slice(0, part.type.indexOf("/")) + "/"));
    if (!matches) continue;
    // Preferência explícita (text/markdown) vence */*
    const specificity =
      part.type === wanted ? 2 : part.type.endsWith("/*") ? 1 : 0;
    const score = part.q + specificity * 0.001;
    if (best === null || score > best) best = score;
  }
  return best;
}

/**
 * True quando o cliente prefere text/markdown a text/html
 * (ex.: `Accept: text/markdown` ou `text/markdown, text/html;q=0.8`).
 */
export function prefersMarkdown(acceptHeader: string | null): boolean {
  const parts = parseAccept(acceptHeader);
  if (parts.length === 0) return false;

  const markdownQ = qualityFor(parts, "text/markdown");
  if (markdownQ === null) return false;

  // Só conta se text/markdown aparece explicitamente (não só via */*)
  const explicitMarkdown = parts.some(
    (p) => p.type === "text/markdown" && p.q > 0,
  );
  if (!explicitMarkdown) return false;

  const htmlQ = qualityFor(parts, "text/html") ?? 0;
  return markdownQ >= htmlQ;
}

/** Estimativa simples de tokens (≈ chars/4), para x-markdown-tokens. */
export function estimateMarkdownTokens(markdown: string): number {
  return Math.max(1, Math.ceil(markdown.length / 4));
}

export function markdownResponseHeaders(markdown: string): HeadersInit {
  return {
    "Content-Type": "text/markdown; charset=utf-8",
    Vary: "Accept",
    "x-markdown-tokens": String(estimateMarkdownTokens(markdown)),
    "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    "Content-Signal": CONTENT_SIGNAL_VALUE,
  };
}
