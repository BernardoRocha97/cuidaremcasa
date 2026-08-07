import PatientForm from "../patient-form";
import { createPatient } from "../actions";
import PageHeader from "@/components/page-header";

export default function NovoUtentePage() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Novo utente" />
      <PatientForm action={createPatient} submitLabel="Criar utente" />
    </div>
  );
}
