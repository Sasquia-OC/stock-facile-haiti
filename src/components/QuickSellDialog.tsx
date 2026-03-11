import { useState } from "react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShoppingCart, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface QuickSellDialogProps {
  product: Product;
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

export function QuickSellDialog({ product, onSale, onUpdateStock, t }: QuickSellDialogProps) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState("1");
  const [montantRecu, setMontantRecu] = useState("");

  const total = product.prixVente * Number(qty || 0);
  const monnaie = Number(montantRecu || 0) - total;

  const handleSale = () => {
    const q = Number(qty);
    if (q <= 0 || q > product.quantite) {
      toast.error("Stock insuffisant !");
      return;
    }

    onSale({
      productId: product.id,
      productName: product.nom,
      quantite: q,
      prixVente: product.prixVente,
      total,
      montantRecu: Number(montantRecu || 0),
      monnaie: Math.max(0, monnaie),
    });

    onUpdateStock(product.id, { quantite: product.quantite - q });

    toast.success(t("sale_success"), {
      icon: <CheckCircle className="h-4 w-4 text-success" />,
    });

    if (monnaie > 0) {
      toast.info(`${t("change")}: ${monnaie.toLocaleString("fr-HT")} HTG`);
    }

    setQty("1");
    setMontantRecu("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1 border-primary/30 text-primary"
          disabled={product.quantite === 0}
        >
          <ShoppingCart className="h-3 w-3" />
          {t("sell_product")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">
            {t("sell_product")} — {product.nom}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm">{t("qty_to_sell")}</Label>
            <Input
              type="number"
              min="1"
              max={product.quantite}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="mt-1.5 h-11"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              {product.quantite} {t("remaining")}
            </p>
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
            disabled={!qty || Number(qty) <= 0 || Number(qty) > product.quantite}
          >
            <CheckCircle className="h-5 w-5" />
            {t("confirm_sale")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
