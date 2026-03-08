import { DollarSign, Package, TrendingUp, Star, Eye } from "lucide-react";

interface SummaryCardsProps {
  capitalInvesti: number;
  valeurStock: number;
  beneficeEstime: number;
  plusRentable: { nom: string; margePourcent: number } | null;
  aSurveiller: { nom: string } | null;
  totalProduits: number;
  alertCount: number;
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
}: SummaryCardsProps) {
  return (
    <div className="space-y-3">
      {/* Counters */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 bg-card border rounded-full px-3 py-1.5 font-medium">
          <Package className="h-3.5 w-3.5" />
          {totalProduits} produit{totalProduits !== 1 ? "s" : ""}
        </span>
        {alertCount > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-destructive/10 border border-destructive/30 text-destructive rounded-full px-3 py-1.5 font-bold">
            {alertCount} alerte{alertCount !== 1 ? "s" : ""}
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
            <p className="text-xs text-muted-foreground">Capital investi</p>
            <p className="text-lg font-bold">{formatHTG(capitalInvesti)}</p>
          </div>
        </div>
        <div className="rounded-xl bg-card border p-4 flex items-center gap-3">
          <div className="rounded-lg bg-secondary p-2.5">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valeur du stock</p>
            <p className="text-lg font-bold">{formatHTG(valeurStock)}</p>
          </div>
        </div>
        <div className="rounded-xl bg-card border p-4 flex items-center gap-3">
          <div className={`rounded-lg p-2.5 ${beneficeEstime >= 0 ? "bg-success/10" : "bg-destructive/10"}`}>
            <TrendingUp className={`h-5 w-5 ${beneficeEstime >= 0 ? "text-success" : "text-destructive"}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Bénéfice estimé</p>
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
                <p className="text-[11px] text-muted-foreground">Plus rentable</p>
                <p className="text-sm font-bold truncate">{plusRentable.nom}</p>
                <p className="text-[11px] text-success font-semibold">
                  {plusRentable.margePourcent.toFixed(0)}% de marge
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
                <p className="text-[11px] text-muted-foreground">À surveiller</p>
                <p className="text-sm font-bold truncate text-destructive">{aSurveiller.nom}</p>
                <p className="text-[11px] text-muted-foreground">Stock critique</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
