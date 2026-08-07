"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";
import { buttonStyles } from "@/components/button-styles";
import { COMPANY } from "@/lib/company";

type InvoicePdfData = {
  invoiceNumber: string;
  periodLabel: string;
  status: string;
  dueDate: string;
  createdAt: string;
  billingName: string;
  billingNif: string | null;
  billingAddress: string | null;
  items: { description: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
};

const EMERALD: [number, number, number] = [5, 150, 105];
const STONE_LIGHT: [number, number, number] = [245, 245, 244];
const STONE_TEXT: [number, number, number] = [87, 83, 78];

export default function InvoicePdfButton({ invoice }: { invoice: InvoicePdfData }) {
  function handleDownload() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 14;

    // Letterhead
    doc.setFillColor(...EMERALD);
    doc.rect(0, 0, pageWidth, 32, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(COMPANY.name, marginX, 15);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`NIF ${COMPANY.nif}  ·  Tel. ${COMPANY.phone}`, marginX, 22);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.invoiceNumber, pageWidth - marginX, 15, { align: "right" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Emitida em ${invoice.createdAt}`, pageWidth - marginX, 22, { align: "right" });

    // Billing block
    let y = 45;
    doc.setTextColor(...STONE_TEXT);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("FATURAR A", marginX, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(28, 25, 23);
    y += 6;
    doc.text(invoice.billingName, marginX, y);
    doc.setFontSize(9);
    doc.setTextColor(...STONE_TEXT);
    if (invoice.billingNif) {
      y += 5;
      doc.text(`NIF ${invoice.billingNif}`, marginX, y);
    }
    if (invoice.billingAddress) {
      y += 5;
      doc.text(invoice.billingAddress, marginX, y);
    }

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("PERÍODO", pageWidth - marginX, 45, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(28, 25, 23);
    doc.text(invoice.periodLabel, pageWidth - marginX, 51, { align: "right" });
    doc.setFontSize(9);
    doc.setTextColor(...STONE_TEXT);
    doc.text(`Prazo de pagamento: ${invoice.dueDate}`, pageWidth - marginX, 56, { align: "right" });
    doc.text(`Estado: ${invoice.status}`, pageWidth - marginX, 61, { align: "right" });

    autoTable(doc, {
      startY: 72,
      head: [["Descrição", "Qtd.", "Preço unit.", "Total"]],
      body: invoice.items.map((item) => [
        item.description,
        String(item.quantity),
        `${item.unitPrice.toFixed(2)} €`,
        `${(item.unitPrice * item.quantity).toFixed(2)} €`,
      ]),
      styles: { fontSize: 9, textColor: [28, 25, 23] },
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: STONE_LIGHT },
      columnStyles: {
        1: { halign: "right", cellWidth: 20 },
        2: { halign: "right", cellWidth: 30 },
        3: { halign: "right", cellWidth: 30 },
      },
      margin: { left: marginX, right: marginX },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

    doc.setFillColor(...STONE_LIGHT);
    doc.rect(pageWidth - marginX - 70, finalY + 6, 70, 12, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 25, 23);
    doc.text("Total", pageWidth - marginX - 64, finalY + 14);
    doc.text(`${invoice.totalAmount.toFixed(2)} €`, pageWidth - marginX - 4, finalY + 14, {
      align: "right",
    });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...STONE_TEXT);
    doc.text(
      "Documento sem valor fiscal. Não substitui fatura-recibo eletrónica.",
      marginX,
      doc.internal.pageSize.getHeight() - 12
    );

    doc.save(`${invoice.invoiceNumber.replace(/\s+/g, "-")}.pdf`);
  }

  return (
    <button type="button" onClick={handleDownload} className={buttonStyles.secondary}>
      <Download size={16} /> Exportar PDF
    </button>
  );
}
