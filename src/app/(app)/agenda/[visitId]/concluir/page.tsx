import { notFound } from "next/navigation";
import { Plus, Check, X, Navigation } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatCurrency } from "@/lib/format";
import { wazeUrl } from "@/lib/maps";
import {
  completeVisit,
  saveVisitRecord,
  addVisitInterventionAction,
  removeVisitIntervention,
  addVisitInterventionMaterial,
  updateVisitInterventionMaterialQty,
  removeVisitInterventionMaterial,
  addVisitPhoto,
  removeVisitPhoto,
} from "../../../planeamento/actions";
import { inputClass, labelClass, cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";
import PageHeader from "@/components/page-header";
import PhotosSection from "./photos-section";

export default async function ConcluirVisitaPage({
  params,
}: PageProps<"/agenda/[visitId]/concluir">) {
  const { visitId } = await params;
  const session = await auth();

  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      patient: true,
      record: true,
      interventions: {
        include: { interventionType: true, materials: { include: { material: true } } },
        orderBy: { createdAt: "asc" },
      },
      photos: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!visit) notFound();
  if (session?.user.role !== "ADMIN" && visit.nurseId !== session?.user.id) {
    notFound();
  }

  const [allMaterials, allInterventionTypes] = await Promise.all([
    prisma.material.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.interventionType.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const usedInterventionTypeIds = new Set(visit.interventions.map((i) => i.interventionTypeId));
  const availableInterventionTypes = allInterventionTypes.filter(
    (t) => !usedInterventionTypeIds.has(t.id)
  );

  const weight = visit.record?.weight ? Number(visit.record.weight) : null;
  const height = visit.record?.height ? Number(visit.record.height) : null;
  const bmi = weight && height ? weight / (height / 100) ** 2 : null;

  const completeVisitAction = completeVisit.bind(null, visit.id);
  const saveVisitRecordAction = saveVisitRecord.bind(null, visit.id);
  const addInterventionAction = addVisitInterventionAction.bind(null, visit.id);
  const addPhotoAction = addVisitPhoto.bind(null, visit.id);
  const removePhotoAction = removeVisitPhoto.bind(null, visit.id);

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader
        title="Concluir visita"
        description={`${visit.patient.name} · ${formatDateTime(visit.scheduledDate)}${
          visit.patient.address ? ` · ${visit.patient.address}` : ""
        }`}
        action={
          visit.patient.address && (
            <a
              href={wazeUrl(visit.patient.address)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles.secondary}
            >
              <Navigation size={16} /> Waze
            </a>
          )
        }
      />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Intervenções e materiais usados
        </h2>

        {visit.interventions.map((intervention) => {
          const usedMaterialIds = new Set(intervention.materials.map((m) => m.materialId));
          const availableMaterials = allMaterials.filter((m) => !usedMaterialIds.has(m.id));
          const addMaterialAction = addVisitInterventionMaterial.bind(
            null,
            visit.id,
            intervention.id
          );

          return (
            <div key={intervention.id} className={cardClass}>
              <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                <div>
                  <p className="font-medium text-stone-900">{intervention.interventionType.name}</p>
                  <p className="text-xs text-stone-400">
                    Preço base: {formatCurrency(intervention.priceAtTime.toString())}
                  </p>
                </div>
                <form action={removeVisitIntervention.bind(null, visit.id, intervention.id)}>
                  <button
                    type="submit"
                    className="text-xs text-stone-400 hover:text-red-600"
                    title="Remover intervenção"
                  >
                    Remover intervenção
                  </button>
                </form>
              </div>

              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-stone-100">
                  {intervention.materials.map((usage) => (
                    <tr key={usage.id}>
                      <td className="px-4 py-2 text-stone-700">{usage.material.name}</td>
                      <td className="px-4 py-2 text-stone-400">
                        {formatCurrency(usage.unitPriceAtUse.toString())} / {usage.material.unit}
                      </td>
                      <td className="w-28 px-4 py-2">
                        <form
                          action={updateVisitInterventionMaterialQty.bind(
                            null,
                            visit.id,
                            usage.id
                          )}
                          className="flex items-center gap-1"
                        >
                          <input
                            type="number"
                            name="quantity"
                            min="1"
                            defaultValue={usage.quantity}
                            className="w-16 rounded-md border border-stone-300 px-2 py-1 text-sm"
                          />
                          <button
                            type="submit"
                            className="text-stone-400 hover:text-emerald-600"
                            title="Atualizar quantidade"
                          >
                            <Check size={16} />
                          </button>
                        </form>
                      </td>
                      <td className="w-10 px-2 py-2">
                        <form
                          action={removeVisitInterventionMaterial.bind(null, visit.id, usage.id)}
                        >
                          <button
                            type="submit"
                            className="text-stone-400 hover:text-red-600"
                            title="Remover material"
                          >
                            <X size={16} />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {intervention.materials.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-stone-400">
                        Sem materiais associados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {availableMaterials.length > 0 && (
                <form
                  action={addMaterialAction}
                  className="flex flex-wrap items-end gap-2 border-t border-stone-100 px-4 py-3"
                >
                  <select
                    name="materialId"
                    required
                    className="flex-1 min-w-[160px] rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                  >
                    {availableMaterials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    defaultValue={1}
                    className="w-16 rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                  />
                  <button type="submit" className={buttonStyles.ghost}>
                    <Plus size={14} /> Adicionar material
                  </button>
                </form>
              )}
            </div>
          );
        })}

        {visit.interventions.length === 0 && (
          <p className={`px-4 py-6 text-center text-stone-400 ${cardClass}`}>
            Nenhuma intervenção planeada para esta visita.
          </p>
        )}

        {availableInterventionTypes.length > 0 && (
          <form
            action={addInterventionAction}
            className={`flex flex-wrap items-end gap-2 p-4 ${cardClass}`}
          >
            <select
              name="interventionTypeId"
              required
              className={`flex-1 min-w-[200px] ${inputClass}`}
            >
              {availableInterventionTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {formatCurrency(t.basePrice.toString())}
                </option>
              ))}
            </select>
            <button type="submit" className={buttonStyles.secondary}>
              <Plus size={16} /> Adicionar intervenção
            </button>
          </form>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Fotos (ex: feridas)
        </h2>
        <PhotosSection
          photos={visit.photos.map((p) => ({ id: p.id, caption: p.caption }))}
          addAction={addPhotoAction}
          removeAction={removePhotoAction}
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Registo clínico
        </h2>
        <form action={saveVisitRecordAction} className={`space-y-5 p-6 ${cardClass}`}>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
              Sinais vitais
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Tensão arterial"
                name="bloodPressure"
                placeholder="120/80"
                defaultValue={visit.record?.bloodPressure ?? ""}
              />
              <Field
                label="Glicemia"
                name="glucoseLevel"
                placeholder="mg/dL"
                defaultValue={visit.record?.glucoseLevel ?? ""}
              />
              <Field
                label="Temperatura"
                name="temperature"
                placeholder="°C"
                defaultValue={visit.record?.temperature ?? ""}
              />
              <Field
                label="Frequência cardíaca"
                name="heartRate"
                placeholder="bpm"
                defaultValue={visit.record?.heartRate ?? ""}
              />
              <Field
                label="Frequência respiratória"
                name="respiratoryRate"
                type="number"
                placeholder="ciclos/min"
                defaultValue={visit.record?.respiratoryRate?.toString() ?? ""}
              />
              <Field
                label="Saturação O2"
                name="oxygenSaturation"
                type="number"
                placeholder="%"
                defaultValue={visit.record?.oxygenSaturation?.toString() ?? ""}
              />
              <Field
                label="Escala de dor (0-10)"
                name="painScale"
                type="number"
                placeholder="0-10"
                defaultValue={visit.record?.painScale?.toString() ?? ""}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
              Peso e altura
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Peso (kg)"
                name="weight"
                type="number"
                step="0.1"
                defaultValue={weight?.toString() ?? ""}
              />
              <Field
                label="Altura (cm)"
                name="height"
                type="number"
                step="0.1"
                defaultValue={height?.toString() ?? ""}
              />
              <div>
                <label className={labelClass}>IMC</label>
                <p className="mt-1 flex h-[38px] items-center text-sm text-stone-500">
                  {bmi ? bmi.toFixed(1) : "—"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="proceduresPerformed" className={labelClass}>
              Procedimentos realizados
            </label>
            <textarea
              id="proceduresPerformed"
              name="proceduresPerformed"
              rows={3}
              defaultValue={visit.record?.proceduresPerformed ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="observations" className={labelClass}>
              Nota geral da visita
            </label>
            <textarea
              id="observations"
              name="observations"
              rows={3}
              defaultValue={visit.record?.observations ?? ""}
              className={inputClass}
            />
          </div>

          <p className="text-xs text-stone-400">
            Ao guardar, o registo fica assinado como {session?.user.name}.
          </p>

          <div className="flex flex-wrap gap-3">
            <button type="submit" formAction={saveVisitRecordAction} className={buttonStyles.secondary}>
              Guardar
            </button>
            <button type="submit" formAction={completeVisitAction} className={buttonStyles.primary}>
              Concluir visita e guardar registo
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  step,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={inputClass}
      />
    </div>
  );
}
