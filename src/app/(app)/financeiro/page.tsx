import Link from "next/link";
import { Wallet, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, MONTH_NAMES } from "@/lib/format";
import { cardClass } from "@/components/form-styles";
import StatCard from "@/components/stat-card";
import Badge, { INVOICE_STATUS_LABEL, INVOICE_STATUS_VARIANT } from "@/components/badge";
import PageHeader from "@/components/page-header";

export default async function FinanceiroPage() {
  const invoices = await prisma.invoice.findMany({
    include: { patient: true },
    orderBy: [{ periodYear: "asc" }, { periodMonth: "asc" }],
  });

  const now = new Date();

  let totalFaturado = 0;
  let totalPago = 0;
  let totalPendente = 0;
  let totalVencido = 0;

  const monthly = new Map<string, { label: string; total: number }>();

  for (const invoice of invoices) {
    const amount = Number(invoice.totalAmount);
    totalFaturado += amount;

    const isOverdue = invoice.status === "VENCIDA" || (invoice.status === "PENDENTE" && invoice.dueDate < now);

    if (invoice.status === "PAGA") totalPago += amount;
    else if (isOverdue) totalVencido += amount;
    else totalPendente += amount;

    const key = `${invoice.periodYear}-${String(invoice.periodMonth).padStart(2, "0")}`;
    const label = `${MONTH_NAMES[invoice.periodMonth - 1].slice(0, 3)}/${String(invoice.periodYear).slice(2)}`;
    const entry = monthly.get(key) ?? { label, total: 0 };
    entry.total += amount;
    monthly.set(key, entry);
  }

  const monthlyEntries = Array.from(monthly.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(-12)
    .map(([, value]) => value);
  const maxMonthly = Math.max(1, ...monthlyEntries.map((m) => m.total));

  const toReceive = invoices
    .filter((i) => i.status !== "PAGA")
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <div className="space-y-8">
      <PageHeader
        title="Financeiro"
        description="Resumo da faturação da empresa, com base nas faturas emitidas."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Wallet} label="Total faturado" value={formatCurrency(totalFaturado)} tone="sky" />
        <StatCard icon={CheckCircle2} label="Total pago" value={formatCurrency(totalPago)} tone="emerald" />
        <StatCard icon={Clock} label="Por cobrar" value={formatCurrency(totalPendente)} tone="amber" />
        <StatCard icon={AlertTriangle} label="Vencido" value={formatCurrency(totalVencido)} tone="red" />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Faturação mensal
        </h2>
        <div className={`p-6 ${cardClass}`}>
          {monthlyEntries.length === 0 ? (
            <p className="py-8 text-center text-stone-400">Ainda não existem faturas.</p>
          ) : (
            <div className="flex items-end gap-3 overflow-x-auto pb-2" style={{ minHeight: 180 }}>
              {monthlyEntries.map((entry) => (
                <div key={entry.label} className="flex w-14 shrink-0 flex-col items-center gap-1.5">
                  <span className="text-xs text-stone-500">{formatCurrency(entry.total)}</span>
                  <div className="flex h-32 w-full items-end">
                    <div
                      className="w-full rounded-t-md bg-emerald-500"
                      style={{ height: `${Math.max(4, (entry.total / maxMonthly) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-stone-600">{entry.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Por cobrar
        </h2>
        <div className={`overflow-x-auto ${cardClass}`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Utente</th>
                <th className="px-4 py-3 font-medium">Período</th>
                <th className="px-4 py-3 font-medium">Prazo</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {toReceive.map((invoice) => {
                const isOverdue = invoice.status === "VENCIDA" || invoice.dueDate < now;
                return (
                  <tr key={invoice.id} className="hover:bg-stone-50">
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
                    <td className="px-4 py-3 text-stone-600">{formatDate(invoice.dueDate)}</td>
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
              {toReceive.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                    Não há faturas por cobrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
