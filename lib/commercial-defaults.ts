import type {
  ImplementationPlanStep,
  ProposalCommercialPayload,
} from "@/lib/proposal-types";

export const PROPOSAL_FLOW_STEPS = [
  {
    id: 1,
    shortLabel: "Capa",
    label: "Proposta e dados do cliente",
    hint: "Apresentação, identificação do contratante, empresa e validade da proposta.",
  },
  {
    id: 2,
    shortLabel: "Escopo",
    label: "Escopo dos serviços",
    hint: "Google Ads, Meta Ads, objetivos, entregáveis, otimizações e relatórios incluídos.",
  },
  {
    id: 3,
    shortLabel: "Cronograma",
    label: "Plano de implantação",
    hint: "Etapas de configuração, acessos necessários, prazos estimados e responsabilidades.",
  },
  {
    id: 4,
    shortLabel: "Investimento",
    label: "Investimento e condições",
    hint: "Taxa de implantação, mensalidade da gestão, verba de anúncios, pagamento e cancelamento.",
  },
  {
    id: 5,
    shortLabel: "Governança",
    label: "Termos e responsabilidades",
    hint: "Obrigações, limites do serviço, condições contratuais e regras de encerramento.",
  },
  {
    id: 6,
    shortLabel: "Aceite",
    label: "Revisão e aceite",
    hint: "Resumo completo, checkbox obrigatório e botão para aceitar a proposta.",
  },
] as const;

export const defaultImplementationPlan: ImplementationPlanStep[] = [
  {
    title: "Kickoff e coleta de informações",
    description:
      "Briefing, objetivos comerciais, serviços anunciados, público e área de atendimento.",
  },
  {
    title: "Acessos e infraestrutura",
    description:
      "Acesso às contas de anúncios, site, conversões e ferramentas de mensuração necessárias.",
  },
  {
    title: "Configuração e criação",
    description:
      "Configuração das campanhas, segmentações, anúncios, orçamento e rastreamento contratado.",
  },
  {
    title: "Revisão e ativação",
    description:
      "Conferência das configurações e ativação das campanhas após aprovação e disponibilização dos recursos necessários.",
  },
  {
    title: "Acompanhamento contínuo",
    description:
      "Monitoramento, otimizações e relatórios conforme a periodicidade contratada.",
  },
];

export function defaultCommercialPayload(): ProposalCommercialPayload {
  return {
    title: "Gestão de tráfego pago (Google Ads + Meta Ads)",
    intro:
      "Proposta comercial para gestão profissional de mídia paga, com escopo transparente, cronograma de implantação e investimento detalhado antes do aceite digital.",
    scope: [
      "Gestão de Google Ads (Search, Display, Performance Max conforme estratégia)",
      "Gestão de Meta Ads (Instagram e Facebook)",
      "Definição de objetivos, funil e KPIs comerciais",
      "Entregáveis: estrutura de campanhas, anúncios e landing alinhada",
      "Otimizações contínuas de lance, público, criativos e orçamento",
      "Relatórios quinzenais de investimento x resultados",
      "Acompanhamento de resultados no painel Lótus Analytics",
    ],
    services: [
      {
        name: "Gestão mensal de mídia paga",
        description: "Setup, otimização e acompanhamento Google + Meta",
        value: 3200,
      },
      {
        name: "Landing de conversão",
        description: "Página responsiva e formulário integrado",
        value: 1800,
      },
      {
        name: "Tracking e analytics",
        description: "Eventos, UTMs e painel Pro liberado após aceite",
        value: 900,
      },
    ],
    setupFee: 1500,
    adBudgetSuggestion: 4500,
    deadlineDays: 90,
    implementationPlan: defaultImplementationPlan,
    conditions: [
      "Taxa de implantação única, faturada na assinatura do aceite",
      "Mensalidade de gestão conforme serviços listados, faturamento recorrente",
      "Investimento em mídia pago diretamente às plataformas (Google e Meta)",
      "Pagamento da gestão via boleto ou PIX, vencimento no 5º dia útil",
      "Cancelamento com aviso prévio de 30 dias; verba de mídia permanece sob controle do cliente",
    ],
    terms: [
      "O cliente garante veracidade das informações de negócio e materiais enviados",
      "Criativos e aprovações comerciais devem ser disponibilizados em até 5 dias úteis quando solicitados",
      "Resultados dependem de mercado, verba, sazonalidade e oferta — não há garantia de volume de leads",
      "Alterações de escopo, novas plataformas ou peças extras exigem aditivo comercial",
      "Encerramento do contrato não remove acessos do cliente às contas de anúncio",
      "Aceite digital nesta proposta substitui assinatura física para início da implantação",
    ],
  };
}
