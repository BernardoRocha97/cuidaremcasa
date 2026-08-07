import InterventionForm from "../intervention-form";
import { createInterventionType } from "../../actions";
import PageHeader from "@/components/page-header";

export default function NovaIntervencaoPage() {
  return (
    <div className="max-w-lg">
      <PageHeader title="Nova intervenção" />
      <InterventionForm action={createInterventionType} submitLabel="Criar intervenção" />
    </div>
  );
}
