import { prisma } from "@/lib/prisma";

export type BillableItem = {
  visitId: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

function periodRange(month: number, year: number) {
  return {
    periodStart: new Date(year, month - 1, 1),
    periodEnd: new Date(year, month, 1),
  };
}

export async function getUnbilledVisits(patientId: string, month: number, year: number) {
  const { periodStart, periodEnd } = periodRange(month, year);

  return prisma.visit.findMany({
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
}

type UnbilledVisit = Awaited<ReturnType<typeof getUnbilledVisits>>[number];

export function buildInvoiceItems(visits: UnbilledVisit[]): BillableItem[] {
  const items: BillableItem[] = [];
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
  return items;
}

export async function getPatientsWithUnbilledVisits(month: number, year: number) {
  const { periodStart, periodEnd } = periodRange(month, year);

  const visits = await prisma.visit.findMany({
    where: {
      status: "CONCLUIDA",
      scheduledDate: { gte: periodStart, lt: periodEnd },
      invoiceItems: { none: {} },
    },
    include: {
      patient: true,
      interventions: {
        include: { interventionType: true, materials: { include: { material: true } } },
      },
    },
    orderBy: { scheduledDate: "asc" },
  });
  type VisitWithPatient = (typeof visits)[number];

  const byPatient = new Map<string, { patient: VisitWithPatient["patient"]; visits: VisitWithPatient[] }>();
  for (const visit of visits) {
    const entry = byPatient.get(visit.patientId) ?? { patient: visit.patient, visits: [] };
    entry.visits.push(visit);
    byPatient.set(visit.patientId, entry);
  }

  return Array.from(byPatient.values())
    .map((entry) => ({
      patient: entry.patient,
      visitCount: entry.visits.length,
      items: buildInvoiceItems(entry.visits),
    }))
    .sort((a, b) => a.patient.name.localeCompare(b.patient.name));
}
