import { useState, useEffect, useMemo } from "react";
import { Product } from "@/types/product";
import { useAuth } from "@/hooks/use-auth";

const BASE_STORAGE_KEY = "stock-haiti-products";
const BASE_HISTORY_KEY = "stock-haiti-value-history";

const MOCK_PRODUCTS: Product[] = [
  {
    id: "mock-1",
    nom: "Riz 25kg",
    quantite: 45,
    prixAchat: 1200,
    prixVente: 1600,
    seuilAlerte: 10,
    dateAjout: new Date().toISOString(),
  },
  {
    id: "mock-2",
    nom: "Huile 1L",
    quantite: 3,
    prixAchat: 250,
    prixVente: 350,
    seuilAlerte: 5,
    dateAjout: new Date().toISOString(),
  },
  {
    id: "mock-3",
    nom: "Sucre 2kg",
    quantite: 0,
    prixAchat: 150,
    prixVente: 220,
    seuilAlerte: 5,
    dateAjout: new Date().toISOString(),
  },
  {
    id: "mock-4",
    nom: "Savon (paquet de 12)",
    quantite: 28,
    prixAchat: 300,
    prixVente: 500,
    seuilAlerte: 5,
    dateAjout: new Date().toISOString(),
  },
  {
    id: "mock-5",
    nom: "Spaghetti 500g",
    quantite: 60,
    prixAchat: 75,
    prixVente: 125,
    seuilAlerte: 15,
    dateAjout: new Date().toISOString(),
  },
];

export function useProducts() {
  const { user } = useAuth();
  const userId = user?.id;
  const STORAGE_KEY = userId ? `${BASE_STORAGE_KEY}-${userId}` : BASE_STORAGE_KEY;
  const HISTORY_KEY = userId ? `${BASE_HISTORY_KEY}-${userId}` : BASE_HISTORY_KEY;

  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.length > 0 ? parsed : MOCK_PRODUCTS;
    }
    return MOCK_PRODUCTS;
  });

  // Re-load when user changes
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setProducts(parsed.length > 0 ? parsed : MOCK_PRODUCTS);
    } else {
      setProducts(MOCK_PRODUCTS);
    }
  }, [STORAGE_KEY]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products, STORAGE_KEY]);

  // Track daily stock value history (last 7 days)
  const valeurStockCurrent = products.reduce((sum, p) => sum + p.prixVente * p.quantite, 0);

  const [stockHistory, setStockHistory] = useState<{ date: string; value: number }[]>(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    setStockHistory(stored ? JSON.parse(stored) : []);
  }, [HISTORY_KEY]);

  useEffect(() => {
    const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    setStockHistory((prev) => {
      const filtered = prev.filter((e) => e.date !== today);
      const updated = [...filtered, { date: today, value: valeurStockCurrent }].slice(-7);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [valeurStockCurrent, HISTORY_KEY]);

  const addProduct = (product: Omit<Product, "id" | "dateAjout">) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      dateAjout: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const capitalInvesti = products.reduce(
    (sum, p) => sum + p.prixAchat * p.quantite,
    0
  );
  const valeurStock = products.reduce(
    (sum, p) => sum + p.prixVente * p.quantite,
    0
  );
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
  };
}
