import { useState, useMemo } from "react";
import { useProducts } from "@/hooks/use-products";
import { useSales } from "@/hooks/use-sales";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { SummaryCards } from "@/components/SummaryCards";
import { ProductList } from "@/components/ProductList";
import { AddProductForm } from "@/components/AddProductForm";
import { CriticalProducts } from "@/components/CriticalProducts";
import { SearchBar } from "@/components/SearchBar";
import { SalesModule } from "@/components/SalesModule";
import { AiAssistant } from "@/components/AiAssistant";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Store, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const { signOut } = useAuth();

  const [search, setSearch] = useState("");

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
          <div className="flex items-center gap-1">
            <SettingsPanel
              language={settings.language}
              theme={theme}
              tauxDollar={settings.tauxDollar}
              onLanguageChange={setLanguage}
              onThemeChange={setTheme}
              onTauxChange={setTauxDollar}
              t={t}
            />
            <Button variant="ghost" size="icon" onClick={signOut} title={t("close")}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5 pb-10">
        {/* 1. ALERTES — Priorité maximale */}
        <CriticalProducts products={critiques} t={t} />

        {/* 2. FINANCES — Capital, Stock, Bénéfice */}
        <FinanceSection
          capitalInvesti={capitalInvesti}
          valeurStock={valeurStock}
          beneficeEstime={beneficeEstime}
          t={t}
          toUSD={toUSD}
        />

        {/* 3. PERFORMANCE — Gains & Clients du jour */}
        <PerformanceSection
          gainsDuJour={gainsDuJour}
          clientsDuJour={clientsDuJour}
          totalProduits={products.length}
          alertCount={critiques.length}
          t={t}
          toUSD={toUSD}
        />

        {/* 4. ACTIONS — Vente & Ajout */}
        <SalesModule
          products={products}
          onSale={addSale}
          onUpdateStock={updateProduct}
          t={t}
        />
        <AddProductForm onAdd={addProduct} t={t} />

        {/* 5. ANALYSE — IA, Rentabilité, Inventaire */}
        <AiAssistant
          products={products}
          sales={sales}
          language={settings.language}
          t={t}
        />

        {plusRentable || aSurveiller ? (
          <SmartIndicators plusRentable={plusRentable} aSurveiller={aSurveiller} t={t} />
        ) : null}

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

/* ── Finance Section ── */
import { DollarSign, Package, TrendingUp } from "lucide-react";

function formatHTG(amount: number) {
  return amount.toLocaleString("fr-HT", { minimumFractionDigits: 0 }) + " HTG";
}

function FinanceSection({
  capitalInvesti,
  valeurStock,
  beneficeEstime,
  t,
  toUSD,
}: {
  capitalInvesti: number;
  valeurStock: number;
  beneficeEstime: number;
  t: (k: string) => string;
  toUSD: (htg: number) => number;
}) {
  const cards = [
    { label: t("capital_invested"), value: capitalInvesti, icon: DollarSign, color: "secondary" },
    { label: t("stock_value"), value: valeurStock, icon: Package, color: "secondary" },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl bg-card border p-4 flex items-center gap-3">
            <div className="rounded-lg bg-secondary p-2.5">
              <c.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-lg font-bold">{formatHTG(c.value)}</p>
              <p className="text-[10px] text-muted-foreground">~${toUSD(c.value).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-card border p-4 flex items-center gap-3">
        <div className={`rounded-lg p-2.5 ${beneficeEstime >= 0 ? "bg-success/10" : "bg-destructive/10"}`}>
          <TrendingUp className={`h-5 w-5 ${beneficeEstime >= 0 ? "text-success" : "text-destructive"}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("estimated_profit")}</p>
          <p className={`text-lg font-bold ${beneficeEstime >= 0 ? "text-success" : "text-destructive"}`}>
            {formatHTG(beneficeEstime)}
          </p>
          <p className="text-[10px] text-muted-foreground">~${toUSD(beneficeEstime).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Performance Section ── */
import { ShoppingCart, Users } from "lucide-react";

function PerformanceSection({
  gainsDuJour,
  clientsDuJour,
  totalProduits,
  alertCount,
  t,
  toUSD,
}: {
  gainsDuJour: number;
  clientsDuJour: number;
  totalProduits: number;
  alertCount: number;
  t: (k: string) => string;
  toUSD: (htg: number) => number;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary p-2.5">
            <ShoppingCart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("gains_today")}</p>
            <p className="text-lg font-bold">{formatHTG(gainsDuJour)}</p>
            <p className="text-[10px] text-muted-foreground">~${toUSD(gainsDuJour).toFixed(2)}</p>
          </div>
        </div>
        <div className="rounded-xl bg-card border p-4 flex items-center gap-3">
          <div className="rounded-lg bg-secondary p-2.5">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("clients_today")}</p>
            <p className="text-lg font-bold">{clientsDuJour}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 bg-card border rounded-full px-3 py-1.5 font-medium">
          <Package className="h-3.5 w-3.5" />
          {totalProduits} {t("products")}
        </span>
        {alertCount > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-destructive/10 border border-destructive/30 text-destructive rounded-full px-3 py-1.5 font-bold">
            {alertCount} {t("alerts")}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Smart Indicators ── */
import { Star, Eye } from "lucide-react";

function SmartIndicators({
  plusRentable,
  aSurveiller,
  t,
}: {
  plusRentable: { nom: string; margePourcent: number } | null;
  aSurveiller: { nom: string } | null;
  t: (k: string) => string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {plusRentable && (
        <div className="rounded-xl bg-card border p-3 flex items-center gap-3">
          <div className="rounded-lg bg-success/10 p-2">
            <Star className="h-4 w-4 text-success" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">{t("most_profitable")}</p>
            <p className="text-sm font-bold truncate">{plusRentable.nom}</p>
            <p className="text-[11px] text-success font-semibold">
              {plusRentable.margePourcent.toFixed(0)}% {t("margin")}
            </p>
          </div>
        </div>
      )}
      {aSurveiller && (
        <div className="rounded-xl bg-card border border-destructive/30 p-3 flex items-center gap-3">
          <div className="rounded-lg bg-destructive/10 p-2">
            <Eye className="h-4 w-4 text-destructive" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">{t("to_watch")}</p>
            <p className="text-sm font-bold truncate text-destructive">{aSurveiller.nom}</p>
            <p className="text-[11px] text-muted-foreground">{t("critical_stock")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Index;
