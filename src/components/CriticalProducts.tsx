import { Product } from "@/types/product";
import { AlertTriangle } from "lucide-react";

interface CriticalProductsProps {
  products: Product[];
}

export function CriticalProducts({ products }: CriticalProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <h2 className="text-sm font-bold text-destructive">
          Produits critiques ({products.length})
        </h2>
      </div>
      <div className="space-y-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between text-sm bg-card rounded-lg px-3 py-2 border border-destructive/20"
          >
            <span className="font-medium truncate">{p.nom}</span>
            <span
              className={`font-bold text-xs px-2 py-0.5 rounded-full ${
                p.quantite === 0
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-warning text-warning-foreground"
              }`}
            >
              {p.quantite === 0 ? "Rupture" : `${p.quantite} restant${p.quantite > 1 ? "s" : ""}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
