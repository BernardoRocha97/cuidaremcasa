import NursingCatalogForm from "../../nursing-catalog-form";
import { createNursingIntervention } from "../../actions";
import PageHeader from "@/components/page-header";

export default function NovaIntervencaoEnfermagemPage() {
  return (
    <div className="max-w-lg">
      <PageHeader title="Nova intervenção de enfermagem" />
      <NursingCatalogForm
        action={createNursingIntervention}
        submitLabel="Criar intervenção"
        namePlaceholder="Ex: Vigiar integridade cutânea"
      />
    </div>
  );
}
