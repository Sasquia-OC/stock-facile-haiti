import { Sale } from "@/types/product";
import { ShoppingCart, Calendar } from "lucide-react";

interface SalesHistoryProps {
  sales: Sale[];
  t: (key: string) => string;
}

function formatHTG(amount: number) {
  return amount.toLocaleString("fr-HT", { minimumFractionDigits: 0 }) + " HTG";
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SalesHistory({ sales, t }: SalesHistoryProps) {
  if (sales.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ShoppingCart className="mx-auto h-12 w-12 mb-3 opacity-40" />
        <p className="text-sm">{t("no_sales_yet")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-sm flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        {t("sales_history")}
      </h3>
      {sales.map((sale) => (
        <div
          key={sale.id}
          className="rounded-xl border bg-card p-3 flex items-center justify-between gap-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{sale.productName}</p>
            <p className="text-[11px] text-muted-foreground">
              {sale.quantite} × {formatHTG(sale.prixVente)}
            </p>
            <p className="text-[10px] text-muted-foreground">{formatDate(sale.date)}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-primary">{formatHTG(sale.total)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
