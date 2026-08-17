"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import type { Prisma } from "@/generated/prisma/client";

type Tx = Prisma.TransactionClient;

async function createVisitIntervention(tx: Tx, visitId: string, interventionTypeId: string) {
  const interventionType = await tx.interventionType.findUniqueOrThrow({
    where: { id: interventionTypeId },
    include: { defaultMaterials: { include: { material: true } } },
  });

  await tx.visitIntervention.create({
    data: {
      visitId,
      interventionTypeId,
      priceAtTime: interventionType.basePrice,
      materials: {
        create: interventionType.defaultMaterials.map((link) => ({
          materialId: link.materialId,
          quantity: link.defaultQuantity,
          unitPriceAtUse: link.material.unitPrice,
        })),
      },
    },
  });
}

const visitSchema = z.object({
  patientId: z.string().min(1, "Selecione um utente"),
  nurseId: z.string().optional(),
  scheduledDate: z.string().min(1, "Data obrigatória"),
  scheduledTime: z.string().min(1, "Hora obrigatória"),
  notes: z.string().optional(),
});

function parseVisitForm(formData: FormData) {
  const parsed = visitSchema.parse({
    patientId: formData.get("patientId"),
    nurseId: (formData.get("nurseId") as string) || undefined,
    scheduledDate: formData.get("scheduledDate"),
    scheduledTime: formData.get("scheduledTime"),
    notes: (formData.get("notes") as string) || undefined,
  });

  const interventionTypeIds = formData.getAll("interventionTypeIds").map(String).filter(Boolean);

  return {
    patientId: parsed.patientId,
    nurseId: parsed.nurseId || null,
    scheduledDate: new Date(`${parsed.scheduledDate}T${parsed.scheduledTime}`),
    notes: parsed.notes ?? null,
    interventionTypeIds,
  };
}

export async function createVisit(redirectTo: string, formData: FormData) {
  await requireSession();
  const { interventionTypeIds, ...data } = parseVisitForm(formData);

  await prisma.$transaction(async (tx) => {
    const visit = await tx.visit.create({ data });
    for (const interventionTypeId of interventionTypeIds) {
      await createVisitIntervention(tx, visit.id, interventionTypeId);
    }
  });

  revalidatePath("/planeamento");
  redirect(redirectTo);
}

export async function updateVisit(visitId: string, formData: FormData) {
  await assertVisitAccess(visitId);
  const { interventionTypeIds, ...data } = parseVisitForm(formData);

  await prisma.$transaction(async (tx) => {
    const visit = await tx.visit.update({ where: { id: visitId }, data });

    if (visit.status === "AGENDADA") {
      await tx.visitIntervention.deleteMany({ where: { visitId } });
      for (const interventionTypeId of interventionTypeIds) {
        await createVisitIntervention(tx, visitId, interventionTypeId);
      }
    }
  });

  revalidatePath("/planeamento");
  redirect("/planeamento");
}

export async function cancelVisit(visitId: string) {
  await assertVisitAccess(visitId);
  await prisma.visit.update({ where: { id: visitId }, data: { status: "CANCELADA" } });
  revalidatePath("/planeamento");
}

function optionalInt(formData: FormData, key: string) {
  const raw = formData.get(key) as string;
  if (!raw) return null;
  const value = parseInt(raw, 10);
  return Number.isNaN(value) ? null : value;
}

function optionalDecimal(formData: FormData, key: string) {
  const raw = formData.get(key) as string;
  if (!raw) return null;
  const value = parseFloat(raw);
  return Number.isNaN(value) ? null : value;
}

function buildRecordData(formData: FormData, signedByName: string) {
  return {
    bloodPressure: (formData.get("bloodPressure") as string) || null,
    glucoseLevel: (formData.get("glucoseLevel") as string) || null,
    temperature: (formData.get("temperature") as string) || null,
    heartRate: (formData.get("heartRate") as string) || null,
    respiratoryRate: optionalInt(formData, "respiratoryRate"),
    oxygenSaturation: optionalInt(formData, "oxygenSaturation"),
    painScale: optionalInt(formData, "painScale"),
    weight: optionalDecimal(formData, "weight"),
    height: optionalDecimal(formData, "height"),
    proceduresPerformed: (formData.get("proceduresPerformed") as string) || null,
    observations: (formData.get("observations") as string) || null,
    signedByName,
  };
}

export async function saveVisitRecord(visitId: string, formData: FormData) {
  const session = await requireSession();
  const visit = await assertVisitAccess(visitId);

  const record = buildRecordData(formData, session.user.name ?? "Enfermeiro");

  await prisma.visitRecord.upsert({
    where: { visitId },
    create: { visitId, ...record },
    update: record,
  });

  revalidatePath(`/agenda/${visitId}/concluir`);
  revalidatePath(`/utentes/${visit.patientId}`);
}

export async function completeVisit(visitId: string, formData: FormData) {
  const session = await requireSession();
  await assertVisitAccess(visitId);

  const record = buildRecordData(formData, session.user.name ?? "Enfermeiro");

  await prisma.$transaction([
    prisma.visit.update({ where: { id: visitId }, data: { status: "CONCLUIDA" } }),
    prisma.visitRecord.upsert({
      where: { visitId },
      create: { visitId, ...record },
      update: record,
    }),
  ]);

  revalidatePath("/agenda");
  revalidatePath("/planeamento");
  redirect("/agenda");
}

export async function markVisitMissed(visitId: string) {
  const session = await requireSession();
  const visit = await prisma.visit.findUniqueOrThrow({ where: { id: visitId } });
  if (session.user.role !== "ADMIN" && visit.nurseId !== session.user.id) {
    throw new Error("Não tem permissão para alterar esta visita");
  }
  await prisma.visit.update({ where: { id: visitId }, data: { status: "FALTA" } });
  revalidatePath("/agenda");
  revalidatePath("/planeamento");
}

// Gestão de intervenções/materiais reais de uma visita (feita pelo enfermeiro
// ao concluir, a partir do modelo predefinido do catálogo).

async function assertVisitAccess(visitId: string) {
  const session = await requireSession();
  const visit = await prisma.visit.findUniqueOrThrow({ where: { id: visitId } });
  if (session.user.role !== "ADMIN" && visit.nurseId !== session.user.id) {
    throw new Error("Não tem permissão para alterar esta visita");
  }
  return visit;
}

export async function addVisitInterventionAction(visitId: string, formData: FormData) {
  await assertVisitAccess(visitId);
  const interventionTypeId = formData.get("interventionTypeId") as string;
  if (!interventionTypeId) return;

  await prisma.$transaction(async (tx) => {
    await createVisitIntervention(tx, visitId, interventionTypeId);
  });

  revalidatePath(`/agenda/${visitId}/concluir`);
}

export async function removeVisitIntervention(visitId: string, visitInterventionId: string) {
  await assertVisitAccess(visitId);
  await prisma.visitIntervention.delete({ where: { id: visitInterventionId } });
  revalidatePath(`/agenda/${visitId}/concluir`);
}

const materialUseSchema = z.object({
  materialId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
});

export async function addVisitInterventionMaterial(
  visitId: string,
  visitInterventionId: string,
  formData: FormData
) {
  await assertVisitAccess(visitId);
  const { materialId, quantity } = materialUseSchema.parse({
    materialId: formData.get("materialId"),
    quantity: formData.get("quantity"),
  });

  const material = await prisma.material.findUniqueOrThrow({ where: { id: materialId } });

  await prisma.visitInterventionMaterial.create({
    data: {
      visitInterventionId,
      materialId,
      quantity,
      unitPriceAtUse: material.unitPrice,
    },
  });

  revalidatePath(`/agenda/${visitId}/concluir`);
}

export async function updateVisitInterventionMaterialQty(
  visitId: string,
  usageId: string,
  formData: FormData
) {
  await assertVisitAccess(visitId);
  const quantity = z.coerce.number().int().min(1).parse(formData.get("quantity"));
  await prisma.visitInterventionMaterial.update({ where: { id: usageId }, data: { quantity } });
  revalidatePath(`/agenda/${visitId}/concluir`);
}

export async function removeVisitInterventionMaterial(visitId: string, usageId: string) {
  await assertVisitAccess(visitId);
  await prisma.visitInterventionMaterial.delete({ where: { id: usageId } });
  revalidatePath(`/agenda/${visitId}/concluir`);
}

// Fotos da visita (ex: feridas). Guardadas na base de dados; para produção
// considerar mover para um serviço de blob storage.

const MAX_PHOTO_SIZE = 8 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function addVisitPhoto(visitId: string, formData: FormData) {
  await assertVisitAccess(visitId);

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) throw new Error("Escolhe uma foto para enviar");
  if (file.size > MAX_PHOTO_SIZE) throw new Error("A foto não pode exceder 8MB");
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    throw new Error("Formato de imagem não suportado");
  }

  const caption = (formData.get("caption") as string) || null;
  const buffer = Buffer.from(await file.arrayBuffer());

  await prisma.visitPhoto.create({
    data: { visitId, data: buffer, mimeType: file.type, caption },
  });

  revalidatePath(`/agenda/${visitId}/concluir`);
}

export async function removeVisitPhoto(visitId: string, photoId: string) {
  await assertVisitAccess(visitId);
  await prisma.visitPhoto.delete({ where: { id: photoId } });
  revalidatePath(`/agenda/${visitId}/concluir`);
}
