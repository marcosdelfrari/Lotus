/**
 * WebMCP — registra tools no document.modelContext (fallback: navigator.modelContext).
 * @see https://webmachinelearning.github.io/webmcp/
 */
(function registerLotusWebMcp() {
  if (typeof window === "undefined") return;
  if (window.__lotusWebMcpRegistered) return;

  var ctx =
    (document.modelContext && document.modelContext) ||
    (navigator.modelContext && navigator.modelContext);
  if (!ctx || typeof ctx.registerTool !== "function") return;

  window.__lotusWebMcpRegistered = true;
  var controller = new AbortController();
  window.__lotusWebMcpAbort = controller;

  function register(tool) {
    return ctx.registerTool(tool, { signal: controller.signal });
  }

  void register({
    name: "get_site_overview",
    description:
      "Retorna visão geral da Lótus: produto, CTA principal e links de discovery para agentes.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    execute: async function () {
      return {
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
      };
    },
  });

  void register({
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
    execute: async function (input) {
      var target = String((input && input.target) || "").trim();
      if (!target) throw new Error("target is required");

      if (target.startsWith("#")) {
        var el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.location.hash = target;
        return { ok: true, navigated: target };
      }

      if (!target.startsWith("/") || target.startsWith("//")) {
        throw new Error("Only same-origin paths or hash targets are allowed");
      }
      window.location.assign(target);
      return { ok: true, navigated: target };
    },
  });

  void register({
    name: "start_proposal",
    description:
      "Inicia o fluxo de proposta da Lótus levando o usuário para login com next=/propostas.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    execute: async function () {
      window.location.assign("/login?next=/propostas");
      return { ok: true, navigated: "/login?next=/propostas" };
    },
  });

  void register({
    name: "get_discovery_links",
    description:
      "Lista URLs públicas de discovery (api-catalog, OpenAPI, OAuth, MCP, auth.md, agent-skills).",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    execute: async function () {
      var origin = window.location.origin;
      return {
        apiCatalog: origin + "/.well-known/api-catalog",
        openApi: origin + "/openapi.json",
        serviceDoc: origin + "/docs/api",
        llmsTxt: origin + "/llms.txt",
        health: origin + "/health",
        authMd: origin + "/auth.md",
        openIdConfiguration: origin + "/.well-known/openid-configuration",
        oauthAuthorizationServer:
          origin + "/.well-known/oauth-authorization-server",
        oauthProtectedResource:
          origin + "/.well-known/oauth-protected-resource",
        mcp: origin + "/mcp",
        mcpServerCard: origin + "/.well-known/mcp/server-card.json",
        agentSkills: origin + "/.well-known/agent-skills/index.json",
      };
    },
  });
})();
