import { DollarSign, Package, TrendingUp } from "lucide-react";

interface SummaryCardsProps {
  capitalInvesti: number;
  valeurStock: number;
  beneficeEstime: number;
}

function formatHTG(amount: number) {
  return amount.toLocaleString("fr-HT", { minimumFractionDigits: 0 }) + " HTG";
}

export function SummaryCards({ capitalInvesti, valeurStock, beneficeEstime }: SummaryCardsProps) {
  return (
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
  );
}
