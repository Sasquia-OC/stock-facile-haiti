import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, X, CheckCircle } from "lucide-react";
import { Product } from "@/types/product";
import { toast } from "sonner";

interface SalesModuleProps {
  products: Product[];
  onSale: (sale: {
    productId: string;
    productName: string;
    quantite: number;
    prixVente: number;
    total: number;
    montantRecu: number;
    monnaie: number;
  }) => void;
  onUpdateStock: (id: string, updates: Partial<Product>) => void;
  t: (key: string) => string;
}

export function SalesModule({ products, onSale, onUpdateStock, t }: SalesModuleProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty] = useState("1");
  const [montantRecu, setMontantRecu] = useState("");

  const selected = products.find((p) => p.id === selectedId);
  const total = selected ? selected.prixVente * Number(qty || 0) : 0;
  const monnaie = Number(montantRecu || 0) - total;

  const reset = () => {
    setSelectedId("");
    setQty("1");
    setMontantRecu("");
  };

  const handleSale = () => {
    if (!selected || !qty || Number(qty) <= 0) return;
    const q = Number(qty);
    if (q > selected.quantite) {
      toast.error("Stock insuffisant !");
      return;
    }

    onSale({
      productId: selected.id,
      productName: selected.nom,
      quantite: q,
      prixVente: selected.prixVente,
      total,
      montantRecu: Number(montantRecu || 0),
      monnaie: Math.max(0, monnaie),
    });

    onUpdateStock(selected.id, { quantite: selected.quantite - q });

    toast.success(t("sale_success"), {
      icon: <CheckCircle className="h-4 w-4 text-success" />,
    });

    if (monnaie > 0) {
      toast.info(`${t("change")}: ${monnaie.toLocaleString("fr-HT")} HTG`);
    }

    reset();
    setOpen(false);
  };

  const availableProducts = products.filter((p) => p.quantite > 0);

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="w-full gap-3 h-14 text-base border-2 border-primary/30"
        size="lg"
      >
        <ShoppingCart className="h-6 w-6" />
        {t("pos")}
      </Button>
    );
  }

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h3 className="font-bold">{t("pos")}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => { setOpen(false); reset(); }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <Label className="text-sm">{t("select_product")}</Label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="mt-1.5 flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">{t("select_product")}...</option>
          {availableProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom} — {p.prixVente} HTG ({p.quantite} {t("remaining")})
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <>
          <div>
            <Label className="text-sm">{t("qty_to_sell")}</Label>
            <Input
              type="number"
              min="1"
              max={selected.quantite}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="mt-1.5 h-11"
            />
          </div>

          <div className="rounded-lg bg-primary/5 p-4 text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-primary">
              {total.toLocaleString("fr-HT")} HTG
            </p>
          </div>

          <div>
            <Label className="text-sm">{t("amount_received")}</Label>
            <Input
              type="number"
              min="0"
              value={montantRecu}
              onChange={(e) => setMontantRecu(e.target.value)}
              placeholder="0"
              className="mt-1.5 h-11"
            />
          </div>

          {Number(montantRecu) > 0 && monnaie >= 0 && (
            <div className="rounded-lg bg-success/10 p-4 text-center">
              <p className="text-xs text-muted-foreground">{t("change")}</p>
              <p className="text-2xl font-bold text-success">
                {monnaie.toLocaleString("fr-HT")} HTG
              </p>
            </div>
          )}

          <Button
            onClick={handleSale}
            className="w-full h-12 text-base gap-2"
            disabled={!qty || Number(qty) <= 0 || Number(qty) > selected.quantite}
          >
            <CheckCircle className="h-5 w-5" />
            {t("confirm_sale")}
          </Button>
        </>
      )}
    </div>
  );
}
