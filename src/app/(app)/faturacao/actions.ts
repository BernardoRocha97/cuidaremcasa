"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

const generateSchema = z.object({
  patientId: z.string().min(1),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
});

export async function generateInvoice(formData: FormData) {
  await requireAdmin();

  const { patientId, month, year } = generateSchema.parse({
    patientId: formData.get("patientId"),
    month: formData.get("month"),
    year: formData.get("year"),
  });

  const periodStart = new Date(year, month - 1, 1);
  const periodEnd = new Date(year, month, 1);

  const visits = await prisma.visit.findMany({
    where: {
      patientId,
      status: "CONCLUIDA",
      scheduledDate: { gte: periodStart, lt: periodEnd },
      invoiceItems: { none: {} },
    },
    include: {
      interventions: {
        include: { interventionType: true, materials: { include: { material: true } } },
      },
    },
    orderBy: { scheduledDate: "asc" },
  });

  const items: { visitId: string; description: string; quantity: number; unitPrice: number }[] =
    [];

  for (const visit of visits) {
    const dateLabel = visit.scheduledDate.toLocaleDateString("pt-PT");
    for (const intervention of visit.interventions) {
      items.push({
        visitId: visit.id,
        description: `${intervention.interventionType.name} - ${dateLabel}`,
        quantity: 1,
        unitPrice: Number(intervention.priceAtTime),
      });
      for (const usage of intervention.materials) {
        items.push({
          visitId: visit.id,
          description: `${usage.material.name} (${intervention.interventionType.name}) - ${dateLabel}`,
          quantity: usage.quantity,
          unitPrice: Number(usage.unitPriceAtUse),
        });
      }
    }
  }

  const dueDate = new Date(year, month, 10);
  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const invoice = await prisma.invoice.create({
    data: {
      patientId,
      periodMonth: month,
      periodYear: year,
      dueDate,
      totalAmount,
      items: { create: items },
    },
  });

  revalidatePath("/faturacao");
  redirect(`/faturacao/${invoice.id}`);
}

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0),
});

export async function addInvoiceItem(invoiceId: string, formData: FormData) {
  await requireAdmin();

  const { description, quantity, unitPrice } = itemSchema.parse({
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    unitPrice: formData.get("unitPrice"),
  });

  await prisma.$transaction(async (tx) => {
    await tx.invoiceItem.create({
      data: { invoiceId, description, quantity, unitPrice },
    });
    const items = await tx.invoiceItem.findMany({ where: { invoiceId } });
    const total = items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    await tx.invoice.update({ where: { id: invoiceId }, data: { totalAmount: total } });
  });

  revalidatePath(`/faturacao/${invoiceId}`);
}

export async function markInvoicePaid(invoiceId: string) {
  await requireAdmin();
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "PAGA", paidDate: new Date() },
  });
  revalidatePath("/faturacao");
  revalidatePath(`/faturacao/${invoiceId}`);
}
