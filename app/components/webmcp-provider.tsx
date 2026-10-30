"use client";

import { useEffect } from "react";

type ModelContext = {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: Record<string, unknown>;
      execute: (
        input: Record<string, unknown>,
        options?: { signal?: AbortSignal },
      ) => Promise<unknown>;
    },
    options?: { signal?: AbortSignal },
  ) => Promise<unknown>;
};

function getModelContext(): ModelContext | null {
  const doc = document as Document & { modelContext?: ModelContext };
  const nav = navigator as Navigator & { modelContext?: ModelContext };
  return doc.modelContext ?? nav.modelContext ?? null;
}

/**
 * Registra tools WebMCP no mount (AbortSignal no unmount).
 * Complementa /webmcp.js para ambientes sem script externo.
 */
export function WebMcpProvider() {
  useEffect(() => {
    const ctx = getModelContext();
    if (!ctx?.registerTool) return;

    const controller = new AbortController();
    const { signal } = controller;

    const register = (tool: Parameters<ModelContext["registerTool"]>[0]) => {
      void ctx.registerTool(tool, { signal }).catch(() => {
        // Tool já registrada por /webmcp.js — ok.
      });
    };

    register({
      name: "get_site_overview",
      description:
        "Retorna visão geral da Lótus: produto, CTA principal e links de discovery para agentes.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      execute: async () => ({
        brand: "Lótus",
        product: "Gestão de Google Ads e Meta Ads",
        primaryCta: "/login?next=/propostas",
        discovery: {
          apiCatalog: "/.well-known/api-catalog",
          openApi: "/openapi.json",
          llmsTxt: "/llms.txt",
          authMd: "/auth.md",
          mcp: "/mcp",
          mcpServerCard: "/.well-known/mcp/server-card.json",
          agentSkills: "/.well-known/agent-skills/index.json",
        },
      }),
    });

    register({
      name: "navigate_to",
      description:
        "Navega para uma seção da landing (#servicos, #analytics, #como-funciona, #contato) ou para rotas públicas (/login, /cadastro).",
      inputSchema: {
        type: "object",
        properties: {
          target: {
            type: "string",
            description:
              "Âncora (#contato) ou path (/login?next=/propostas). Paths externos são rejeitados.",
          },
        },
        required: ["target"],
        additionalProperties: false,
      },
      execute: async (input) => {
        const target = String(input.target ?? "").trim();
        if (!target) throw new Error("target is required");
        if (target.startsWith("#")) {
          document.querySelector(target)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          return { ok: true, navigated: target };
        }
        if (!target.startsWith("/") || target.startsWith("//")) {
          throw new Error("Only same-origin paths or hash targets are allowed");
        }
        window.location.assign(target);
        return { ok: true, navigated: target };
      },
    });

    register({
      name: "start_proposal",
      description:
        "Inicia o fluxo de proposta da Lótus levando o usuário para login com next=/propostas.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      execute: async () => {
        window.location.assign("/login?next=/propostas");
        return { ok: true, navigated: "/login?next=/propostas" };
      },
    });

    register({
      name: "get_discovery_links",
      description:
        "Lista URLs públicas de discovery (api-catalog, OpenAPI, OAuth, MCP, auth.md, agent-skills).",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      execute: async () => {
        const origin = window.location.origin;
        return {
          apiCatalog: `${origin}/.well-known/api-catalog`,
          openApi: `${origin}/openapi.json`,
          serviceDoc: `${origin}/docs/api`,
          llmsTxt: `${origin}/llms.txt`,
          health: `${origin}/health`,
          authMd: `${origin}/auth.md`,
          openIdConfiguration: `${origin}/.well-known/openid-configuration`,
          oauthAuthorizationServer: `${origin}/.well-known/oauth-authorization-server`,
          oauthProtectedResource: `${origin}/.well-known/oauth-protected-resource`,
          mcp: `${origin}/mcp`,
          mcpServerCard: `${origin}/.well-known/mcp/server-card.json`,
          agentSkills: `${origin}/.well-known/agent-skills/index.json`,
        };
      },
    });

    return () => controller.abort();
  }, []);

  return null;
}
