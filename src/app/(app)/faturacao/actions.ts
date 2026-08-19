"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { getUnbilledVisits, getPatientsWithUnbilledVisits, buildInvoiceItems } from "@/lib/billing";

const periodSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
});

export async function generateInvoice(formData: FormData) {
  await requireAdmin();

  const { patientId, month, year } = z
    .object({ patientId: z.string().min(1) })
    .extend(periodSchema.shape)
    .parse({
      patientId: formData.get("patientId"),
      month: formData.get("month"),
      year: formData.get("year"),
    });

  const visits = await getUnbilledVisits(patientId, month, year);
  const items = buildInvoiceItems(visits);

  if (items.length === 0) {
    throw new Error("Não há visitas concluídas por faturar neste período para este utente.");
  }

  const dueDate = new Date(year, month, 10);
  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const invoice = await prisma.invoice.create({
    data: { patientId, periodMonth: month, periodYear: year, dueDate, totalAmount, items: { create: items } },
  });

  revalidatePath("/faturacao");
  redirect(`/faturacao/${invoice.id}`);
}

export async function generateInvoicesForMonth(formData: FormData) {
  await requireAdmin();

  const { month, year } = periodSchema.parse({
    month: formData.get("month"),
    year: formData.get("year"),
  });

  const patientsWithVisits = await getPatientsWithUnbilledVisits(month, year);
  const dueDate = new Date(year, month, 10);

  let created = 0;
  for (const entry of patientsWithVisits) {
    if (entry.items.length === 0) continue;
    const totalAmount = entry.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    await prisma.invoice.create({
      data: {
        patientId: entry.patient.id,
        periodMonth: month,
        periodYear: year,
        dueDate,
        totalAmount,
        items: { create: entry.items },
      },
    });
    created += 1;
  }

  revalidatePath("/faturacao");
  redirect(`/faturacao?geradas=${created}`);
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

export async function deleteInvoice(invoiceId: string) {
  await requireAdmin();

  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
  if (invoice.status === "PAGA") {
    throw new Error("Não é possível eliminar uma fatura já paga.");
  }

  await prisma.invoice.delete({ where: { id: invoiceId } });
  revalidatePath("/faturacao");
  redirect("/faturacao");
}
