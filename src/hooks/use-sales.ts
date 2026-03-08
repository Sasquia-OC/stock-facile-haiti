import { useState, useEffect, useMemo, useCallback } from "react";
import { Sale } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function useSales() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);

  const fetchSales = useCallback(async () => {
    if (!user) { setSales([]); return; }
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setSales(data.map((s) => ({
        id: s.id,
        productId: s.product_id || "",
        productName: s.product_name,
        quantite: s.quantite,
        prixVente: Number(s.prix_vente),
        total: Number(s.total),
        montantRecu: 0,
        monnaie: 0,
        date: s.created_at,
      })));
    }
  }, [user]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const addSale = async (sale: Omit<Sale, "id" | "date">) => {
    if (!user) return null;
    const { data, error } = await supabase.from("sales").insert({
      user_id: user.id,
      product_id: sale.productId || null,
      product_name: sale.productName,
      quantite: sale.quantite,
      prix_vente: sale.prixVente,
      total: sale.total,
    }).select().single();

    if (!error && data) {
      const newSale: Sale = {
        id: data.id,
        productId: data.product_id || "",
        productName: data.product_name,
        quantite: data.quantite,
        prixVente: Number(data.prix_vente),
        total: Number(data.total),
        montantRecu: sale.montantRecu,
        monnaie: sale.monnaie,
        date: data.created_at,
      };
      setSales((prev) => [newSale, ...prev]);
      return newSale;
    }
    return null;
  };

  const todaySales = useMemo(() => {
    const today = new Date().toDateString();
    return sales.filter((s) => new Date(s.date).toDateString() === today);
  }, [sales]);

  const gainsDuJour = useMemo(() => {
    return todaySales.reduce((sum, s) => sum + s.total, 0);
  }, [todaySales]);

  const clientsDuJour = todaySales.length;

  return { sales, addSale, todaySales, gainsDuJour, clientsDuJour };
}
