import { useState, useMemo } from "react";
import { useProducts } from "@/hooks/use-products";
import { SummaryCards } from "@/components/SummaryCards";
import { ProductList } from "@/components/ProductList";
import { AddProductForm } from "@/components/AddProductForm";
import { CriticalProducts } from "@/components/CriticalProducts";
import { SearchBar } from "@/components/SearchBar";
import { Store } from "lucide-react";

const Index = () => {
  const {
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
  } = useProducts();

  const [search, setSearch] = useState("");

  const alertCount = critiques.length;

  const filteredStats = useMemo(() => {
    if (!search.trim()) return productStats;
    const q = search.toLowerCase();
    return productStats.filter((p) => p.nom.toLowerCase().includes(q));
  }, [productStats, search]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-2.5">
          <div className="rounded-lg bg-primary p-1.5">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-base font-bold leading-tight">Mon Stock</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5 pb-10">
        <SummaryCards
          capitalInvesti={capitalInvesti}
          valeurStock={valeurStock}
          beneficeEstime={beneficeEstime}
          plusRentable={plusRentable}
          aSurveiller={aSurveiller}
          totalProduits={products.length}
          alertCount={alertCount}
        />

        <CriticalProducts products={critiques} />

        <AddProductForm onAdd={addProduct} />

        <div className="space-y-3">
          <SearchBar value={search} onChange={setSearch} />
          <ProductList
            products={filteredStats}
            onUpdate={updateProduct}
            onDelete={deleteProduct}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
