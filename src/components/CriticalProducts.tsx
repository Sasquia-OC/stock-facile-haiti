import { Product } from "@/types/product";
import { AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface CriticalProductsProps {
  products: Product[];
  t: (key: string) => string;
  onRestock?: (id: string) => void;
}

export function CriticalProducts({ products, t, onRestock }: CriticalProductsProps) {
  const ruptures = products.filter((p) => p.quantite === 0);
  const lowStock = products.filter((p) => p.quantite > 0);

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-success/40 bg-success/5 p-5 flex items-center gap-3">
        <div className="rounded-lg bg-success/10 p-2.5">
          <ShieldCheck className="h-5 w-5 text-success" />
        </div>
        <div>
          <p className="font-bold text-sm text-success">{t("all_clear")}</p>
          <p className="text-xs text-muted-foreground">{t("all_clear_desc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Ruptures - Red urgent banners */}
      {ruptures.length > 0 && (
        <div className="rounded-xl border-2 border-destructive bg-destructive/10 p-4 animate-pulse-subtle">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="text-sm font-bold text-destructive uppercase tracking-wide">
              {t("stockout_alert")} ({ruptures.length})
            </h2>
          </div>
          <div className="space-y-2">
            {ruptures.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-destructive/5 border border-destructive/30 rounded-lg px-3 py-2.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-3 w-3 rounded-full bg-destructive animate-pulse shrink-0" />
                  <span className="font-semibold text-sm truncate">{p.nom}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground shrink-0">
                    {t("stockout")}
                  </span>
                </div>
                {onRestock && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="shrink-0 h-8 text-xs gap-1"
                    onClick={() => onRestock(p.id)}
                  >
                    <RefreshCw className="h-3 w-3" />
                    {t("restock")}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low stock - Orange with progress bars */}
      {lowStock.length > 0 && (
        <div className="rounded-xl border border-warning/40 bg-warning/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h2 className="text-sm font-bold text-warning">
              {t("low_stock_alert")} ({lowStock.length})
            </h2>
          </div>
          <div className="space-y-2.5">
            {lowStock.map((p) => {
              const pct = Math.min(100, (p.quantite / Math.max(p.seuilAlerte, 1)) * 100);
              return (
                <div
                  key={p.id}
                  className="bg-card border border-warning/20 rounded-lg px-3 py-2.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{p.nom}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-warning text-warning-foreground shrink-0">
                      {p.quantite}/{p.seuilAlerte}
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className="h-2 bg-warning/20 [&>div]:bg-warning"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
