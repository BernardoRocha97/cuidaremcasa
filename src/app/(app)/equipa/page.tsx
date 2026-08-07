import { prisma } from "@/lib/prisma";
import NewMemberForm from "./new-member-form";
import { setUserActive } from "./actions";
import { cardClass } from "@/components/form-styles";
import Badge from "@/components/badge";
import PageHeader from "@/components/page-header";

export default async function EquipaPage() {
  const members = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-8">
      <div>
        <PageHeader title="Equipa" />
        <div className={`overflow-x-auto ${cardClass}`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-4 py-3 font-medium text-stone-900">{member.name}</td>
                  <td className="px-4 py-3 text-stone-600">{member.email}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {member.role === "ADMIN" ? "Administração" : "Enfermeiro"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={member.active ? "success" : "neutral"}>
                      {member.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <form action={setUserActive.bind(null, member.id, !member.active)}>
                      <button type="submit" className="text-sm text-emerald-700 hover:underline">
                        {member.active ? "Desativar" : "Ativar"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Nova conta
        </h2>
        <NewMemberForm />
      </div>
    </div>
  );
}
