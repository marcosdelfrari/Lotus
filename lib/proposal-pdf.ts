import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { AcceptanceDevice } from "@/lib/acceptance";
import { formatCurrency } from "@/lib/format";
import { proposalTotalServices, type TrafficProposalView } from "@/lib/proposal-types";

function latin(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[^\u0000-\u00FF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function buildProposalPdf(input: {
  proposal: TrafficProposalView;
  clientName: string;
  clientEmail: string;
  device: AcceptanceDevice;
  acceptedAt: Date;
}) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  function newPage() {
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }

  function ensure(height: number) {
    if (y - height < margin) newPage();
  }

  function write(text: string, size: number, face = font, color = rgb(0.08, 0.08, 0.08)) {
    const lines = wrap(latin(text), face, size, maxWidth);
    for (const line of lines) {
      ensure(size + 6);
      page.drawText(line, { x: margin, y, size, font: face, color });
      y -= size + 5;
    }
  }

  function gap(amount = 14) {
    y -= amount;
  }

  const proposal = input.proposal;
  const when = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "medium",
    timeZone: "America/Sao_Paulo",
  }).format(input.acceptedAt);

  write("LOTUS", 10, bold, rgb(0.4, 0.4, 0.4));
  gap(8);
  write(proposal.title || "Gestao de trafego pago", 22, bold);
  gap(6);
  write(`Preparado para ${proposal.companyName}`, 12);
  write(`${input.clientName} · ${input.clientEmail}`, 11, font, rgb(0.25, 0.25, 0.25));
  gap(18);

  if (proposal.intro) {
    write("Apresentacao", 13, bold);
    gap(4);
    write(proposal.intro, 11);
    gap(16);
  }

  if (proposal.goals) {
    write("Diretriz", 13, bold);
    gap(4);
    write(proposal.goals, 11);
    gap(16);
  }

  if (proposal.scope.length) {
    write("Escopo", 13, bold);
    gap(4);
    proposal.scope.forEach((line, index) => write(`${index + 1}. ${line}`, 11));
    gap(16);
  }

  if (proposal.services.length) {
    write("Servicos", 13, bold);
    gap(4);
    for (const service of proposal.services) {
      write(`${service.name} — ${formatCurrency(service.value)}`, 11, bold);
      if (service.description) write(service.description, 10, font, rgb(0.25, 0.25, 0.25));
      gap(4);
    }
    write(`Mensalidade: ${formatCurrency(proposalTotalServices(proposal))}`, 12, bold);
    gap(16);
  }

  if (proposal.implementationPlan.length) {
    write("Implantacao", 13, bold);
    gap(4);
    proposal.implementationPlan.forEach((step, index) => {
      write(`${index + 1}. ${step.title}`, 11, bold);
      if (step.description) write(step.description, 10);
      gap(4);
    });
    if (proposal.deadlineDays) write(`Prazo estimado: ${proposal.deadlineDays} dias`, 11);
    gap(16);
  }

  write("Investimento", 13, bold);
  gap(4);
  write(
    `Taxa de implantacao: ${
      proposal.setupFee ? formatCurrency(proposal.setupFee) : "Isento"
    }`,
    11,
  );
  write(
    `Verba de midia sugerida: ${
      proposal.adBudgetSuggestion
        ? `${formatCurrency(proposal.adBudgetSuggestion)} / mes`
        : "Sob medida"
    }`,
    11,
  );
  gap(8);
  proposal.conditions.forEach((line, index) => write(`${index + 1}. ${line}`, 10));
  gap(16);

  if (proposal.terms.length) {
    write("Termos", 13, bold);
    gap(4);
    proposal.terms.forEach((line, index) => write(`${index + 1}. ${line}`, 10));
    gap(20);
  }

  ensure(160);
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 0.6,
    color: rgb(0.75, 0.75, 0.75),
  });
  gap(16);
  write("Aceite digital", 13, bold);
  gap(6);
  write(
    `Proposta aceita neste equipamento em ${when}. O registro abaixo identifica o navegador usado no aceite.`,
    11,
  );
  gap(8);
  write(`Data e horario: ${when}`, 11, bold);
  write(`Hash do navegador: ${input.device.hash}`, 9);
  write(`Navegador: ${input.device.userAgent}`, 9);
  write(
    `Idioma ${input.device.language} · Fuso ${input.device.timezone} · Tela ${input.device.screen} · Plataforma ${input.device.platform}`,
    9,
  );

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

function wrap(
  text: string,
  face: { widthOfTextAtSize: (text: string, size: number) => number },
  size: number,
  maxWidth: number,
) {
  const words = text.split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (face.widthOfTextAtSize(next, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}
