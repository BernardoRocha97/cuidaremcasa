import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatDate, formatCurrency } from "@/lib/format";
import { cardClass } from "@/components/form-styles";
import Badge, { VISIT_STATUS_LABEL, VISIT_STATUS_VARIANT } from "@/components/badge";
import PageHeader from "@/components/page-header";
import VisitReportPdfButton from "./visit-report-pdf-button";

const VITAL_FIELDS: { key: string; label: string; suffix?: string }[] = [
  { key: "bloodPressure", label: "Tensão arterial" },
  { key: "glucoseLevel", label: "Glicemia" },
  { key: "temperature", label: "Temperatura" },
  { key: "heartRate", label: "Frequência cardíaca" },
  { key: "respiratoryRate", label: "Frequência respiratória" },
  { key: "oxygenSaturation", label: "Saturação O2", suffix: "%" },
  { key: "painScale", label: "Escala de dor", suffix: "/10" },
];

export default async function VisitaDetailPage({
  params,
}: PageProps<"/utentes/[id]/visitas/[visitId]">) {
  const { id, visitId } = await params;

  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      patient: true,
      nurse: true,
      record: true,
      interventions: {
        include: { interventionType: true, materials: { include: { material: true } } },
        orderBy: { createdAt: "asc" },
      },
      nursingDiagnoses: { include: { nursingDiagnosis: true }, orderBy: { id: "asc" } },
      nursingInterventions: { include: { nursingIntervention: true }, orderBy: { id: "asc" } },
      photos: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!visit || visit.patientId !== id) notFound();

  const record = visit.record;
  const weight = record?.weight ? Number(record.weight) : null;
  const height = record?.height ? Number(record.height) : null;
  const bmi = weight && height ? weight / (height / 100) ** 2 : null;

  const vitalsFilled = VITAL_FIELDS.filter(
    (f) => record && (record as unknown as Record<string, unknown>)[f.key]
  );

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link
          href={`/utentes/${id}`}
          className="mb-3 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
        >
          <ArrowLeft size={14} /> {visit.patient.name}
        </Link>
        <PageHeader
          title={`Visita de ${formatDateTime(visit.scheduledDate)}`}
          description={
            <Badge variant={VISIT_STATUS_VARIANT[visit.status]}>
              {VISIT_STATUS_LABEL[visit.status]}
            </Badge>
          }
          action={
            <VisitReportPdfButton
              visit={{
                patientName: visit.patient.name,
                scheduledDate: formatDateTime(visit.scheduledDate),
                nurseName: visit.nurse?.name ?? null,
                status: VISIT_STATUS_LABEL[visit.status],
                interventions: visit.interventions.map((i) => ({
                  name: i.interventionType.name,
                  price: Number(i.priceAtTime),
                  materials: i.materials.map((m) => ({
                    name: m.material.name,
                    quantity: m.quantity,
                    unit: m.material.unit,
                  })),
                })),
                nursingDiagnoses: visit.nursingDiagnoses.map((d) => ({
                  name: d.nursingDiagnosis.name,
                  notes: d.notes,
                })),
                nursingInterventions: visit.nursingInterventions.map((i) => ({
                  name: i.nursingIntervention.name,
                  notes: i.notes,
                })),
                vitals: vitalsFilled.map((f) => ({
                  label: f.label,
                  value: `${(record as unknown as Record<string, unknown>)[f.key]}${f.suffix ?? ""}`,
                })),
                weight: weight ? `${weight} kg` : null,
                height: height ? `${height} cm` : null,
                bmi: bmi ? bmi.toFixed(1) : null,
                proceduresPerformed: record?.proceduresPerformed ?? null,
                observations: record?.observations ?? null,
                signedByName: record?.signedByName ?? null,
                signedAt: record?.signedAt ? formatDateTime(record.signedAt) : null,
                photoIds: visit.photos.map((p) => p.id),
                visitNotes: visit.notes,
              }}
            />
          }
        />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Intervenções e materiais usados
        </h2>
        <div className="space-y-3">
          {visit.interventions.map((intervention) => (
            <div key={intervention.id} className={cardClass}>
              <div className="border-b border-stone-100 px-4 py-3">
                <p className="font-medium text-stone-900">{intervention.interventionType.name}</p>
                <p className="text-xs text-stone-400">
                  Preço base: {formatCurrency(intervention.priceAtTime.toString())}
                </p>
              </div>
              <ul className="divide-y divide-stone-100 text-sm">
                {intervention.materials.map((m) => (
                  <li key={m.id} className="flex justify-between px-4 py-2 text-stone-600">
                    <span>{m.material.name}</span>
                    <span>
                      {m.quantity} {m.material.unit}
                    </span>
                  </li>
                ))}
                {intervention.materials.length === 0 && (
                  <li className="px-4 py-3 text-center text-stone-400">Sem materiais.</li>
                )}
              </ul>
            </div>
          ))}
          {visit.interventions.length === 0 && (
            <p className={`px-4 py-6 text-center text-stone-400 ${cardClass}`}>
              Sem intervenções registadas.
            </p>
          )}
        </div>
      </section>

      {(visit.nursingDiagnoses.length > 0 || visit.nursingInterventions.length > 0) && (
        <section className="grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-medium text-stone-700">Diagnósticos de enfermagem</h2>
            <div className={cardClass}>
              <ul className="divide-y divide-stone-100 text-sm">
                {visit.nursingDiagnoses.map((d) => (
                  <li key={d.id} className="px-4 py-2.5">
                    <p className="text-stone-800">{d.nursingDiagnosis.name}</p>
                    {d.notes && <p className="text-xs text-stone-400">{d.notes}</p>}
                  </li>
                ))}
                {visit.nursingDiagnoses.length === 0 && (
                  <li className="px-4 py-3 text-center text-stone-400">Nenhum.</li>
                )}
              </ul>
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-medium text-stone-700">Intervenções de enfermagem</h2>
            <div className={cardClass}>
              <ul className="divide-y divide-stone-100 text-sm">
                {visit.nursingInterventions.map((i) => (
                  <li key={i.id} className="px-4 py-2.5">
                    <p className="text-stone-800">{i.nursingIntervention.name}</p>
                    {i.notes && <p className="text-xs text-stone-400">{i.notes}</p>}
                  </li>
                ))}
                {visit.nursingInterventions.length === 0 && (
                  <li className="px-4 py-3 text-center text-stone-400">Nenhuma.</li>
                )}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Registo clínico
        </h2>
        {record ? (
          <div className={`space-y-5 p-6 ${cardClass}`}>
            {vitalsFilled.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Sinais vitais
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {vitalsFilled.map((f) => (
                    <div key={f.key}>
                      <p className="text-xs text-stone-400">{f.label}</p>
                      <p className="text-sm text-stone-800">
                        {(record as unknown as Record<string, unknown>)[f.key] as string}
                        {f.suffix}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(weight || height) && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Peso e altura
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {weight && (
                    <div>
                      <p className="text-xs text-stone-400">Peso</p>
                      <p className="text-sm text-stone-800">{weight} kg</p>
                    </div>
                  )}
                  {height && (
                    <div>
                      <p className="text-xs text-stone-400">Altura</p>
                      <p className="text-sm text-stone-800">{height} cm</p>
                    </div>
                  )}
                  {bmi && (
                    <div>
                      <p className="text-xs text-stone-400">IMC</p>
                      <p className="text-sm text-stone-800">{bmi.toFixed(1)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {record.proceduresPerformed && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Procedimentos realizados
                </p>
                <p className="whitespace-pre-wrap text-sm text-stone-700">
                  {record.proceduresPerformed}
                </p>
              </div>
            )}

            {record.observations && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Nota geral da visita
                </p>
                <p className="whitespace-pre-wrap text-sm text-stone-700">{record.observations}</p>
              </div>
            )}

            <p className="text-xs text-stone-400">
              Assinado por {record.signedByName} em {formatDateTime(record.signedAt)}
            </p>
          </div>
        ) : (
          <p className={`px-4 py-6 text-center text-stone-400 ${cardClass}`}>
            Esta visita ainda não tem registo clínico.
          </p>
        )}
      </section>

      {visit.photos.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Fotos
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {visit.photos.map((photo) => (
              <div key={photo.id} className="overflow-hidden rounded-lg border border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/photos/${photo.id}`}
                  alt={photo.caption ?? "Foto da visita"}
                  className="h-32 w-full object-cover"
                />
                {photo.caption && (
                  <p className="bg-stone-900/70 px-2 py-1 text-xs text-white">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
