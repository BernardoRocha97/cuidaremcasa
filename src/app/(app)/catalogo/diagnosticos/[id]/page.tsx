import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NursingCatalogForm from "../../nursing-catalog-form";
import { updateNursingDiagnosis, setNursingDiagnosisActive } from "../../actions";
import { buttonStyles } from "@/components/button-styles";
import PageHeader from "@/components/page-header";

export default async function DiagnosticoDetailPage({
  params,
}: PageProps<"/catalogo/diagnosticos/[id]">) {
  const { id } = await params;
  const diagnosis = await prisma.nursingDiagnosis.findUnique({ where: { id } });
  if (!diagnosis) notFound();

  return (
    <div className="max-w-lg">
      <PageHeader
        title={diagnosis.name}
        action={
          <form action={setNursingDiagnosisActive.bind(null, diagnosis.id, !diagnosis.active)}>
            <button type="submit" className={buttonStyles.secondary}>
              {diagnosis.active ? "Marcar inativo" : "Marcar ativo"}
            </button>
          </form>
        }
      />
      <NursingCatalogForm
        action={updateNursingDiagnosis.bind(null, diagnosis.id)}
        submitLabel="Guardar alterações"
        defaultValues={{ name: diagnosis.name, description: diagnosis.description ?? "" }}
      />
    </div>
  );
}
