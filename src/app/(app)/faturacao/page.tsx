import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";
import Badge, { INVOICE_STATUS_LABEL, INVOICE_STATUS_VARIANT } from "@/components/badge";
import PageHeader from "@/components/page-header";

export default async function FaturacaoPage() {
  const invoices = await prisma.invoice.findMany({
    include: { patient: true },
    orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
  });

  return (
    <div>
      <PageHeader
        title="Faturação"
        action={
          <Link href="/faturacao/nova" className={buttonStyles.primary}>
            <Plus size={16} /> Gerar fatura
          </Link>
        }
      />

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
            {invoices.map((invoice) => (
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
                  <Badge variant={INVOICE_STATUS_VARIANT[invoice.status]}>
                    {INVOICE_STATUS_LABEL[invoice.status]}
                  </Badge>
                </td>
              </tr>
            ))}
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
