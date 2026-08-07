import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";
import Badge from "@/components/badge";
import PageHeader from "@/components/page-header";

export default async function UtentesPage() {
  const patients = await prisma.patient.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Utentes"
        description={`${patients.length} utente${patients.length === 1 ? "" : "s"} registado${patients.length === 1 ? "" : "s"}`}
        action={
          <Link href="/utentes/novo" className={buttonStyles.primary}>
            <Plus size={16} /> Novo utente
          </Link>
        }
      />

      <div className={`overflow-x-auto ${cardClass}`}>
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Morada</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/utentes/${patient.id}`}
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    {patient.name}
                  </Link>
                  {patient.birthDate && (
                    <div className="text-xs text-stone-400">
                      Nasc. {formatDate(patient.birthDate)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-stone-600">{patient.phone || "—"}</td>
                <td className="px-4 py-3 text-stone-600">{patient.address || "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={patient.active ? "success" : "neutral"}>
                    {patient.active ? "Ativo" : "Inativo"}
                  </Badge>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-stone-400">
                  Ainda não existem utentes registados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
