"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

// Materiais

const materialSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  unit: z.string().min(1).default("un"),
  unitPrice: z.coerce.number().min(0),
});

export async function createMaterial(formData: FormData) {
  await requireAdmin();
  const data = materialSchema.parse({
    name: formData.get("name"),
    unit: formData.get("unit") || "un",
    unitPrice: formData.get("unitPrice"),
  });
  await prisma.material.create({ data });
  revalidatePath("/catalogo");
  redirect("/catalogo");
}

export async function updateMaterial(materialId: string, formData: FormData) {
  await requireAdmin();
  const data = materialSchema.parse({
    name: formData.get("name"),
    unit: formData.get("unit") || "un",
    unitPrice: formData.get("unitPrice"),
  });
  await prisma.material.update({ where: { id: materialId }, data });
  revalidatePath("/catalogo");
  revalidatePath(`/catalogo/materiais/${materialId}`);
}

export async function setMaterialActive(materialId: string, active: boolean) {
  await requireAdmin();
  await prisma.material.update({ where: { id: materialId }, data: { active } });
  revalidatePath("/catalogo");
  revalidatePath(`/catalogo/materiais/${materialId}`);
}

// Intervenções

const interventionSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  basePrice: z.coerce.number().min(0),
});

export async function createInterventionType(formData: FormData) {
  await requireAdmin();
  const data = interventionSchema.parse({
    name: formData.get("name"),
    basePrice: formData.get("basePrice"),
  });
  const intervention = await prisma.interventionType.create({ data });
  revalidatePath("/catalogo");
  redirect(`/catalogo/intervencoes/${intervention.id}`);
}

export async function updateInterventionType(interventionTypeId: string, formData: FormData) {
  await requireAdmin();
  const data = interventionSchema.parse({
    name: formData.get("name"),
    basePrice: formData.get("basePrice"),
  });
  await prisma.interventionType.update({ where: { id: interventionTypeId }, data });
  revalidatePath("/catalogo");
  revalidatePath(`/catalogo/intervencoes/${interventionTypeId}`);
}

export async function setInterventionTypeActive(interventionTypeId: string, active: boolean) {
  await requireAdmin();
  await prisma.interventionType.update({ where: { id: interventionTypeId }, data: { active } });
  revalidatePath("/catalogo");
  revalidatePath(`/catalogo/intervencoes/${interventionTypeId}`);
}

const defaultMaterialSchema = z.object({
  materialId: z.string().min(1),
  defaultQuantity: z.coerce.number().int().min(1),
});

export async function addDefaultMaterial(interventionTypeId: string, formData: FormData) {
  await requireAdmin();
  const data = defaultMaterialSchema.parse({
    materialId: formData.get("materialId"),
    defaultQuantity: formData.get("defaultQuantity"),
  });

  await prisma.interventionMaterial.upsert({
    where: {
      interventionTypeId_materialId: {
        interventionTypeId,
        materialId: data.materialId,
      },
    },
    create: { interventionTypeId, ...data },
    update: { defaultQuantity: data.defaultQuantity },
  });

  revalidatePath(`/catalogo/intervencoes/${interventionTypeId}`);
}

export async function removeDefaultMaterial(interventionTypeId: string, linkId: string) {
  await requireAdmin();
  await prisma.interventionMaterial.delete({ where: { id: linkId } });
  revalidatePath(`/catalogo/intervencoes/${interventionTypeId}`);
}
