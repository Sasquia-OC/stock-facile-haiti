import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { Product, Sale } from "@/types/product";
import { toast } from "sonner";

interface ReportPdfProps {
  products: Product[];
  sales: Sale[];
  capitalInvesti: number;
  valeurStock: number;
  beneficeEstime: number;
  t: (key: string) => string;
  toUSD: (htg: number) => number;
}

function formatHTG(amount: number) {
  return amount.toLocaleString("fr-HT", { minimumFractionDigits: 0 }) + " HTG";
}

export function ReportPdf({ products, sales, capitalInvesti, valeurStock, beneficeEstime, t, toUSD }: ReportPdfProps) {
  const [loading, setLoading] = useState(false);

  const generatePdf = async () => {
    setLoading(true);
    try {
      // Dynamic import for jspdf to reduce bundle size
      const { default: jsPDF } = await import("jspdf");

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;

      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Ayiti Biznis", margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
      doc.text(`Rapport complet — ${dateStr}`, margin, y);
      doc.setTextColor(0);
      y += 4;
      doc.setDrawColor(0, 56, 147);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 12;

      // Financial Summary
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Résumé financier", margin, y);
      y += 8;

      const financials = [
        ["Capital investi", formatHTG(capitalInvesti), `~$${toUSD(capitalInvesti).toFixed(2)}`],
        ["Valeur du stock", formatHTG(valeurStock), `~$${toUSD(valeurStock).toFixed(2)}`],
        ["Bénéfice estimé", formatHTG(beneficeEstime), `~$${toUSD(beneficeEstime).toFixed(2)}`],
      ];

      doc.setFontSize(10);
      financials.forEach(([label, htg, usd]) => {
        doc.setFont("helvetica", "normal");
        doc.text(label, margin, y);
        doc.setFont("helvetica", "bold");
        doc.text(htg, margin + 55, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(usd, margin + 110, y);
        doc.setTextColor(0);
        y += 6;
      });
      y += 8;

      // Products table
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Inventaire (${products.length} produits)`, margin, y);
      y += 8;

      // Table header
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(0, 56, 147);
      doc.setTextColor(255);
      doc.rect(margin, y - 4, contentWidth, 7, "F");
      const cols = [margin + 2, margin + 50, margin + 70, margin + 95, margin + 120, margin + 145];
      doc.text("Produit", cols[0], y);
      doc.text("Qté", cols[1], y);
      doc.text("Achat", cols[2], y);
      doc.text("Vente", cols[3], y);
      doc.text("Marge", cols[4], y);
      doc.text("Statut", cols[5], y);
      doc.setTextColor(0);
      y += 6;

      doc.setFont("helvetica", "normal");
      products.forEach((p, i) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        if (i % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, y - 3.5, contentWidth, 5.5, "F");
        }
        const marge = p.prixAchat > 0 ? ((p.prixVente - p.prixAchat) / p.prixAchat * 100).toFixed(0) + "%" : "—";
        const status = p.quantite === 0 ? "RUPTURE" : p.quantite <= p.seuilAlerte ? "BAS" : "OK";

        doc.text(p.nom.substring(0, 25), cols[0], y);
        doc.text(String(p.quantite), cols[1], y);
        doc.text(formatHTG(p.prixAchat), cols[2], y);
        doc.text(formatHTG(p.prixVente), cols[3], y);
        doc.text(marge, cols[4], y);

        if (status === "RUPTURE") doc.setTextColor(220, 38, 38);
        else if (status === "BAS") doc.setTextColor(234, 88, 12);
        else doc.setTextColor(22, 163, 74);
        doc.text(status, cols[5], y);
        doc.setTextColor(0);
        y += 5.5;
      });
      y += 10;

      // Sales
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Historique des ventes (${sales.length})`, margin, y);
      y += 8;

      if (sales.length === 0) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Aucune vente enregistrée", margin, y);
      } else {
        // Table header
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setFillColor(0, 56, 147);
        doc.setTextColor(255);
        doc.rect(margin, y - 4, contentWidth, 7, "F");
        const sCols = [margin + 2, margin + 50, margin + 80, margin + 105, margin + 135];
        doc.text("Produit", sCols[0], y);
        doc.text("Qté", sCols[1], y);
        doc.text("Prix unit.", sCols[2], y);
        doc.text("Total", sCols[3], y);
        doc.text("Date", sCols[4], y);
        doc.setTextColor(0);
        y += 6;

        doc.setFont("helvetica", "normal");
        const totalRevenu = sales.reduce((s, sale) => s + sale.total, 0);

        sales.slice(0, 100).forEach((s, i) => {
          if (y > 270) { doc.addPage(); y = 20; }
          if (i % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, y - 3.5, contentWidth, 5.5, "F");
          }
          doc.text(s.productName.substring(0, 25), sCols[0], y);
          doc.text(String(s.quantite), sCols[1], y);
          doc.text(formatHTG(s.prixVente), sCols[2], y);
          doc.text(formatHTG(s.total), sCols[3], y);
          doc.text(new Date(s.date).toLocaleDateString("fr-FR"), sCols[4], y);
          y += 5.5;
        });

        y += 4;
        doc.setFont("helvetica", "bold");
        doc.text(`Total revenus: ${formatHTG(totalRevenu)} (~$${toUSD(totalRevenu).toFixed(2)})`, margin, y);
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150);
        doc.text(`Ayiti Biznis — Page ${i}/${pageCount}`, margin, 290);
        doc.text("© Creovate", pageWidth - margin - 20, 290);
      }

      doc.save(`ayiti-biznis-rapport-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success(t("report_pdf_success"));
    } catch (e) {
      console.error("PDF generation error:", e);
      toast.error(t("report_pdf_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={generatePdf} disabled={loading} variant="outline" className="gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      {t("report_pdf")}
    </Button>
  );
}
