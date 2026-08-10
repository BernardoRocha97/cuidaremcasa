"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";
import { buttonStyles } from "@/components/button-styles";
import { COMPANY } from "@/lib/company";

type VisitReportData = {
  patientName: string;
  scheduledDate: string;
  nurseName: string | null;
  status: string;
  interventions: {
    name: string;
    price: number;
    materials: { name: string; quantity: number; unit: string }[];
  }[];
  nursingDiagnoses: { name: string; notes: string | null }[];
  nursingInterventions: { name: string; notes: string | null }[];
  vitals: { label: string; value: string }[];
  weight: string | null;
  height: string | null;
  bmi: string | null;
  proceduresPerformed: string | null;
  observations: string | null;
  signedByName: string | null;
  signedAt: string | null;
  photoIds: string[];
  visitNotes: string | null;
};

const EMERALD: [number, number, number] = [5, 150, 105];
const STONE_LIGHT: [number, number, number] = [245, 245, 244];
const STONE_TEXT: [number, number, number] = [87, 83, 78];
const DARK: [number, number, number] = [28, 25, 23];

async function fetchImageDataUrl(photoId: string): Promise<{ dataUrl: string; format: string } | null> {
  try {
    const res = await fetch(`/api/photos/${photoId}`);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const format = blob.type.includes("png") ? "PNG" : "JPEG";
    return { dataUrl, format };
  } catch {
    return null;
  }
}

export default function VisitReportPdfButton({ visit }: { visit: VisitReportData }) {
  async function handleDownload() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 14;
    let y = 38;

    doc.setFillColor(...EMERALD);
    doc.rect(0, 0, pageWidth, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(COMPANY.name, marginX, 13);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`NIF ${COMPANY.nif} · Tel. ${COMPANY.phone}`, marginX, 19);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de visita", pageWidth - marginX, 13, { align: "right" });

    function ensureSpace(needed: number) {
      if (y + needed > pageHeight - 15) {
        doc.addPage();
        y = 15;
      }
    }

    function sectionTitle(title: string) {
      ensureSpace(10);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      doc.text(title.toUpperCase(), marginX, y);
      y += 2;
      doc.setDrawColor(...STONE_LIGHT);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 6;
    }

    function bodyText(text: string, opts: { bold?: boolean } = {}) {
      doc.setFontSize(10);
      doc.setFont("helvetica", opts.bold ? "bold" : "normal");
      doc.setTextColor(...DARK);
      const lines = doc.splitTextToSize(text, pageWidth - marginX * 2);
      ensureSpace(lines.length * 5 + 2);
      doc.text(lines, marginX, y);
      y += lines.length * 5 + 3;
    }

    bodyText(`Utente: ${visit.patientName}`, { bold: true });
    bodyText(`Data: ${visit.scheduledDate}`);
    if (visit.nurseName) bodyText(`Enfermeiro: ${visit.nurseName}`);
    bodyText(`Estado: ${visit.status}`);
    y += 2;

    if (visit.interventions.length > 0) {
      sectionTitle("Intervenções e materiais usados");
      for (const intervention of visit.interventions) {
        bodyText(`${intervention.name} (${intervention.price.toFixed(2)} €)`, { bold: true });
        if (intervention.materials.length > 0) {
          ensureSpace(intervention.materials.length * 6 + 4);
          autoTable(doc, {
            startY: y,
            head: [["Material", "Quantidade"]],
            body: intervention.materials.map((m) => [m.name, `${m.quantity} ${m.unit}`]),
            styles: { fontSize: 9, textColor: DARK },
            headStyles: { fillColor: STONE_LIGHT, textColor: DARK, fontStyle: "bold" },
            margin: { left: marginX, right: marginX },
          });
          y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
        }
      }
    }

    if (visit.nursingDiagnoses.length > 0) {
      sectionTitle("Diagnósticos de enfermagem");
      for (const d of visit.nursingDiagnoses) {
        bodyText(`• ${d.name}${d.notes ? ` — ${d.notes}` : ""}`);
      }
      y += 2;
    }

    if (visit.nursingInterventions.length > 0) {
      sectionTitle("Intervenções de enfermagem");
      for (const i of visit.nursingInterventions) {
        bodyText(`• ${i.name}${i.notes ? ` — ${i.notes}` : ""}`);
      }
      y += 2;
    }

    if (visit.vitals.length > 0) {
      sectionTitle("Sinais vitais");
      for (const v of visit.vitals) {
        bodyText(`${v.label}: ${v.value}`);
      }
      y += 2;
    }

    if (visit.weight || visit.height) {
      sectionTitle("Peso e altura");
      if (visit.weight) bodyText(`Peso: ${visit.weight}`);
      if (visit.height) bodyText(`Altura: ${visit.height}`);
      if (visit.bmi) bodyText(`IMC: ${visit.bmi}`);
      y += 2;
    }

    if (visit.proceduresPerformed) {
      sectionTitle("Procedimentos realizados");
      bodyText(visit.proceduresPerformed);
    }

    if (visit.observations) {
      sectionTitle("Nota geral da visita");
      bodyText(visit.observations);
    }

    if (visit.visitNotes) {
      sectionTitle("Notas do agendamento");
      bodyText(visit.visitNotes);
    }

    if (visit.photoIds.length > 0) {
      sectionTitle("Fotos anexadas");
      const imgSize = 55;
      const gap = 6;
      let x = marginX;

      for (const photoId of visit.photoIds) {
        const image = await fetchImageDataUrl(photoId);
        if (!image) continue;

        if (x + imgSize > pageWidth - marginX) {
          x = marginX;
          y += imgSize + gap;
        }
        if (y + imgSize + gap > pageHeight - 15) {
          doc.addPage();
          y = 15;
          x = marginX;
        }

        try {
          doc.addImage(image.dataUrl, image.format, x, y, imgSize, imgSize);
        } catch {
          // formato de imagem não suportado pelo jsPDF — ignora
        }
        x += imgSize + gap;
      }
      y += imgSize + gap;
    }

    // Espaço para assinatura do profissional (útil se o relatório for entregue ao utente/família)
    const signatureBlockHeight = 34;
    ensureSpace(signatureBlockHeight);
    y += 14;
    const lineWidth = 75;
    doc.setDrawColor(...DARK);
    doc.line(marginX, y, marginX + lineWidth, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(visit.signedByName ?? visit.nurseName ?? "Enfermeiro(a) responsável", marginX, y);
    y += 4;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...STONE_TEXT);
    doc.text(
      `Assinatura do profissional de enfermagem${visit.signedAt ? ` · ${visit.signedAt}` : ""}`,
      marginX,
      y
    );

    const fileDate = visit.scheduledDate.replace(/[/,: ]/g, "-");
    doc.save(`relatorio-visita-${visit.patientName.replace(/\s+/g, "_")}-${fileDate}.pdf`);
  }

  return (
    <button type="button" onClick={handleDownload} className={buttonStyles.secondary}>
      <Download size={16} /> Exportar relatório
    </button>
  );
}
