import { prisma } from "@/lib/prisma";
import { MONTH_NAMES, formatCurrency } from "@/lib/format";
import { getUnbilledVisits, buildInvoiceItems } from "@/lib/billing";
import { generateInvoice } from "../actions";
import { inputClass, labelClass, cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";
import PageHeader from "@/components/page-header";

export default async function NovaFaturaPage({
  searchParams,
}: PageProps<"/faturacao/nova">) {
  const params = await searchParams;
  const now = new Date();

  const patients = await prisma.patient.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  const patientId = typeof params.patientId === "string" ? params.patientId : "";
  const month = Number(params.month) || now.getMonth() + 1;
  const year = Number(params.year) || now.getFullYear();

  let preview: { items: ReturnType<typeof buildInvoiceItems>; patientName: string } | null = null;
  if (patientId) {
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      const visits = await getUnbilledVisits(patientId, month, year);
      preview = { items: buildInvoiceItems(visits), patientName: patient.name };
    }
  }

  const total = preview?.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) ?? 0;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Gerar fatura"
        description="Escolhe o utente e o período para veres primeiro o que vai ser faturado, antes de confirmares."
      />

      <form method="get" className={`flex flex-wrap items-end gap-3 p-6 ${cardClass}`}>
        <div className="min-w-[200px] flex-1">
          <label htmlFor="patientId" className={labelClass}>
            Utente
          </label>
          <select id="patientId" name="patientId" defaultValue={patientId} required className={inputClass}>
            <option value="">Selecionar utente...</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
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
          <input
            id="year"
            name="year"
            type="number"
            defaultValue={year}
            required
            className={inputClass}
          />
        </div>
        <button type="submit" className={buttonStyles.secondary}>
          Ver visitas por faturar
        </button>
      </form>

      {preview && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Pré-visualização — {preview.patientName} · {MONTH_NAMES[month - 1]} {year}
          </h2>

          {preview.items.length === 0 ? (
            <p className={`px-4 py-8 text-center text-stone-400 ${cardClass}`}>
              Não há visitas concluídas por faturar neste período para este utente. Ou já foram
              todas faturadas, ou ainda não há visitas concluídas neste mês.
            </p>
          ) : (
            <>
              <div className={`overflow-x-auto ${cardClass}`}>
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 text-stone-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Descrição</th>
                      <th className="px-4 py-3 font-medium">Qtd.</th>
                      <th className="px-4 py-3 font-medium">Preço unit.</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {preview.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">{item.description}</td>
                        <td className="px-4 py-3 text-stone-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-stone-600">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-stone-600">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-stone-200 font-medium">
                      <td className="px-4 py-3" colSpan={3}>
                        Total
                      </td>
                      <td className="px-4 py-3">{formatCurrency(total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <form action={generateInvoice} className="mt-3">
                <input type="hidden" name="patientId" value={patientId} />
                <input type="hidden" name="month" value={month} />
                <input type="hidden" name="year" value={year} />
                <button type="submit" className={buttonStyles.primary}>
                  Confirmar e gerar fatura
                </button>
              </form>
            </>
          )}
        </section>
      )}
    </div>
  );
}
