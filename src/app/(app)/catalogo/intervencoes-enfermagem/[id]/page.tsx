import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NursingCatalogForm from "../../nursing-catalog-form";
import { updateNursingIntervention, setNursingInterventionActive } from "../../actions";
import { buttonStyles } from "@/components/button-styles";
import PageHeader from "@/components/page-header";

export default async function IntervencaoEnfermagemDetailPage({
  params,
}: PageProps<"/catalogo/intervencoes-enfermagem/[id]">) {
  const { id } = await params;
  const intervention = await prisma.nursingIntervention.findUnique({ where: { id } });
  if (!intervention) notFound();

  return (
    <div className="max-w-lg">
      <PageHeader
        title={intervention.name}
        action={
          <form
            action={setNursingInterventionActive.bind(null, intervention.id, !intervention.active)}
          >
            <button type="submit" className={buttonStyles.secondary}>
              {intervention.active ? "Marcar inativa" : "Marcar ativa"}
            </button>
          </form>
        }
      />
      <NursingCatalogForm
        action={updateNursingIntervention.bind(null, intervention.id)}
        submitLabel="Guardar alterações"
        defaultValues={{ name: intervention.name, description: intervention.description ?? "" }}
      />
    </div>
  );
}
