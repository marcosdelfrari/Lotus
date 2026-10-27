import type { AcceptanceDevice } from "@/lib/acceptance";
import { adminEmail } from "@/lib/access-code";
import { formatCurrency } from "@/lib/format";
import { buildProposalPdf } from "@/lib/proposal-pdf";
import { proposalTotalServices, type TrafficProposalView } from "@/lib/proposal-types";

function appUrl() {
  const raw =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;
  if (!raw) return "http://localhost:3000";
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }
  return `https://${raw.replace(/\/$/, "")}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function resendApiKey() {
  return process.env.REPLICATE_API_KEY?.trim() ?? "";
}

function fromAddress() {
  return process.env.EMAIL_FROM || "Lótus <onboarding@resend.dev>";
}

export function mailConfigured() {
  return Boolean(resendApiKey());
}

function resendErrorMessage(status: number, body: string) {
  let apiMessage = "";
  try {
    const parsed = JSON.parse(body) as { message?: string };
    apiMessage = parsed.message?.trim() ?? "";
  } catch {
    /* ignore */
  }

  if (status === 403 && apiMessage.toLowerCase().includes("testing emails")) {
    return "No modo de teste do Resend, o código só pode ir para o e-mail da sua conta Resend. Verifique um domínio em resend.com/domains ou teste com esse e-mail.";
  }

  if (status === 401) {
    return "Chave da API Resend inválida. Confira REPLICATE_API_KEY no ambiente.";
  }

  if (apiMessage) return apiMessage;

  return "Não foi possível enviar o e-mail. Tente de novo.";
}

export async function sendLoginCodeEmail(to: string, code: string) {
  const apiKey = resendApiKey();
  if (!apiKey) {
    return { error: "Envio de e-mail não configurado." } as const;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [to],
      subject: "Seu código de acesso — Lótus",
      text: [
        "Use o código abaixo para entrar na Lótus:",
        "",
        code,
        "",
        "O código expira em 15 minutos. Se você não pediu este e-mail, ignore.",
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("Resend falhou", response.status, body);
    return { error: resendErrorMessage(response.status, body) } as const;
  }

  return { ok: true } as const;
}

export async function sendProposalEmail(input: {
  to: string;
  name: string;
  proposal: TrafficProposalView;
}) {
  const apiKey = process.env.REPLICATE_API_KEY;
  if (!apiKey) {
    return { error: "REPLICATE_API_KEY não configurada." } as const;
  }

  const monthly = formatCurrency(proposalTotalServices(input.proposal));
  const company = escapeHtml(input.proposal.companyName);
  const title = escapeHtml(input.proposal.title || "Gestão de tráfego pago");
  const greeting = escapeHtml(input.name || input.proposal.companyName);
  const link = `${appUrl()}/login?next=${encodeURIComponent("/propostas")}`;
  const from = process.env.EMAIL_FROM || "Lótus <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: `Sua proposta comercial — ${input.proposal.companyName}`,
      html: `
        <div style="background:#0c0c0c;color:#ededed;font-family:Georgia,serif;padding:40px 16px;">
          <div style="max-width:520px;margin:0 auto;border:1px solid #2a2a2a;padding:32px;">
            <p style="margin:0;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#888;">Lótus</p>
            <h1 style="margin:16px 0 0;font-weight:400;font-size:28px;line-height:1.2;">${title}</h1>
            <p style="margin:20px 0 0;font-family:sans-serif;font-size:14px;line-height:1.6;color:#a1a1a1;">
              Olá, ${greeting}. A proposta de ${company} está pronta para revisão e aceite.
              Mensalidade de gestão: <span style="color:#ededed;">${monthly}</span>.
            </p>
            <p style="margin:28px 0 0;">
              <a href="${link}" style="display:inline-block;background:#ededed;color:#0c0c0c;text-decoration:none;font-family:sans-serif;font-size:13px;padding:12px 20px;">
                Abrir proposta
              </a>
            </p>
            <p style="margin:24px 0 0;font-family:sans-serif;font-size:12px;line-height:1.5;color:#888;">
              Entre com a mesma conta Google deste e-mail. A proposta abre direto para o aceite.
            </p>
          </div>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    return {
      error: body?.message || "Não foi possível enviar o e-mail da proposta.",
    } as const;
  }

  return { ok: true as const };
}

export async function sendAcceptedProposalEmail(input: {
  to: string;
  name: string;
  proposal: TrafficProposalView;
  device: AcceptanceDevice;
  acceptedAt: Date;
}) {
  const apiKey = process.env.REPLICATE_API_KEY;
  if (!apiKey) {
    return { error: "REPLICATE_API_KEY não configurada." } as const;
  }

  const pdf = await buildProposalPdf({
    proposal: input.proposal,
    clientName: input.name,
    clientEmail: input.to,
    device: input.device,
    acceptedAt: input.acceptedAt,
  });
  const when = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "medium",
    timeZone: "America/Sao_Paulo",
  }).format(input.acceptedAt);
  const from = process.env.EMAIL_FROM || "Lótus <onboarding@resend.dev>";
  const company = escapeHtml(input.proposal.companyName);
  const recipients = [...new Set([input.to.trim(), adminEmail].filter(Boolean))];

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: `Cópia da proposta aceita — ${input.proposal.companyName}`,
      html: `
        <div style="background:#0c0c0c;color:#ededed;font-family:Georgia,serif;padding:40px 16px;">
          <div style="max-width:520px;margin:0 auto;border:1px solid #2a2a2a;padding:32px;">
            <p style="margin:0;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#888;">Lótus</p>
            <h1 style="margin:16px 0 0;font-weight:400;font-size:26px;line-height:1.2;">Proposta aceita</h1>
            <p style="margin:20px 0 0;font-family:sans-serif;font-size:14px;line-height:1.6;color:#a1a1a1;">
              A proposta de ${company} foi aceita neste equipamento em ${escapeHtml(when)}.
              A cópia em PDF segue anexa. O registro final do arquivo traz a data, o horário e o hash do navegador.
            </p>
            <p style="margin:20px 0 0;font-family:ui-monospace,monospace;font-size:11px;line-height:1.6;color:#888;word-break:break-all;">
              ${escapeHtml(input.device.hash)}
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `proposta-${input.proposal.companyName.replace(/[^\w\-]+/g, "-").toLowerCase()}.pdf`,
          content: pdf.toString("base64"),
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    return {
      error: body?.message || "Não foi possível enviar a cópia da proposta.",
    } as const;
  }

  return { ok: true as const };
}
