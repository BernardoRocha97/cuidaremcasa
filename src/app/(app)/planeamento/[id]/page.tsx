import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dateKey } from "@/lib/calendar";
import VisitForm from "../visit-form";
import { updateVisit, cancelVisit } from "../actions";
import { buttonStyles } from "@/components/button-styles";
import PageHeader from "@/components/page-header";

export default async function EditarVisitaPage({ params }: PageProps<"/planeamento/[id]">) {
  const { id } = await params;
  const session = await auth();

  const [visit, patients, nurses, interventionTypes] = await Promise.all([
    prisma.visit.findUnique({ where: { id }, include: { interventions: true } }),
    prisma.patient.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: "ENFERMEIRO", active: true },
      orderBy: { name: "asc" },
    }),
    prisma.interventionType.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  if (!visit) notFound();
  if (session?.user.role !== "ADMIN" && visit.nurseId !== session?.user.id) {
    notFound();
  }

  const updateVisitAction = updateVisit.bind(null, visit.id);
  const cancelVisitAction = cancelVisit.bind(null, visit.id);

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Editar visita"
        action={
          visit.status !== "CANCELADA" && (
            <form action={cancelVisitAction}>
              <button type="submit" className={buttonStyles.danger}>
                Cancelar visita
              </button>
            </form>
          )
        }
      />
      {visit.status !== "AGENDADA" && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Esta visita já não está agendada — as intervenções selecionadas já não podem ser
          alteradas aqui.
        </p>
      )}
      <VisitForm
        action={updateVisitAction}
        patients={patients}
        nurses={nurses}
        interventionTypes={interventionTypes.map((t) => ({
          id: t.id,
          name: t.name,
          basePrice: t.basePrice.toString(),
        }))}
        defaultValues={{
          patientId: visit.patientId,
          nurseId: visit.nurseId ?? undefined,
          scheduledDate: dateKey(visit.scheduledDate),
          scheduledTime: visit.scheduledDate.toTimeString().slice(0, 5),
          notes: visit.notes ?? undefined,
          interventionTypeIds: visit.interventions.map((i) => i.interventionTypeId),
        }}
        submitLabel="Guardar alterações"
      />
    </div>
  );
}
