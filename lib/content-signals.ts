/**
 * Preferências de uso de conteúdo para sistemas automatizados (Content Signals).
 * @see https://contentsignals.org/
 * @see https://datatracker.ietf.org/doc/draft-romm-aipref-contentsignals/
 * @see https://isitagentready.com/.well-known/agent-skills/content-signals/SKILL.md
 */
export const CONTENT_SIGNAL_VALUE =
  "ai-train=no, search=yes, ai-input=yes" as const;

/** Diretiva completa para robots.txt / headers HTTP. */
export const CONTENT_SIGNAL_DIRECTIVE =
  `Content-Signal: ${CONTENT_SIGNAL_VALUE}` as const;

/**
 * Comentários de política (Cloudflare / contentsignals.org) —
 * documentam o significado dos três eixos no robots.txt.
 */
export const CONTENT_SIGNAL_POLICY_COMMENTS = `# As a condition of accessing this website, you agree to abide by the
# following content signals:
#
# (a)  If a content-signal = yes, you may collect content for the
#      corresponding use.
# (b)  If a content-signal = no, you may not collect content for the
#      corresponding use.
# (c)  If the website operator does not include a content signal for a
#      corresponding use, the website operator neither grants nor restricts
#      permission via content signal with respect to the corresponding use.
#
# The content signals and their meanings are:
#
# search: building a search index and providing search results (e.g., returning
#         hyperlinks and short excerpts from your website's contents). Search
#         does not include providing AI-generated search summaries.
# ai-input: inputting content into one or more AI models (e.g., retrieval
#           augmented generation, grounding, or other real-time taking of
#           content for generative AI search answers).
# ai-train: training or fine-tuning AI models.
#
# See https://contentsignals.org/ and
# https://datatracker.ietf.org/doc/draft-romm-aipref-contentsignals/` as const;
