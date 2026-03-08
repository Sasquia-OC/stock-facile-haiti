import { useState, useEffect, useMemo } from "react";
import { Sale } from "@/types/product";

const SALES_KEY = "biznis-pam-sales";

export function useSales() {
  const [sales, setSales] = useState<Sale[]>(() => {
    const stored = localStorage.getItem(SALES_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  }, [sales]);

  const addSale = (sale: Omit<Sale, "id" | "date">) => {
    const newSale: Sale = {
      ...sale,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setSales((prev) => [newSale, ...prev]);
    return newSale;
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
