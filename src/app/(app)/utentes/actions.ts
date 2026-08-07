"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

const OPTIONAL_TEXT_FIELDS = [
  "address",
  "phone",
  "emergencyContact",
  "nationalId",
  "notes",
  "primaryDoctor",
  "allergies",
  "currentMedication",
  "medicalConditions",
  "caregiverName",
  "caregiverPhone",
  "caregiverRelationship",
  "billingName",
  "billingNif",
  "billingAddress",
] as const;

const patientSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  birthDate: z.string().optional(),
  ...Object.fromEntries(OPTIONAL_TEXT_FIELDS.map((field) => [field, z.string().optional()])),
});

function parsePatientForm(formData: FormData) {
  const raw: Record<string, string | undefined> = {
    name: formData.get("name") as string,
    birthDate: (formData.get("birthDate") as string) || undefined,
  };
  for (const field of OPTIONAL_TEXT_FIELDS) {
    raw[field] = (formData.get(field) as string) || undefined;
  }
  return patientSchema.parse(raw);
}

export async function createPatient(formData: FormData) {
  await requireAdmin();
  const { birthDate, ...data } = parsePatientForm(formData);

  const patient = await prisma.patient.create({
    data: {
      ...data,
      birthDate: birthDate ? new Date(birthDate) : null,
    },
  });

  revalidatePath("/utentes");
  redirect(`/utentes/${patient.id}`);
}

export async function updatePatient(patientId: string, formData: FormData) {
  await requireAdmin();
  const { birthDate, ...data } = parsePatientForm(formData);

  await prisma.patient.update({
    where: { id: patientId },
    data: {
      ...data,
      birthDate: birthDate ? new Date(birthDate) : null,
    },
  });

  revalidatePath("/utentes");
  revalidatePath(`/utentes/${patientId}`);
}

export async function setPatientActive(patientId: string, active: boolean) {
  await requireAdmin();
  await prisma.patient.update({ where: { id: patientId }, data: { active } });
  revalidatePath("/utentes");
  revalidatePath(`/utentes/${patientId}`);
}
