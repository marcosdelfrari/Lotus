import { prisma } from "@/lib/prisma";
import { normalizeWhatsapp } from "@/lib/whatsapp";

export async function getInterestForUser(userId: string) {
  return prisma.interest.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listInterests() {
  return prisma.interest.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createInterest(input: {
  userId: string;
  name: string;
  email: string;
  whatsapp: string;
}) {
  const existing = await getInterestForUser(input.userId);
  if (existing) return { interest: existing } as const;

  const whatsapp = normalizeWhatsapp(input.whatsapp);
  if (!whatsapp) {
    return { error: "Informe um WhatsApp com DDD." } as const;
  }

  const interest = await prisma.interest.create({
    data: {
      userId: input.userId,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      whatsapp,
    },
  });
  return { interest } as const;
}
