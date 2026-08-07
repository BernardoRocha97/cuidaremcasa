import MaterialForm from "../material-form";
import { createMaterial } from "../../actions";
import PageHeader from "@/components/page-header";

export default function NovoMaterialPage() {
  return (
    <div className="max-w-lg">
      <PageHeader title="Novo material" />
      <MaterialForm action={createMaterial} submitLabel="Criar material" />
    </div>
  );
}
