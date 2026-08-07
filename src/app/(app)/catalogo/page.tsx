import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";
import Badge from "@/components/badge";
import PageHeader from "@/components/page-header";

export default async function CatalogoPage() {
  const [materials, interventions, nursingDiagnoses, nursingInterventions] = await Promise.all([
    prisma.material.findMany({ orderBy: { name: "asc" } }),
    prisma.interventionType.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { defaultMaterials: true } } },
    }),
    prisma.nursingDiagnosis.findMany({ orderBy: { name: "asc" } }),
    prisma.nursingIntervention.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Catálogo"
        description="Intervenções que a empresa presta e os materiais associados a cada uma, usados para o registo dos enfermeiros e para a faturação."
      />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Intervenções
          </h2>
          <Link href="/catalogo/intervencoes/novo" className={buttonStyles.secondary}>
            <Plus size={16} /> Nova intervenção
          </Link>
        </div>
        <div className={`overflow-x-auto ${cardClass}`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Preço base</th>
                <th className="px-4 py-3 font-medium">Materiais predefinidos</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {interventions.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/catalogo/intervencoes/${item.id}`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {formatCurrency(item.basePrice.toString())}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{item._count.defaultMaterials}</td>
                  <td className="px-4 py-3">
                    <Badge variant={item.active ? "success" : "neutral"}>
                      {item.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {interventions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-stone-400">
                    Ainda não existem intervenções no catálogo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Materiais
          </h2>
          <Link href="/catalogo/materiais/novo" className={buttonStyles.secondary}>
            <Plus size={16} /> Novo material
          </Link>
        </div>
        <div className={`overflow-x-auto ${cardClass}`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Unidade</th>
                <th className="px-4 py-3 font-medium">Preço unitário</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {materials.map((material) => (
                <tr key={material.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/catalogo/materiais/${material.id}`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      {material.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{material.unit}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {formatCurrency(material.unitPrice.toString())}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={material.active ? "success" : "neutral"}>
                      {material.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-stone-400">
                    Ainda não existem materiais no catálogo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Diagnósticos de enfermagem
          </h2>
          <Link href="/catalogo/diagnosticos/novo" className={buttonStyles.secondary}>
            <Plus size={16} /> Novo diagnóstico
          </Link>
        </div>
        <NursingCatalogTable items={nursingDiagnoses} basePath="/catalogo/diagnosticos" />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Intervenções de enfermagem
          </h2>
          <Link href="/catalogo/intervencoes-enfermagem/novo" className={buttonStyles.secondary}>
            <Plus size={16} /> Nova intervenção
          </Link>
        </div>
        <NursingCatalogTable
          items={nursingInterventions}
          basePath="/catalogo/intervencoes-enfermagem"
        />
      </section>
    </div>
  );
}

function NursingCatalogTable({
  items,
  basePath,
}: {
  items: { id: string; name: string; description: string | null; active: boolean }[];
  basePath: string;
}) {
  return (
    <div className={`overflow-x-auto ${cardClass}`}>
      <table className="w-full text-left text-sm">
        <thead className="bg-stone-50 text-stone-500">
          <tr>
            <th className="px-4 py-3 font-medium">Nome</th>
            <th className="px-4 py-3 font-medium">Descrição</th>
            <th className="px-4 py-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-stone-50">
              <td className="px-4 py-3">
                <Link href={`${basePath}/${item.id}`} className="font-medium text-emerald-700 hover:underline">
                  {item.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-stone-600">{item.description || "—"}</td>
              <td className="px-4 py-3">
                <Badge variant={item.active ? "success" : "neutral"}>
                  {item.active ? "Ativo" : "Inativo"}
                </Badge>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-stone-400">
                Ainda não existem itens.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
