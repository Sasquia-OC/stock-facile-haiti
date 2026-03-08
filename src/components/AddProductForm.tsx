import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { Product } from "@/types/product";

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
    reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full gap-2">
        <Plus className="h-4 w-4" /> Ajouter un produit
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Nouveau produit</h3>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setOpen(false); reset(); }}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div>
        <Label htmlFor="nom" className="text-xs">Nom du produit</Label>
        <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Riz 25kg" className="mt-1" required maxLength={100} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="quantite" className="text-xs">Quantité</Label>
          <Input id="quantite" type="number" min="0" value={quantite} onChange={(e) => setQuantite(e.target.value)} placeholder="0" className="mt-1" required />
        </div>
        <div>
          <Label htmlFor="seuil" className="text-xs">Seuil d'alerte</Label>
          <Input id="seuil" type="number" min="1" value={seuilAlerte} onChange={(e) => setSeuilAlerte(e.target.value)} placeholder="5" className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="prixAchat" className="text-xs">Prix d'achat (HTG)</Label>
          <Input id="prixAchat" type="number" min="0" step="any" value={prixAchat} onChange={(e) => setPrixAchat(e.target.value)} placeholder="0" className="mt-1" required />
        </div>
        <div>
          <Label htmlFor="prixVente" className="text-xs">Prix de vente (HTG)</Label>
          <Input id="prixVente" type="number" min="0" step="any" value={prixVente} onChange={(e) => setPrixVente(e.target.value)} placeholder="0" className="mt-1" required />
        </div>
      </div>
      <Button type="submit" className="w-full gap-2">
        <Plus className="h-4 w-4" /> Ajouter
      </Button>
    </form>
  );
}
