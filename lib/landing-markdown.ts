import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

const SITE_TITLE = "Lótus — Gestão de tráfego pago";
const SITE_DESCRIPTION =
  "Gestão de Google Ads e Meta Ads para empresas que querem vender mais com método.";

/**
 * Representação markdown da homepage (/) para agentes
 * (`Accept: text/markdown`). Frontmatter alinhado ao Markdown for Agents.
 */
export function buildHomeMarkdown() {
  const site = getSiteUrl();
  const login = absoluteUrl("/login?next=/propostas");

  return `---
title: ${SITE_TITLE}
description: ${SITE_DESCRIPTION}
---

# Transformando anúncios em demanda previsível

Gestão de Google Ads e Meta Ads para empresas que buscam clareza e resultado concreto em vendas.

- [Começar agora](${login})
- Canais: Google Ads · Meta Ads

## Não existe volume sem performance

Muitas empresas gastam em anúncio e não sabem o que cada real está gerando. A Lótus assume a gestão de tráfego pago com estratégia, criativos alinhados à oferta e leitura contínua de custo por lead e por venda — para o investimento deixar de ser aposta e virar operação.

[Entrar em contato](${login})

## O que a gestão de tráfego entrega

Uma operação de mídia paga pronta para gerar demanda — da estratégia ao anúncio no ar, com prestação de contas.

### Gestão de Google Ads

Pesquisa, display e performance max com estrutura de campanha, palavras, negativas e orçamento controlado pelo que de fato converte.

### Gestão de Meta Ads

Campanhas de alcance, consideração e conversão no Instagram e Facebook, com público, criativo e oferta testados em ciclo contínuo.

### Estratégia de mídia

Definição de objetivo, funil, ticket e meta de CPA antes de ligar o anúncio — para cada real ter um papel claro na venda.

### Criativos que vendem

Direção de anúncio, copies e variações de criativo orientadas a clique qualificado, não a vaidade de impressão.

### Landing e conversão

Página de captação alinhada à campanha, para o tráfego não morrer no clique e o lead chegar pronto para o comercial.

### Leitura de resultado

Investimento, leads e origem no Lótus Analytics — incluso na gestão. Veja o que a mídia pagou e o que o negócio recebeu de volta.

## Analytics

Acompanhe Google Ads, Meta Ads e conversões rastreadas em um painel único — transparência 24/7 sobre o que a operação está gerando.

## Anúncio sem método não resiste ao mês seguinte

A Lótus reduz o custo de adquirir cliente e acelera vendas com campanhas que você consegue auditar. O trabalho responde uma pergunta simples: por que essa pessoa deveria comprar de você — e quanto custa trazê-la até aqui.

### Sua operação de tráfego, pronta para usar

Evite montar, treinar e gerir um time interno. A gestão entra no seu negócio e entrega campanha, otimização e leitura de resultado desde o primeiro ciclo.

- Estratégia de mídia
- Gestão de Google Ads
- Gestão de Meta Ads
- Criativos e copies
- Landing de captação
- Leitura de ROI/ROAS

[Começar agora](${login})

## Contratação clara, do login à campanha

1. **Faça Login** — Entrada rápida, sem formulário de cadastro.
2. **Solicite a gestão** — No ambiente logado, você dá o próximo passo e a Lótus entende objetivo, segmento e momento do negócio.
3. **Receba a proposta** — Escopo, serviços, fee de gestão e investimento sugerido em mídia — tudo explícito antes de começar.
4. **Coloque no ar** — Aceite digital na proposta, painel de resultados liberado e kickoff de contas, criativos e otimização.

## Próximo passo

Preencha os dados da sua empresa. Trabalhamos com um número limitado de novas contas por ciclo. Vamos avaliar o encaixe entre o seu negócio e nossa gestão.

[Começar agora](${login})

## Discovery para agentes

- Site: ${site}/
- llms.txt: ${absoluteUrl("/llms.txt")}
- API catalog: ${absoluteUrl("/.well-known/api-catalog")}
- OpenAPI: ${absoluteUrl("/openapi.json")}
- Health: ${absoluteUrl("/health")}
- robots.txt: ${absoluteUrl("/robots.txt")}
- sitemap.xml: ${absoluteUrl("/sitemap.xml")}

Para esta página em markdown, envie \`Accept: text/markdown\`.
`;
}

/** Resolve markdown canônico por path público indexável. */
export function resolvePageMarkdown(pathname: string): string | null {
  if (pathname === "/" || pathname === "") {
    return buildHomeMarkdown();
  }
  return null;
}
