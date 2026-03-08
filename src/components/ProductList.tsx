import { Product } from "@/types/product";
import { AlertTriangle, Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductWithStats extends Product {
  margeBrute: number;
  margePourcent: number;
  beneficePotentiel: number;
}

interface ProductListProps {
  products: ProductWithStats[];
  onUpdate: (id: string, updates: Partial<Product>) => void;
  onDelete: (id: string) => void;
  t: (key: string) => string;
}

function formatHTG(amount: number) {
  return amount.toLocaleString("fr-HT", { minimumFractionDigits: 0 }) + " HTG";
}

function getStockStatus(product: Product) {
  if (product.quantite === 0) return "rupture";
  if (product.quantite <= product.seuilAlerte) return "alerte";
  return "ok";
}

export function ProductList({ products, onUpdate, onDelete, t }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <PackageIcon className="mx-auto h-12 w-12 mb-3 opacity-40" />
        <p className="text-sm">{t("no_products")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((product) => {
        const status = getStockStatus(product);
        return (
          <div
            key={product.id}
            className={`rounded-xl border p-4 bg-card transition-colors ${
              status === "rupture"
                ? "border-destructive/50 bg-destructive/5"
                : status === "alerte"
                ? "border-warning/50 bg-warning/5"
                : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`shrink-0 h-2.5 w-2.5 rounded-full ${
                      status === "rupture"
                        ? "bg-destructive"
                        : status === "alerte"
                        ? "bg-warning"
                        : "bg-success"
                    }`}
                  />
                  <h3 className="font-semibold text-sm truncate">{product.nom}</h3>
                  {status === "rupture" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                      <AlertTriangle className="h-3 w-3" /> {t("stockout")}
                    </span>
                  )}
                  {status === "alerte" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning text-warning-foreground">
                      <AlertTriangle className="h-3 w-3" /> {t("low")}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                  <span>{t("buy")}: {formatHTG(product.prixAchat)}</span>
                  <span>{t("sell")}: {formatHTG(product.prixVente)}</span>
                  <span className="text-success font-medium">
                    {t("margin")}: {formatHTG(product.margeBrute)} ({product.margePourcent.toFixed(0)}%)
                  </span>
                </div>
                {product.beneficePotentiel > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {t("potential_profit")}: <span className="font-semibold text-success">{formatHTG(product.beneficePotentiel)}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => onUpdate(product.id, { quantite: Math.max(0, product.quantite - 1) })}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-bold text-sm tabular-nums">
                  {product.quantite}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => onUpdate(product.id, { quantite: product.quantite + 1 })}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PackageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16.5 9.4 7.55 4.24"/>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" x2="12" y1="22.08" y2="12"/>
    </svg>
  );
}
