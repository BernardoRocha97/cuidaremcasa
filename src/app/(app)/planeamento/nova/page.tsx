import { prisma } from "@/lib/prisma";
import VisitForm from "../visit-form";
import { createVisit } from "../actions";
import PageHeader from "@/components/page-header";

export default async function NovaVisitaPage({
  searchParams,
}: PageProps<"/planeamento/nova">) {
  const params = await searchParams;
  const date = typeof params.date === "string" ? params.date : undefined;

  const [patients, nurses, interventionTypes] = await Promise.all([
    prisma.patient.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: "ENFERMEIRO", active: true },
      orderBy: { name: "asc" },
    }),
    prisma.interventionType.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const createVisitAction = createVisit.bind(null, "/planeamento");

  return (
    <div className="max-w-2xl">
      <PageHeader title="Nova visita" />
      <VisitForm
        action={createVisitAction}
        patients={patients}
        nurses={nurses}
        interventionTypes={interventionTypes.map((t) => ({
          id: t.id,
          name: t.name,
          basePrice: t.basePrice.toString(),
        }))}
        defaultValues={{ scheduledDate: date, scheduledTime: "09:00" }}
        submitLabel="Agendar visita"
      />
    </div>
  );
}
