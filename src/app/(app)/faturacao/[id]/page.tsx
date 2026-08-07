import { notFound } from "next/navigation";
import { Plus, HeartHandshake } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, MONTH_NAMES } from "@/lib/format";
import { COMPANY } from "@/lib/company";
import { addInvoiceItem, markInvoicePaid } from "../actions";
import InvoicePdfButton from "./invoice-pdf-button";
import { inputClass, labelClass, cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";
import Badge, { INVOICE_STATUS_LABEL, INVOICE_STATUS_VARIANT } from "@/components/badge";
import PageHeader from "@/components/page-header";

export default async function FaturaDetailPage({ params }: PageProps<"/faturacao/[id]">) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { patient: true, items: true },
  });

  if (!invoice) notFound();

  const periodLabel = `${MONTH_NAMES[invoice.periodMonth - 1]} ${invoice.periodYear}`;
  const invoiceNumber = `FT ${invoice.periodYear}/${invoice.sequence}`;
  const billingName = invoice.patient.billingName || invoice.patient.name;
  const billingNif = invoice.patient.billingNif || invoice.patient.nationalId;
  const billingAddress = invoice.patient.billingAddress || invoice.patient.address;
  const addItemAction = addInvoiceItem.bind(null, invoice.id);
  const markPaidAction = markInvoicePaid.bind(null, invoice.id);

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title={invoiceNumber}
        description={`${periodLabel} · Prazo de pagamento: ${formatDate(invoice.dueDate)}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={INVOICE_STATUS_VARIANT[invoice.status]}>
              {INVOICE_STATUS_LABEL[invoice.status]}
            </Badge>
            <InvoicePdfButton
              invoice={{
                invoiceNumber,
                periodLabel,
                status: INVOICE_STATUS_LABEL[invoice.status],
                dueDate: formatDate(invoice.dueDate),
                createdAt: formatDate(invoice.createdAt),
                billingName,
                billingNif,
                billingAddress,
                items: invoice.items.map((item) => ({
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: Number(item.unitPrice),
                })),
                totalAmount: Number(invoice.totalAmount),
              }}
            />
            {invoice.status !== "PAGA" && (
              <form action={markPaidAction}>
                <button type="submit" className={buttonStyles.primary}>
                  Marcar paga
                </button>
              </form>
            )}
          </div>
        }
      />

      <div className={`overflow-x-auto ${cardClass}`}>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 bg-stone-50/60 px-6 py-5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600">
                <HeartHandshake size={15} className="text-white" strokeWidth={2.25} />
              </span>
              <span className="font-semibold text-stone-900">{COMPANY.name}</span>
            </div>
            <p className="text-xs text-stone-500">NIF {COMPANY.nif}</p>
            <p className="text-xs text-stone-500">Tel. {COMPANY.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              Faturar a
            </p>
            <p className="font-medium text-stone-900">{billingName}</p>
            {billingNif && <p className="text-xs text-stone-500">NIF {billingNif}</p>}
            {billingAddress && <p className="text-xs text-stone-500">{billingAddress}</p>}
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-500">
            <tr>
              <th className="px-6 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium">Qtd.</th>
              <th className="px-4 py-3 font-medium">Preço unit.</th>
              <th className="px-6 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-3">{item.description}</td>
                <td className="px-4 py-3 text-stone-600">{item.quantity}</td>
                <td className="px-4 py-3 text-stone-600">
                  {formatCurrency(item.unitPrice.toString())}
                </td>
                <td className="px-6 py-3 text-stone-600">
                  {formatCurrency(Number(item.unitPrice) * item.quantity)}
                </td>
              </tr>
            ))}
            {invoice.items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-stone-400">
                  Sem itens nesta fatura.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-stone-200 font-medium">
              <td className="px-6 py-3" colSpan={3}>
                Total
              </td>
              <td className="px-6 py-3">{formatCurrency(invoice.totalAmount.toString())}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Adicionar item manual
        </h2>
        <form action={addItemAction} className={`flex flex-wrap items-end gap-3 p-4 ${cardClass}`}>
          <div className="min-w-[200px] flex-1">
            <label htmlFor="description" className={labelClass}>
              Descrição
            </label>
            <input id="description" name="description" required className={inputClass} />
          </div>
          <div className="w-24">
            <label htmlFor="quantity" className={labelClass}>
              Qtd.
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              defaultValue={1}
              required
              className={inputClass}
            />
          </div>
          <div className="w-32">
            <label htmlFor="unitPrice" className={labelClass}>
              Preço unit. (€)
            </label>
            <input
              id="unitPrice"
              name="unitPrice"
              type="number"
              step="0.01"
              min="0"
              required
              className={inputClass}
            />
          </div>
          <button type="submit" className={buttonStyles.secondary}>
            <Plus size={16} /> Adicionar
          </button>
        </form>
      </section>
    </div>
  );
}
