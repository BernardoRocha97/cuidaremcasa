import { MONTH_NAMES, formatCurrency } from "@/lib/format";
import { getPatientsWithUnbilledVisits } from "@/lib/billing";
import { generateInvoicesForMonth } from "../actions";
import { inputClass, labelClass, cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";
import PageHeader from "@/components/page-header";

export default async function GerarFaturasMesPage({
  searchParams,
}: PageProps<"/faturacao/gerar-mes">) {
  const params = await searchParams;
  const now = new Date();
  const month = Number(params.month) || now.getMonth() + 1;
  const year = Number(params.year) || now.getFullYear();
  const showPreview = params.month !== undefined || params.year !== undefined;

  const patientsWithVisits = showPreview ? await getPatientsWithUnbilledVisits(month, year) : [];
  const billable = patientsWithVisits.filter((p) => p.items.length > 0);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Gerar faturas do mês"
        description="Gera de uma vez uma fatura para cada utente que tenha visitas concluídas por faturar no período escolhido."
      />

      <form method="get" className={`flex flex-wrap items-end gap-3 p-6 ${cardClass}`}>
        <div className="w-40">
          <label htmlFor="month" className={labelClass}>
            Mês
          </label>
          <select id="month" name="month" defaultValue={month} className={inputClass}>
            {MONTH_NAMES.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-28">
          <label htmlFor="year" className={labelClass}>
            Ano
          </label>
          <input id="year" name="year" type="number" defaultValue={year} required className={inputClass} />
        </div>
        <button type="submit" className={buttonStyles.secondary}>
          Ver utentes por faturar
        </button>
      </form>

      {showPreview && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            {MONTH_NAMES[month - 1]} {year}
          </h2>

          {billable.length === 0 ? (
            <p className={`px-4 py-8 text-center text-stone-400 ${cardClass}`}>
              Não há utentes com visitas concluídas por faturar neste período.
            </p>
          ) : (
            <>
              <div className={`overflow-x-auto ${cardClass}`}>
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 text-stone-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Utente</th>
                      <th className="px-4 py-3 font-medium">Visitas</th>
                      <th className="px-4 py-3 font-medium">Total estimado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {billable.map((entry) => (
                      <tr key={entry.patient.id}>
                        <td className="px-4 py-3 font-medium text-stone-900">
                          {entry.patient.name}
                        </td>
                        <td className="px-4 py-3 text-stone-600">{entry.visitCount}</td>
                        <td className="px-4 py-3 text-stone-600">
                          {formatCurrency(
                            entry.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <form action={generateInvoicesForMonth} className="mt-3">
                <input type="hidden" name="month" value={month} />
                <input type="hidden" name="year" value={year} />
                <button type="submit" className={buttonStyles.primary}>
                  Gerar {billable.length} fatura{billable.length === 1 ? "" : "s"}
                </button>
              </form>
            </>
          )}
        </section>
      )}
    </div>
  );
}
