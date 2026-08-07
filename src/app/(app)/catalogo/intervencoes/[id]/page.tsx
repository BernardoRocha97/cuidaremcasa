import { notFound } from "next/navigation";
import { Plus, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import InterventionForm from "../intervention-form";
import {
  updateInterventionType,
  setInterventionTypeActive,
  addDefaultMaterial,
  removeDefaultMaterial,
} from "../../actions";
import { inputClass, labelClass, cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";
import PageHeader from "@/components/page-header";

export default async function IntervencaoDetailPage({
  params,
}: PageProps<"/catalogo/intervencoes/[id]">) {
  const { id } = await params;

  const [intervention, allMaterials] = await Promise.all([
    prisma.interventionType.findUnique({
      where: { id },
      include: { defaultMaterials: { include: { material: true }, orderBy: { id: "asc" } } },
    }),
    prisma.material.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  if (!intervention) notFound();

  const linkedMaterialIds = new Set(intervention.defaultMaterials.map((m) => m.materialId));
  const availableMaterials = allMaterials.filter((m) => !linkedMaterialIds.has(m.id));

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader
        title={intervention.name}
        action={
          <form action={setInterventionTypeActive.bind(null, intervention.id, !intervention.active)}>
            <button type="submit" className={buttonStyles.secondary}>
              {intervention.active ? "Marcar inativa" : "Marcar ativa"}
            </button>
          </form>
        }
      />

      <InterventionForm
        action={updateInterventionType.bind(null, intervention.id)}
        submitLabel="Guardar alterações"
        defaultValues={{ name: intervention.name, basePrice: intervention.basePrice.toString() }}
      />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Materiais predefinidos
        </h2>
        <div className={`overflow-x-auto ${cardClass}`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Material</th>
                <th className="px-4 py-3 font-medium">Qtd. predefinida</th>
                <th className="px-4 py-3 font-medium">Preço unitário</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {intervention.defaultMaterials.map((link) => (
                <tr key={link.id}>
                  <td className="px-4 py-3">{link.material.name}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {link.defaultQuantity} {link.material.unit}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {formatCurrency(link.material.unitPrice.toString())}
                  </td>
                  <td className="px-4 py-3">
                    <form action={removeDefaultMaterial.bind(null, intervention.id, link.id)}>
                      <button
                        type="submit"
                        title="Remover"
                        className="text-stone-400 hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {intervention.defaultMaterials.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-stone-400">
                    Nenhum material associado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {availableMaterials.length > 0 && (
          <form
            action={addDefaultMaterial.bind(null, intervention.id)}
            className={`mt-3 flex flex-wrap items-end gap-3 p-4 ${cardClass}`}
          >
            <div className="min-w-[200px] flex-1">
              <label htmlFor="materialId" className={labelClass}>
                Material
              </label>
              <select id="materialId" name="materialId" required className={inputClass}>
                {availableMaterials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-28">
              <label htmlFor="defaultQuantity" className={labelClass}>
                Qtd.
              </label>
              <input
                id="defaultQuantity"
                name="defaultQuantity"
                type="number"
                min="1"
                defaultValue={1}
                required
                className={inputClass}
              />
            </div>
            <button type="submit" className={buttonStyles.secondary}>
              <Plus size={16} /> Associar
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
