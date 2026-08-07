import NursingCatalogForm from "../../nursing-catalog-form";
import { createNursingDiagnosis } from "../../actions";
import PageHeader from "@/components/page-header";

export default function NovoDiagnosticoPage() {
  return (
    <div className="max-w-lg">
      <PageHeader title="Novo diagnóstico de enfermagem" />
      <NursingCatalogForm
        action={createNursingDiagnosis}
        submitLabel="Criar diagnóstico"
        namePlaceholder="Ex: Risco de queda"
      />
    </div>
  );
}
