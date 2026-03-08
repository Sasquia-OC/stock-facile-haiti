import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, CheckCircle } from "lucide-react";
import { Product } from "@/types/product";
import { toast } from "sonner";

interface AddProductFormProps {
  onAdd: (product: Omit<Product, "id" | "dateAjout">) => void;
}

export function AddProductForm({ onAdd }: AddProductFormProps) {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [quantite, setQuantite] = useState("");
  const [prixAchat, setPrixAchat] = useState("");
  const [prixVente, setPrixVente] = useState("");
  const [seuilAlerte, setSeuilAlerte] = useState("5");

  const reset = () => {
    setNom("");
    setQuantite("");
    setPrixAchat("");
    setPrixVente("");
    setSeuilAlerte("5");
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
    });
    toast.success(`"${nom.trim()}" ajouté au stock !`, {
      icon: <CheckCircle className="h-4 w-4 text-success" />,
    });
    reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full gap-2 h-12 text-base">
        <Plus className="h-5 w-5" /> Ajouter un produit
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Nouveau produit</h3>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setOpen(false); reset(); }}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <Label htmlFor="nom" className="text-sm">Nom du produit</Label>
        <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Riz 25kg" className="mt-1.5 h-11" required maxLength={100} />
      </div>

      <div>
        <Label htmlFor="quantite" className="text-sm">Quantité</Label>
        <Input id="quantite" type="number" min="0" value={quantite} onChange={(e) => setQuantite(e.target.value)} placeholder="0" className="mt-1.5 h-11" required />
      </div>

      <div>
        <Label htmlFor="prixAchat" className="text-sm">Prix d'achat (HTG)</Label>
        <Input id="prixAchat" type="number" min="0" step="any" value={prixAchat} onChange={(e) => setPrixAchat(e.target.value)} placeholder="0" className="mt-1.5 h-11" required />
      </div>

      <div>
        <Label htmlFor="prixVente" className="text-sm">Prix de vente (HTG)</Label>
        <Input id="prixVente" type="number" min="0" step="any" value={prixVente} onChange={(e) => setPrixVente(e.target.value)} placeholder="0" className="mt-1.5 h-11" required />
      </div>

      <div>
        <Label htmlFor="seuil" className="text-sm">Seuil d'alerte (quantité minimale)</Label>
        <Input id="seuil" type="number" min="1" value={seuilAlerte} onChange={(e) => setSeuilAlerte(e.target.value)} placeholder="5" className="mt-1.5 h-11" />
      </div>

      <Button type="submit" className="w-full gap-2 h-12 text-base">
        <Plus className="h-5 w-5" /> Ajouter
      </Button>
    </form>
  );
}
