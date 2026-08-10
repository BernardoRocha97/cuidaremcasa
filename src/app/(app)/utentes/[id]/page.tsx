import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatCurrency } from "@/lib/format";
import { interventionsLabel } from "@/lib/visit-display";
import PatientForm from "../patient-form";
import { updatePatient, setPatientActive } from "../actions";
import { cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";
import Badge, {
  VISIT_STATUS_LABEL,
  VISIT_STATUS_VARIANT,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_VARIANT,
} from "@/components/badge";
import PageHeader from "@/components/page-header";

export default async function UtenteDetailPage({ params }: PageProps<"/utentes/[id]">) {
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      visits: {
        orderBy: { scheduledDate: "desc" },
        include: { nurse: true, record: true, interventions: { include: { interventionType: true } } },
      },
      invoices: { orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }] },
    },
  });

  if (!patient) notFound();

  const updateWithId = updatePatient.bind(null, patient.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title={patient.name}
        description={
          <Badge variant={patient.active ? "success" : "neutral"}>
            {patient.active ? "Ativo" : "Inativo"}
          </Badge>
        }
        action={
          <form action={setPatientActive.bind(null, patient.id, !patient.active)}>
            <button type="submit" className={buttonStyles.secondary}>
              {patient.active ? "Marcar inativo" : "Marcar ativo"}
            </button>
          </form>
        }
      />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Dados do utente
        </h2>
        <PatientForm
          action={updateWithId}
          submitLabel="Guardar alterações"
          defaultValues={{
            name: patient.name,
            birthDate: patient.birthDate
              ? new Date(patient.birthDate).toISOString().slice(0, 10)
              : "",
            address: patient.address ?? "",
            phone: patient.phone ?? "",
            emergencyContact: patient.emergencyContact ?? "",
            nationalId: patient.nationalId ?? "",
            notes: patient.notes ?? "",
            primaryDoctor: patient.primaryDoctor ?? "",
            allergies: patient.allergies ?? "",
            currentMedication: patient.currentMedication ?? "",
            medicalConditions: patient.medicalConditions ?? "",
            caregiverName: patient.caregiverName ?? "",
            caregiverPhone: patient.caregiverPhone ?? "",
            caregiverRelationship: patient.caregiverRelationship ?? "",
            billingName: patient.billingName ?? "",
            billingNif: patient.billingNif ?? "",
            billingAddress: patient.billingAddress ?? "",
          }}
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Histórico de visitas
        </h2>
        <div className={`overflow-x-auto ${cardClass}`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Enfermeiro</th>
                <th className="px-4 py-3 font-medium">Intervenções</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Registo clínico</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {patient.visits.map((visit) => (
                <tr key={visit.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">{formatDateTime(visit.scheduledDate)}</td>
                  <td className="px-4 py-3 text-stone-600">{visit.nurse?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {interventionsLabel(visit.interventions)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={VISIT_STATUS_VARIANT[visit.status]}>
                      {VISIT_STATUS_LABEL[visit.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {visit.record ? (
                      <span className="text-stone-600">
                        {visit.record.observations
                          ? visit.record.observations.slice(0, 60)
                          : "Registado"}
                      </span>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/utentes/${patient.id}/visitas/${visit.id}`}
                      className="text-emerald-700 hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
              {patient.visits.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                    Sem visitas registadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Faturas
        </h2>
        <div className={`overflow-x-auto ${cardClass}`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Período</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {patient.invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-4 py-3">
                    {invoice.periodMonth.toString().padStart(2, "0")}/{invoice.periodYear}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(invoice.totalAmount.toString())}</td>
                  <td className="px-4 py-3">
                    <Badge variant={INVOICE_STATUS_VARIANT[invoice.status]}>
                      {INVOICE_STATUS_LABEL[invoice.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/faturacao/${invoice.id}`}
                      className="text-emerald-700 hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
              {patient.invoices.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-stone-400">
                    Sem faturas emitidas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
