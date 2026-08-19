import Link from "next/link";
import { Plus, CalendarRange, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";
import Badge, { INVOICE_STATUS_LABEL, INVOICE_STATUS_VARIANT } from "@/components/badge";
import PageHeader from "@/components/page-header";

export default async function FaturacaoPage({
  searchParams,
}: PageProps<"/faturacao">) {
  const params = await searchParams;
  const geradas = params.geradas ? Number(params.geradas) : null;

  const invoices = await prisma.invoice.findMany({
    include: { patient: true },
    orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
  });

  const now = new Date();

  return (
    <div>
      <PageHeader
        title="Faturação"
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/faturacao/gerar-mes" className={buttonStyles.secondary}>
              <CalendarRange size={16} /> Gerar faturas do mês
            </Link>
            <Link href="/faturacao/nova" className={buttonStyles.primary}>
              <Plus size={16} /> Gerar fatura
            </Link>
          </div>
        }
      />

      {geradas !== null && (
        <p className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 size={16} />
          {geradas === 0
            ? "Não havia utentes com visitas por faturar nesse período."
            : `${geradas} fatura${geradas === 1 ? "" : "s"} gerada${geradas === 1 ? "" : "s"} com sucesso.`}
        </p>
      )}

      <div className={`overflow-x-auto ${cardClass}`}>
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nº</th>
              <th className="px-4 py-3 font-medium">Utente</th>
              <th className="px-4 py-3 font-medium">Período</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {invoices.map((invoice) => {
              const isOverdue = invoice.status === "PENDENTE" && invoice.dueDate < now;
              return (
                <tr key={invoice.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 text-stone-400">
                    FT {invoice.periodYear}/{invoice.sequence}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/faturacao/${invoice.id}`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      {invoice.patient.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {invoice.periodMonth.toString().padStart(2, "0")}/{invoice.periodYear}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {formatCurrency(invoice.totalAmount.toString())}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={isOverdue ? "danger" : INVOICE_STATUS_VARIANT[invoice.status]}>
                      {isOverdue ? "Vencida" : INVOICE_STATUS_LABEL[invoice.status]}
                    </Badge>
                  </td>
                </tr>
              );
            })}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-stone-400">
                  Ainda não existem faturas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
