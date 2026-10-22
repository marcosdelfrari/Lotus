export type MarketingOption = {
  id: string;
  label: string;
  description: string;
  group?: string;
};

/** Proposta estratégica da operação (o “porquê” do plano). */
export const OPERATION_PROPOSAL_OPTIONS: MarketingOption[] = [
  {
    id: "fortalecimento_marca",
    label: "Fortalecimento de marca",
    description:
      "Alcance, lembrança e autoridade antes de pedir conversão direta.",
  },
  {
    id: "captura_lead",
    label: "Captura de lead",
    description:
      "Volume de contatos qualificados (formulário, WhatsApp, DM) para o time comercial.",
  },
  {
    id: "conversao_lead",
    label: "Conversão de lead",
    description:
      "Leads já na base ou públicos quentes → venda, agendamento ou checkout.",
  },
  {
    id: "funil_completo",
    label: "Funil completo (marca → lead → venda)",
    description:
      "Camadas de awareness, consideração e conversão na mesma operação.",
  },
];

/** Etapas da jornada de aquisição (landing, presell, etc.). */
export const FUNNEL_TOUCHPOINT_OPTIONS: MarketingOption[] = [
  {
    id: "landing_direta",
    group: "Páginas",
    label: "Landing page direta",
    description: "Página única com CTA claro (lead ou venda).",
  },
  {
    id: "presell",
    group: "Páginas",
    label: "Presell / página de aquecimento",
    description: "Conteúdo que educa e qualifica antes da oferta principal.",
  },
  {
    id: "page_vendas",
    group: "Páginas",
    label: "Página de vendas (sales page)",
    description: "Oferta longa ou VSL com prova e fechamento.",
  },
  {
    id: "formulario",
    group: "Conversão",
    label: "Formulário / lead magnet",
    description: "Captura nome, e-mail ou telefone com evento rastreado.",
  },
  {
    id: "whatsapp",
    group: "Conversão",
    label: "WhatsApp / mensagem direta",
    description: "Clique no anúncio abre conversa com atribuição de campanha.",
  },
  {
    id: "checkout",
    group: "Conversão",
    label: "Checkout / e-commerce",
    description: "Carrinho ou pagamento como evento de conversão.",
  },
  {
    id: "agendamento",
    group: "Conversão",
    label: "Agendamento / calendário",
    description: "Reunião ou consulta como meta principal.",
  },
  {
    id: "remarketing_site",
    group: "Remarketing",
    label: "Remarketing (visitantes do site)",
    description: "Reimpacto de quem já passou pelo rastreio.",
  },
];

/** Plataformas onde a mídia paga vai rodar (escolha explícita). */
export const PAID_PLATFORM_OPTIONS: MarketingOption[] = [
  {
    id: "google_ads",
    label: "Google Ads",
    description: "Pesquisa, Performance Max, Display e remarketing na rede Google.",
  },
  {
    id: "youtube",
    label: "YouTube",
    description: "Vídeo, in-stream e demand gen (conta Google Ads).",
  },
  {
    id: "instagram",
    label: "Instagram",
    description: "Feed, Stories e Reels via Meta Ads.",
  },
  {
    id: "facebook",
    label: "Facebook",
    description: "Feed, Stories, leads e mensagens via Meta Ads.",
  },
];

/** @deprecated IDs antigos — só para exibir planos já salvos. */
const LEGACY_MEDIA_CHANNEL_OPTIONS: MarketingOption[] = [
  { id: "google_search", label: "Google Ads · Pesquisa", description: "" },
  { id: "google_pmax", label: "Google Ads · PMax", description: "" },
  { id: "google_display", label: "Google Ads · Display", description: "" },
  { id: "google_youtube", label: "YouTube", description: "" },
  { id: "meta_feed_stories", label: "Instagram / Facebook · Feed", description: "" },
  { id: "meta_reels", label: "Instagram / Facebook · Reels", description: "" },
  { id: "meta_mensagens", label: "Meta · Mensagens", description: "" },
  { id: "personalizado", label: "Outro canal", description: "" },
  { id: "anuncio_midia", label: "Mídia paga (legado)", description: "" },
];

export const MEDIA_CHANNEL_OPTIONS = PAID_PLATFORM_OPTIONS;

/** Formatos e tipos de campanha / anúncio dentro dos canais. */
export const AD_FORMAT_OPTIONS: MarketingOption[] = [
  {
    id: "search_brand",
    group: "Pesquisa",
    label: "Marca (brand)",
    description: "Proteção de buscas pelo nome da empresa.",
  },
  {
    id: "search_generic",
    group: "Pesquisa",
    label: "Genérica / intenção",
    description: "Termos comerciais do segmento.",
  },
  {
    id: "search_competitor",
    group: "Pesquisa",
    label: "Concorrentes (se aplicável)",
    description: "Só quando estratégia e política da conta permitem.",
  },
  {
    id: "pmax_feed",
    group: "Performance",
    label: "PMax com feed / catálogo",
    description: "Produtos ou serviços com asset groups.",
  },
  {
    id: "meta_lead_form",
    group: "Meta",
    label: "Formulário instantâneo (lead ads)",
    description: "Lead dentro do Meta sem sair do app.",
  },
  {
    id: "meta_conversao_site",
    group: "Meta",
    label: "Conversão no site",
    description: "Pixel + eventos (WhatsApp, purchase, lead).",
  },
  {
    id: "meta_trafego_landing",
    group: "Meta",
    label: "Tráfego para landing / presell",
    description: "Cliques com UTMs para página dedicada.",
  },
  {
    id: "video_vsl",
    group: "Criativo",
    label: "Vídeo / VSL",
    description: "Roteiro de vendas ou explicativo em vídeo.",
  },
  {
    id: "criativo_personalizado",
    group: "Criativo",
    label: "Criativo personalizado",
    description: "Carrossel, UGC, estático sob briefing — descrever abaixo.",
  },
  {
    id: "remarketing_lista",
    group: "Remarketing",
    label: "Remarketing (lista / site)",
    description: "Públicos quentes e carrinho abandonado.",
  },
];

/** @deprecated use OPERATION_PROPOSAL_OPTIONS */
export const CAMPAIGN_PURPOSE_OPTIONS = OPERATION_PROPOSAL_OPTIONS;

/** @deprecated use FUNNEL_TOUCHPOINT_OPTIONS (ids principais) */
export const ACQUISITION_FLOW_OPTIONS: MarketingOption[] = [
  {
    id: "whatsapp",
    label: "WhatsApp direto",
    description: "Anúncio → conversa.",
  },
  {
    id: "landing_form",
    label: "Landing + formulário",
    description: "Anúncio → landing → lead.",
  },
  {
    id: "presell_oferta",
    label: "Presell → oferta",
    description: "Aquecimento antes da página de vendas.",
  },
  {
    id: "ecommerce",
    label: "E-commerce / checkout",
    description: "Anúncio → compra.",
  },
  {
    id: "agendamento",
    label: "Agendamento",
    description: "Anúncio → calendário.",
  },
];

/** @deprecated use AD_FORMAT_OPTIONS */
export const CAMPAIGN_TYPE_OPTIONS = AD_FORMAT_OPTIONS;

export type MarketingPlanFields = {
  operationProposal: string;
  funnelTouchpoints: string[];
  mediaChannels: string[];
  adFormats: string[];
  notes: string;
  customAssets: string;
};

export function labelFromOptions(
  id: string,
  lists: MarketingOption[][],
): string {
  for (const list of lists) {
    const hit = list.find((o) => o.id === id);
    if (hit) return hit.label;
  }
  return id;
}

export function labelsFromOptions(ids: string[], list: MarketingOption[]) {
  return ids.map((id) => list.find((o) => o.id === id)?.label ?? id);
}

export function labelForOperationProposal(id: string) {
  return labelFromOptions(id, [OPERATION_PROPOSAL_OPTIONS]);
}

export function labelsForFunnelTouchpoints(ids: string[]) {
  return labelsFromOptions(ids, FUNNEL_TOUCHPOINT_OPTIONS);
}

export function labelsForMediaChannels(ids: string[]) {
  return ids.map(
    (id) =>
      PAID_PLATFORM_OPTIONS.find((o) => o.id === id)?.label ??
      LEGACY_MEDIA_CHANNEL_OPTIONS.find((o) => o.id === id)?.label ??
      id,
  );
}

/** Normaliza funil e plataformas de registros antigos. */
export function normalizePlanFieldsForForm(fields: MarketingPlanFields): MarketingPlanFields {
  const funnel = fields.funnelTouchpoints.filter((id) => id !== "anuncio_midia");

  const media = [...fields.mediaChannels];
  const legacyToPlatform: Record<string, string[]> = {
    google_search: ["google_ads"],
    google_pmax: ["google_ads"],
    google_display: ["google_ads"],
    google_youtube: ["youtube"],
    meta_feed_stories: ["instagram", "facebook"],
    meta_reels: ["instagram", "facebook"],
    meta_mensagens: ["instagram", "facebook"],
  };

  const expanded = new Set<string>();
  for (const id of media) {
    const mapped = legacyToPlatform[id];
    if (mapped) mapped.forEach((p) => expanded.add(p));
    else if (PAID_PLATFORM_OPTIONS.some((o) => o.id === id)) expanded.add(id);
  }

  return {
    ...fields,
    funnelTouchpoints: funnel,
    mediaChannels: [...expanded],
    customAssets: "",
  };
}

export function labelsForAdFormats(ids: string[]) {
  return labelsFromOptions(ids, AD_FORMAT_OPTIONS);
}

/** Compatibilidade com registros antigos. */
export function labelForPurpose(id: string) {
  return labelForOperationProposal(id);
}

export function labelForFlow(id: string) {
  return labelFromOptions(id, [
    ACQUISITION_FLOW_OPTIONS,
    FUNNEL_TOUCHPOINT_OPTIONS,
  ]);
}

export function labelsForCampaignTypes(ids: string[]) {
  return labelsForAdFormats(ids);
}

export function proposalToPlanFields(row: {
  operationProposal?: string;
  funnelTouchpoints?: string[];
  mediaChannels?: string[];
  adFormats?: string[];
  campaignPurpose: string;
  acquisitionFlow: string;
  campaignTypes: string[];
  notes: string;
  customAssets?: string;
}): MarketingPlanFields {
  const funnel =
    row.funnelTouchpoints && row.funnelTouchpoints.length > 0
      ? row.funnelTouchpoints
      : row.acquisitionFlow
        ? [row.acquisitionFlow]
        : [];
  const media = row.mediaChannels ?? [];
  const formats =
    row.adFormats && row.adFormats.length > 0
      ? row.adFormats
      : row.campaignTypes;

  return normalizePlanFieldsForForm({
    operationProposal: row.operationProposal || row.campaignPurpose,
    funnelTouchpoints: funnel,
    mediaChannels: media,
    adFormats: formats,
    notes: row.notes,
    customAssets: "",
  });
}

export function legacyScalarsFromPlan(plan: MarketingPlanFields) {
  const primaryFlow =
    plan.funnelTouchpoints.find((id) =>
      ["whatsapp", "landing_form", "presell_oferta", "ecommerce", "agendamento"].includes(
        id,
      ),
    ) ??
    plan.funnelTouchpoints[0] ??
    "landing_direta";

  return {
    campaignPurpose: plan.operationProposal,
    acquisitionFlow: primaryFlow,
    campaignTypes: plan.adFormats,
  };
}
