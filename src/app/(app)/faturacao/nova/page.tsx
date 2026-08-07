import { prisma } from "@/lib/prisma";
import { MONTH_NAMES } from "@/lib/format";
import { generateInvoice } from "../actions";
import { inputClass, labelClass, cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";
import PageHeader from "@/components/page-header";

export default async function NovaFaturaPage() {
  const patients = await prisma.patient.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  const now = new Date();

  return (
    <div className="max-w-md">
      <PageHeader
        title="Gerar fatura"
        description="Reúne automaticamente as intervenções e materiais das visitas concluídas do utente no período escolhido, com os preços do catálogo."
      />

      <form action={generateInvoice} className={`space-y-4 p-6 ${cardClass}`}>
        <div>
          <label htmlFor="patientId" className={labelClass}>
            Utente
          </label>
          <select id="patientId" name="patientId" required className={inputClass}>
            <option value="">Selecionar utente...</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="month" className={labelClass}>
              Mês
            </label>
            <select
              id="month"
              name="month"
              defaultValue={now.getMonth() + 1}
              className={inputClass}
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={name} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year" className={labelClass}>
              Ano
            </label>
            <input
              id="year"
              name="year"
              type="number"
              defaultValue={now.getFullYear()}
              required
              className={inputClass}
            />
          </div>
        </div>

        <button type="submit" className={buttonStyles.primary}>
          Gerar fatura
        </button>
      </form>
    </div>
  );
}
