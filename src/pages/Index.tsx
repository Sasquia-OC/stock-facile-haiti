import { useState, useMemo } from "react";
import { useProducts } from "@/hooks/use-products";
import { useSales } from "@/hooks/use-sales";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import { SummaryCards } from "@/components/SummaryCards";
import { ProductList } from "@/components/ProductList";
import { AddProductForm } from "@/components/AddProductForm";
import { CriticalProducts } from "@/components/CriticalProducts";
import { SearchBar } from "@/components/SearchBar";
import { SalesModule } from "@/components/SalesModule";
import { AiAssistant } from "@/components/AiAssistant";
import { SettingsPanel } from "@/components/SettingsPanel";
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

  const { sales, addSale, gainsDuJour, clientsDuJour } = useSales();
  const { settings, t, setLanguage, setTauxDollar, toUSD } = useSettings();
  const { theme, setTheme } = useTheme();

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
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary p-1.5">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-base font-bold leading-tight">Biznis Pam</h1>
          </div>
          <SettingsPanel
            language={settings.language}
            theme={theme}
            tauxDollar={settings.tauxDollar}
            onLanguageChange={setLanguage}
            onThemeChange={setTheme}
            onTauxChange={setTauxDollar}
            t={t}
          />
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
          gainsDuJour={gainsDuJour}
          clientsDuJour={clientsDuJour}
          t={t}
          toUSD={toUSD}
        />

        <CriticalProducts products={critiques} t={t} />

        <AiAssistant
          products={products}
          sales={sales}
          language={settings.language}
          t={t}
        />

        <SalesModule
          products={products}
          onSale={addSale}
          onUpdateStock={updateProduct}
          t={t}
        />

        <AddProductForm onAdd={addProduct} t={t} />

        <div className="space-y-3">
          <SearchBar value={search} onChange={setSearch} placeholder={t("search")} />
          <ProductList
            products={filteredStats}
            onUpdate={updateProduct}
            onDelete={deleteProduct}
            t={t}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
