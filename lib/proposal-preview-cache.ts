import type { TrafficProposalView } from "@/lib/proposal-types";

export const PROPOSAL_PREVIEW_CACHE_KEY = "lotus:proposal-preview";

/** Compartilhado entre abas (localStorage); sessionStorage não vale em nova aba. */
const MAX_AGE_MS = 60 * 60 * 1000;

type CachedProposalEnvelope = {
  savedAt: number;
  proposal: TrafficProposalView;
};

function isBrowserStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function writeProposalPreviewCache(proposal: TrafficProposalView) {
  if (!isBrowserStorage()) return;
  const envelope: CachedProposalEnvelope = {
    savedAt: Date.now(),
    proposal,
  };
  localStorage.setItem(PROPOSAL_PREVIEW_CACHE_KEY, JSON.stringify(envelope));
}

export function readProposalPreviewCache(): TrafficProposalView | null {
  if (!isBrowserStorage()) return null;

  const raw = localStorage.getItem(PROPOSAL_PREVIEW_CACHE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CachedProposalEnvelope | TrafficProposalView;

    if (parsed && typeof parsed === "object" && "savedAt" in parsed && "proposal" in parsed) {
      const envelope = parsed as CachedProposalEnvelope;
      if (Date.now() - envelope.savedAt > MAX_AGE_MS) {
        localStorage.removeItem(PROPOSAL_PREVIEW_CACHE_KEY);
        return null;
      }
      return envelope.proposal;
    }

    return parsed as TrafficProposalView;
  } catch {
    return null;
  }
}

export function previewValidUntilIso(days = 30) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
