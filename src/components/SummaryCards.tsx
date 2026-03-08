import { DollarSign, Package, TrendingUp, Star, Eye, ShoppingCart, Users } from "lucide-react";

interface SummaryCardsProps {
  capitalInvesti: number;
  valeurStock: number;
  beneficeEstime: number;
  plusRentable: { nom: string; margePourcent: number } | null;
  aSurveiller: { nom: string } | null;
  totalProduits: number;
  alertCount: number;
  gainsDuJour: number;
  clientsDuJour: number;
  t: (key: string) => string;
  toUSD: (htg: number) => number;
}

function formatHTG(amount: number) {
  return amount.toLocaleString("fr-HT", { minimumFractionDigits: 0 }) + " HTG";
}

export function SummaryCards({
  capitalInvesti,
  valeurStock,
  beneficeEstime,
  plusRentable,
  aSurveiller,
  totalProduits,
  alertCount,
  gainsDuJour,
  clientsDuJour,
  t,
  toUSD,
}: SummaryCardsProps) {
  return (
    <div className="space-y-3">
      {/* Daily stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary p-2.5">
            <ShoppingCart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("gains_today")}</p>
            <p className="text-lg font-bold">{formatHTG(gainsDuJour)}</p>
            <p className="text-[10px] text-muted-foreground">
              ~${toUSD(gainsDuJour).toFixed(2)} USD
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-card border p-4 flex items-center gap-3">
          <div className="rounded-lg bg-secondary p-2.5">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("clients_today")}</p>
            <p className="text-lg font-bold">{clientsDuJour}</p>
          </div>
        </div>
      </div>

      {/* Counters */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 bg-card border rounded-full px-3 py-1.5 font-medium">
          <Package className="h-3.5 w-3.5" />
          {totalProduits} {t("products")}
        </span>
        {alertCount > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-destructive/10 border border-destructive/30 text-destructive rounded-full px-3 py-1.5 font-bold">
            {alertCount} {t("alerts")}
          </span>
        )}
      </div>

      {/* Financial cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-card border p-4 flex items-center gap-3">
          <div className="rounded-lg bg-secondary p-2.5">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("capital_invested")}</p>
            <p className="text-lg font-bold">{formatHTG(capitalInvesti)}</p>
          </div>
        </div>
        <div className="rounded-xl bg-card border p-4 flex items-center gap-3">
          <div className="rounded-lg bg-secondary p-2.5">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("stock_value")}</p>
            <p className="text-lg font-bold">{formatHTG(valeurStock)}</p>
          </div>
        </div>
        <div className="rounded-xl bg-card border p-4 flex items-center gap-3">
          <div className={`rounded-lg p-2.5 ${beneficeEstime >= 0 ? "bg-success/10" : "bg-destructive/10"}`}>
            <TrendingUp className={`h-5 w-5 ${beneficeEstime >= 0 ? "text-success" : "text-destructive"}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("estimated_profit")}</p>
            <p className={`text-lg font-bold ${beneficeEstime >= 0 ? "text-success" : "text-destructive"}`}>
              {formatHTG(beneficeEstime)}
            </p>
          </div>
        </div>
      </div>

      {/* Smart indicators */}
      {(plusRentable || aSurveiller) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plusRentable && (
            <div className="rounded-xl bg-card border p-3 flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <Star className="h-4 w-4 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">{t("most_profitable")}</p>
                <p className="text-sm font-bold truncate">{plusRentable.nom}</p>
                <p className="text-[11px] text-success font-semibold">
                  {plusRentable.margePourcent.toFixed(0)}% {t("margin")}
                </p>
              </div>
            </div>
          )}
          {aSurveiller && (
            <div className="rounded-xl bg-card border border-destructive/30 p-3 flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2">
                <Eye className="h-4 w-4 text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">{t("to_watch")}</p>
                <p className="text-sm font-bold truncate text-destructive">{aSurveiller.nom}</p>
                <p className="text-[11px] text-muted-foreground">{t("critical_stock")}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
