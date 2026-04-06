import { useState, useMemo } from "react";
import { Product, Sale } from "@/types/product";
import { X, Calendar, TrendingUp, ShoppingCart, Package, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportPdf } from "@/components/ReportPdf";

type ReportPeriod = "daily" | "weekly" | "monthly" | "yearly";

interface ReportSectionProps {
  products: Product[];
  sales: Sale[];
  capitalInvesti: number;
  valeurStock: number;
  beneficeEstime: number;
  t: (key: string) => string;
  toUSD: (htg: number) => number;
  onClose: () => void;
}

function formatHTG(amount: number) {
  return amount.toLocaleString("fr-HT", { minimumFractionDigits: 0 }) + " HTG";
}

function getDateRange(period: ReportPeriod): Date {
  const now = new Date();
  switch (period) {
    case "daily":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "weekly": {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "monthly":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "yearly":
      return new Date(now.getFullYear(), 0, 1);
  }
}

export function ReportSection({ products, sales, capitalInvesti, valeurStock, beneficeEstime, t, toUSD, onClose }: ReportSectionProps) {
  const [period, setPeriod] = useState<ReportPeriod>("daily");

  const periods: { id: ReportPeriod; labelKey: string }[] = [
    { id: "daily", labelKey: "report_daily" },
    { id: "weekly", labelKey: "report_weekly" },
    { id: "monthly", labelKey: "report_monthly" },
    { id: "yearly", labelKey: "report_yearly" },
  ];

  const filteredSales = useMemo(() => {
    const start = getDateRange(period);
    return sales.filter((s) => new Date(s.date) >= start);
  }, [sales, period]);

  const stats = useMemo(() => {
    const revenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const itemsSold = filteredSales.reduce((sum, s) => sum + s.quantite, 0);
    const avgSale = filteredSales.length > 0 ? revenue / filteredSales.length : 0;

    // Top product
    const productMap = new Map<string, { name: string; total: number }>();
    filteredSales.forEach((s) => {
      const existing = productMap.get(s.productId) || { name: s.productName, total: 0 };
      existing.total += s.total;
      productMap.set(s.productId, existing);
    });
    let topProduct: { name: string; total: number } | null = null;
    productMap.forEach((v) => {
      if (!topProduct || v.total > topProduct.total) topProduct = v;
    });

    return { revenue, transactions: filteredSales.length, itemsSold, avgSale, topProduct };
  }, [filteredSales]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">{t("reports")}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Period tabs */}
        <div className="flex gap-1.5 bg-muted rounded-lg p-1">
          {periods.map(({ id, labelKey }) => (
            <button
              key={id}
              onClick={() => setPeriod(id)}
              className={`flex-1 text-xs font-medium py-2 px-1 rounded-md transition-all duration-200 ${
                period === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        {filteredSales.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-2">
            <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t("report_no_sales")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Revenue */}
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-5 text-center space-y-1">
              <p className="text-xs text-muted-foreground">{t("report_revenue")}</p>
              <p className="text-2xl font-bold text-primary">{formatHTG(stats.revenue)}</p>
              <p className="text-xs text-muted-foreground">~${toUSD(stats.revenue).toFixed(2)}</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-card border p-3 text-center">
                <ShoppingCart className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-bold">{stats.transactions}</p>
                <p className="text-[10px] text-muted-foreground">{t("report_transactions")}</p>
              </div>
              <div className="rounded-xl bg-card border p-3 text-center">
                <Package className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-bold">{stats.itemsSold}</p>
                <p className="text-[10px] text-muted-foreground">{t("report_items_sold")}</p>
              </div>
              <div className="rounded-xl bg-card border p-3 text-center">
                <TrendingUp className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-bold">{formatHTG(Math.round(stats.avgSale))}</p>
                <p className="text-[10px] text-muted-foreground">{t("report_avg_sale")}</p>
              </div>
            </div>

            {/* Top product */}
            {stats.topProduct && (
              <div className="rounded-xl bg-card border p-4 flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2.5">
                  <Star className="h-5 w-5 text-success" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{t("report_top_product")}</p>
                  <p className="text-sm font-bold truncate">{stats.topProduct.name}</p>
                  <p className="text-xs text-success font-semibold">{formatHTG(stats.topProduct.total)}</p>
                </div>
              </div>
            )}

            {/* Sales list */}
            <div className="space-y-1.5">
              {filteredSales.slice(0, 20).map((sale) => (
                <div key={sale.id} className="rounded-lg bg-card border px-3 py-2 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{sale.productName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      ×{sale.quantite} · {new Date(sale.date).toLocaleString("fr-HT", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>
                  <p className="text-sm font-bold shrink-0 ml-2">{formatHTG(sale.total)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
