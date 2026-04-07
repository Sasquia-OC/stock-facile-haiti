import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, CheckCircle } from "lucide-react";
import { Product } from "@/types/product";
import { toast } from "sonner";

interface AddProductFormProps {
  onAdd: (product: Omit<Product, "id" | "dateAjout">) => void;
  t: (key: string) => string;
}

export function AddProductForm({ onAdd, t }: AddProductFormProps) {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [quantite, setQuantite] = useState("");
  const [prixAchat, setPrixAchat] = useState("");
  const [prixVente, setPrixVente] = useState("");
  const [seuilAlerte, setSeuilAlerte] = useState("5");
  const [capitalInvesti, setCapitalInvesti] = useState("");

  const reset = () => {
    setNom("");
    setQuantite("");
    setPrixAchat("");
    setPrixVente("");
    setSeuilAlerte("5");
    setCapitalInvesti("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !quantite || !prixAchat || !prixVente) return;
    onAdd({
      nom: nom.trim(),
      quantite: Number(quantite),
      prixAchat: Number(prixAchat),
      prixVente: Number(prixVente),
      seuilAlerte: Number(seuilAlerte) || 5,
      capitalInvesti: Number(capitalInvesti) || 0,
    });
    toast.success(`"${nom.trim()}" ${t("added_to_stock")}`, {
      icon: <CheckCircle className="h-4 w-4 text-success" />,
    });
    reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" className="w-full gap-2 h-12 text-base border-dashed border-2">
        <Plus className="h-5 w-5" /> {t("add_product")}
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t("new_product")}</h3>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setOpen(false); reset(); }}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <Label htmlFor="nom" className="text-sm">{t("product_name")}</Label>
        <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Riz 25kg" className="mt-1.5 h-11" required maxLength={100} />
      </div>

      <div>
        <Label htmlFor="quantite" className="text-sm">{t("quantity")}</Label>
        <Input id="quantite" type="number" min="0" value={quantite} onChange={(e) => setQuantite(e.target.value)} placeholder="0" className="mt-1.5 h-11" required />
      </div>

      <div>
        <Label htmlFor="prixAchat" className="text-sm">{t("buy_price")} (HTG)</Label>
        <Input id="prixAchat" type="number" min="0" step="any" value={prixAchat} onChange={(e) => setPrixAchat(e.target.value)} placeholder="0" className="mt-1.5 h-11" required />
      </div>

      <div>
        <Label htmlFor="prixVente" className="text-sm">{t("sell_price")} (HTG)</Label>
        <Input id="prixVente" type="number" min="0" step="any" value={prixVente} onChange={(e) => setPrixVente(e.target.value)} placeholder="0" className="mt-1.5 h-11" required />
      </div>

      <div>
        <Label htmlFor="seuil" className="text-sm">{t("alert_threshold")}</Label>
        <Input id="seuil" type="number" min="1" value={seuilAlerte} onChange={(e) => setSeuilAlerte(e.target.value)} placeholder="5" className="mt-1.5 h-11" />
      </div>

      <div>
        <Label htmlFor="capitalInvesti" className="text-sm">{t("capital_invested")} (HTG)</Label>
        <Input id="capitalInvesti" type="number" min="0" step="any" value={capitalInvesti} onChange={(e) => setCapitalInvesti(e.target.value)} placeholder="0" className="mt-1.5 h-11" />
      </div>

      <Button type="submit" className="w-full gap-2 h-12 text-base">
        <Plus className="h-5 w-5" /> {t("add")}
      </Button>
    </form>
  );
}
