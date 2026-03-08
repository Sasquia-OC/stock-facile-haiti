import { useState, useEffect } from "react";
import { Product } from "@/types/product";

const STORAGE_KEY = "stock-haiti-products";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

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

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    capitalInvesti,
    valeurStock,
    beneficeEstime,
  };
}
