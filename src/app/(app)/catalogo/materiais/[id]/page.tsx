import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MaterialForm from "../material-form";
import { updateMaterial, setMaterialActive } from "../../actions";
import { buttonStyles } from "@/components/button-styles";
import PageHeader from "@/components/page-header";

export default async function MaterialDetailPage({ params }: PageProps<"/catalogo/materiais/[id]">) {
  const { id } = await params;
  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) notFound();

  return (
    <div className="max-w-lg">
      <PageHeader
        title={material.name}
        action={
          <form action={setMaterialActive.bind(null, material.id, !material.active)}>
            <button type="submit" className={buttonStyles.secondary}>
              {material.active ? "Marcar inativo" : "Marcar ativo"}
            </button>
          </form>
        }
      />
      <MaterialForm
        action={updateMaterial.bind(null, material.id)}
        submitLabel="Guardar alterações"
        defaultValues={{
          name: material.name,
          unit: material.unit,
          unitPrice: material.unitPrice.toString(),
        }}
      />
    </div>
  );
}
