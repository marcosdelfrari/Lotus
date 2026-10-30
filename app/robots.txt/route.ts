import {
  CONTENT_SIGNAL_DIRECTIVE,
  CONTENT_SIGNAL_POLICY_COMMENTS,
} from "@/lib/content-signals";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Paths privados — não indexar / não usar em grounding.
 * Alinhado com PUBLIC_SITEMAP_ENTRIES e rotas autenticadas.
 */
const PRIVATE_DISALLOWS = [
  "Disallow: /admin",
  "Disallow: /admin/",
  "Disallow: /api/",
  "Disallow: /login",
  "Disallow: /cadastro",
  "Disallow: /propostas",
  "Disallow: /servicos",
  "Disallow: /obrigado",
] as const;

/** Política pública: Allow / + bloqueio de áreas privadas. */
function publicCrawlRules(userAgent: string) {
  return [
    `User-agent: ${userAgent}`,
    "Allow: /",
    ...PRIVATE_DISALLOWS,
    "",
  ].join("\n");
}

/**
 * Crawlers de treino — alinhado a Content-Signal: ai-train=no.
 * Bloquear não impede aparição em respostas de AI search.
 */
function blockTrainingRules(userAgent: string) {
  return [`User-agent: ${userAgent}`, "Disallow: /", ""].join("\n");
}

/**
 * robots.txt (RFC 9309) + Content Signals (IETF draft).
 * Preferências: search=yes, ai-input=yes, ai-train=no.
 * @see https://isitagentready.com/.well-known/agent-skills/content-signals/SKILL.md
 * @see https://isitagentready.com/.well-known/agent-skills/ai-rules/SKILL.md
 */
export function GET() {
  const site = getSiteUrl();

  const body = `# Lótus — https://www.rfc-editor.org/rfc/rfc9309

${CONTENT_SIGNAL_POLICY_COMMENTS}

User-agent: *
${CONTENT_SIGNAL_DIRECTIVE}
Allow: /
${PRIVATE_DISALLOWS.join("\n")}

# --- AI search crawlers (aparecem em respostas de assistentes) ---
${publicCrawlRules("OAI-SearchBot")}
${publicCrawlRules("Claude-SearchBot")}
${publicCrawlRules("PerplexityBot")}

# --- User-triggered fetchers (ai-input / grounding sob demanda) ---
${publicCrawlRules("ChatGPT-User")}
${publicCrawlRules("Claude-User")}
${publicCrawlRules("Perplexity-User")}

# --- AI training crawlers (não afetam AI search results) ---
${blockTrainingRules("GPTBot")}
${blockTrainingRules("ClaudeBot")}
${blockTrainingRules("Google-Extended")}
${blockTrainingRules("Applebot-Extended")}
${blockTrainingRules("CCBot")}
${blockTrainingRules("Bytespider")}
${blockTrainingRules("Amazonbot")}

Sitemap: ${site}/sitemap.xml
Agentmap: ${site}/.well-known/ai-catalog.json
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
