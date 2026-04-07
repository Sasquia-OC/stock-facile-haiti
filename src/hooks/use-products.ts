import { useState, useEffect, useMemo, useCallback } from "react";
import { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { offlineAwareOperation } from "@/hooks/use-offline-sync";

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!user) { setProducts([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setProducts(data.map((p) => ({
        id: p.id,
        nom: p.nom,
        quantite: p.quantite,
        prixAchat: Number(p.prix_achat),
        prixVente: Number(p.prix_vente),
        seuilAlerte: p.seuil_alerte,
        capitalInvesti: Number((p as any).capital_investi ?? 0),
        dateAjout: p.created_at,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addProduct = async (product: Omit<Product, "id" | "dateAjout">) => {
    if (!user) return;
    const dbData: Record<string, any> = {
      user_id: user.id,
      nom: product.nom,
      quantite: product.quantite,
      prix_achat: product.prixAchat,
      prix_vente: product.prixVente,
      seuil_alerte: product.seuilAlerte,
      capital_investi: product.capitalInvesti ?? 0,
    };

    // If offline, queue and add optimistically
    const handled = await offlineAwareOperation("products", "insert", dbData);
    if (handled) {
      setProducts((prev) => [{
        id: crypto.randomUUID(),
        nom: product.nom,
        quantite: product.quantite,
        prixAchat: product.prixAchat,
        prixVente: product.prixVente,
        seuilAlerte: product.seuilAlerte,
        capitalInvesti: product.capitalInvesti ?? 0,
        dateAjout: new Date().toISOString(),
      }, ...prev]);
      return;
    }

    const { data, error } = await supabase.from("products").insert(dbData as any).select().single();
    if (!error && data) {
      setProducts((prev) => [{
        id: data.id,
        nom: data.nom,
        quantite: data.quantite,
        prixAchat: Number(data.prix_achat),
        prixVente: Number(data.prix_vente),
        seuilAlerte: data.seuil_alerte,
        capitalInvesti: Number((data as any).capital_investi ?? 0),
        dateAjout: data.created_at,
      }, ...prev]);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.nom !== undefined) dbUpdates.nom = updates.nom;
    if (updates.quantite !== undefined) dbUpdates.quantite = updates.quantite;
    if (updates.prixAchat !== undefined) dbUpdates.prix_achat = updates.prixAchat;
    if (updates.prixVente !== undefined) dbUpdates.prix_vente = updates.prixVente;
    if (updates.seuilAlerte !== undefined) dbUpdates.seuil_alerte = updates.seuilAlerte;

    // Optimistic update
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));

    const handled = await offlineAwareOperation("products", "update", { id, ...dbUpdates });
    if (handled) return;

    const { error } = await supabase.from("products").update(dbUpdates).eq("id", id);
    if (error) {
      // Revert on error - refetch
      fetchProducts();
    }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const capitalInvesti = products.reduce((sum, p) => sum + p.prixAchat * p.quantite, 0);
  const valeurStock = products.reduce((sum, p) => sum + p.prixVente * p.quantite, 0);
  const beneficeEstime = valeurStock - capitalInvesti;

  const productStats = useMemo(() => {
    return products.map((p) => ({
      ...p,
      margeBrute: p.prixVente - p.prixAchat,
      margePourcent: p.prixAchat > 0 ? ((p.prixVente - p.prixAchat) / p.prixAchat) * 100 : 0,
      beneficePotentiel: (p.prixVente - p.prixAchat) * p.quantite,
    }));
  }, [products]);

  const plusRentable = useMemo(() => {
    if (products.length === 0) return null;
    return productStats.reduce((best, p) =>
      p.beneficePotentiel > best.beneficePotentiel ? p : best
    , productStats[0]);
  }, [productStats]);

  const critiques = useMemo(() => {
    return products.filter((p) => p.quantite === 0 || p.quantite <= p.seuilAlerte);
  }, [products]);

  const aSurveiller = useMemo(() => {
    if (critiques.length === 0) return null;
    const critiqueStats = critiques.map((p) => ({
      ...p,
      beneficePotentiel: (p.prixVente - p.prixAchat) * p.quantite,
      margePourcent: p.prixAchat > 0 ? ((p.prixVente - p.prixAchat) / p.prixAchat) * 100 : 0,
    }));
    return critiqueStats.reduce((worst, p) =>
      p.margePourcent > worst.margePourcent ? p : worst
    , critiqueStats[0]);
  }, [critiques]);

  // Stock history from products (simplified - current snapshot)
  const stockHistory = useMemo(() => {
    const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    return [{ date: today, value: valeurStock }];
  }, [valeurStock]);

  return {
    products,
    productStats,
    addProduct,
    updateProduct,
    deleteProduct,
    capitalInvesti,
    valeurStock,
    beneficeEstime,
    plusRentable,
    aSurveiller,
    critiques,
    stockHistory,
    loading,
  };
}
