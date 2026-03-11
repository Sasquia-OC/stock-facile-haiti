import { useState } from "react";
import { Product } from "@/types/product";
import { AlertTriangle, Trash2, Minus, Plus, ChevronDown, ChevronUp, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuickSellDialog } from "@/components/QuickSellDialog";

interface ProductWithStats extends Product {
  margeBrute: number;
  margePourcent: number;
  beneficePotentiel: number;
}

interface ProductListProps {
  products: ProductWithStats[];
  onUpdate: (id: string, updates: Partial<Product>) => void;
  onDelete: (id: string) => void;
  onSale?: (sale: {
    productId: string;
    productName: string;
    quantite: number;
    prixVente: number;
    total: number;
    montantRecu: number;
    monnaie: number;
  }) => void;
  t: (key: string) => string;
  isOwner?: boolean;
}

function formatHTG(amount: number) {
  return amount.toLocaleString("fr-HT", { minimumFractionDigits: 0 }) + " HTG";
}

function getStockStatus(product: Product) {
  if (product.quantite === 0) return "rupture";
  if (product.quantite <= product.seuilAlerte) return "alerte";
  return "ok";
}

export function ProductList({ products, onUpdate, onDelete, onSale, t, isOwner = true }: ProductListProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

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
        const isExpanded = expanded === product.id;
        return (
          <div
            key={product.id}
            className={`rounded-xl border p-3 sm:p-4 bg-card transition-colors ${
              status === "rupture"
                ? "border-destructive/50 bg-destructive/5"
                : status === "alerte"
                ? "border-warning/50 bg-warning/5"
                : ""
            }`}
          >
            {/* Main row: always visible */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
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
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                    <AlertTriangle className="h-3 w-3" /> {t("stockout")}
                  </span>
                )}
                {status === "alerte" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-warning text-warning-foreground">
                    <AlertTriangle className="h-3 w-3" /> {t("low")}
                  </span>
                )}
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  onClick={() => onUpdate(product.id, { quantite: Math.max(0, product.quantite - 1) })}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-8 sm:w-10 text-center font-bold text-sm tabular-nums">
                  {product.quantite}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  onClick={() => onUpdate(product.id, { quantite: product.quantite + 1 })}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Expand toggle + sell button */}
            <div className="flex items-center gap-2 mt-1.5">
              <button
                onClick={() => setExpanded(isExpanded ? null : product.id)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {isExpanded ? t("close") : t("details")}
              </button>
              {onSale && product.quantite > 0 && (
                <QuickSellDialog
                  product={product}
                  onSale={onSale}
                  onUpdateStock={onUpdate}
                  t={t}
                />
              )}
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="mt-2 pt-2 border-t border-border/50 space-y-2">
                {editing === product.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">{t("product_name")}</label>
                        <Input
                          value={editForm.nom ?? product.nom}
                          onChange={(e) => setEditForm((f) => ({ ...f, nom: e.target.value }))}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">{t("quantity")}</label>
                        <Input
                          type="number"
                          value={editForm.quantite ?? product.quantite}
                          onChange={(e) => setEditForm((f) => ({ ...f, quantite: Number(e.target.value) }))}
                          className="h-8 text-xs"
                        />
                      </div>
                      {isOwner && (
                        <>
                          <div>
                            <label className="text-[10px] text-muted-foreground">{t("buy_price")}</label>
                            <Input
                              type="number"
                              value={editForm.prixAchat ?? product.prixAchat}
                              onChange={(e) => setEditForm((f) => ({ ...f, prixAchat: Number(e.target.value) }))}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">{t("sell_price")}</label>
                            <Input
                              type="number"
                              value={editForm.prixVente ?? product.prixVente}
                              onChange={(e) => setEditForm((f) => ({ ...f, prixVente: Number(e.target.value) }))}
                              className="h-8 text-xs"
                            />
                          </div>
                        </>
                      )}
                      <div>
                        <label className="text-[10px] text-muted-foreground">{t("alert_threshold")}</label>
                        <Input
                          type="number"
                          value={editForm.seuilAlerte ?? product.seuilAlerte}
                          onChange={(e) => setEditForm((f) => ({ ...f, seuilAlerte: Number(e.target.value) }))}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => { setEditing(null); setEditForm({}); }}
                      >
                        <X className="h-3 w-3" /> {t("close")}
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => {
                          onUpdate(product.id, editForm);
                          setEditing(null);
                          setEditForm({});
                        }}
                      >
                        <Check className="h-3 w-3" /> {t("save")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {isOwner && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{t("buy")}: {formatHTG(product.prixAchat)}</span>
                        <span>{t("sell")}: {formatHTG(product.prixVente)}</span>
                        <span className="text-success font-medium">
                          {t("margin")}: {formatHTG(product.margeBrute)} ({product.margePourcent.toFixed(0)}%)
                        </span>
                      </div>
                    )}
                    {!isOwner && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{t("sell")}: {formatHTG(product.prixVente)}</span>
                      </div>
                    )}
                    {isOwner && product.beneficePotentiel > 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        {t("potential_profit")}: <span className="font-semibold text-success">{formatHTG(product.beneficePotentiel)}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      {t("alert_threshold")}: {product.seuilAlerte}
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => {
                          setEditing(product.id);
                          setEditForm({});
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                        {t("edit")}
                      </Button>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1"
                          onClick={() => onDelete(product.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t("delete")}
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
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
