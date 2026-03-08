import { useProducts } from "@/hooks/use-products";
import { SummaryCards } from "@/components/SummaryCards";
import { ProductList } from "@/components/ProductList";
import { AddProductForm } from "@/components/AddProductForm";
import { Store } from "lucide-react";

const Index = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    capitalInvesti,
    valeurStock,
    beneficeEstime,
  } = useProducts();

  const alertCount = products.filter(
    (p) => p.quantite === 0 || p.quantite <= p.seuilAlerte
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary p-1.5">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Mon Stock</h1>
              <p className="text-[11px] text-muted-foreground">
                {products.length} produit{products.length !== 1 ? "s" : ""}
                {alertCount > 0 && (
                  <span className="text-destructive font-semibold">
                    {" "}· {alertCount} alerte{alertCount !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-8">
        <SummaryCards
          capitalInvesti={capitalInvesti}
          valeurStock={valeurStock}
          beneficeEstime={beneficeEstime}
        />

        <AddProductForm onAdd={addProduct} />

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">
            Produits en stock
          </h2>
          <ProductList
            products={products}
            onUpdate={updateProduct}
            onDelete={deleteProduct}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
