import { useState, useMemo, useEffect, useRef } from "react";
import { useProducts } from "@/hooks/use-products";
import { useSales } from "@/hooks/use-sales";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import { useTrial } from "@/hooks/use-trial";
import { useNotifications } from "@/hooks/use-notifications";
import { TrialBadge } from "@/components/TrialBadge";
import { ProductList } from "@/components/ProductList";
import { AddProductForm } from "@/components/AddProductForm";
import { CriticalProducts } from "@/components/CriticalProducts";
import { SearchBar } from "@/components/SearchBar";
import { SalesModule } from "@/components/SalesModule";
import { SalesHistory } from "@/components/SalesHistory";
import { AiAssistant } from "@/components/AiAssistant";
import { AiChatPanel } from "@/components/AiChatPanel";
import { FeedbackSection } from "@/components/FeedbackSection";
import { SettingsPanel } from "@/components/SettingsPanel";
import { HeaderMenu } from "@/components/HeaderMenu";
import { ReportSection } from "@/components/ReportSection";

import { BottomNav, TabId } from "@/components/BottomNav";
import { StockSparkline } from "@/components/StockSparkline";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { DollarSign, Package, TrendingUp, ShoppingCart, Users, Star, Eye } from "lucide-react";
import logoBiznisPam from "@/assets/logo-biznis-pam.png";

function formatHTG(amount: number) {
  return amount.toLocaleString("fr-HT", { minimumFractionDigits: 0 }) + " HTG";
}

const Index = () => {
  const {
    products, productStats, addProduct, updateProduct, deleteProduct,
    capitalInvesti, valeurStock, beneficeEstime, plusRentable, aSurveiller, critiques, stockHistory,
  } = useProducts();

  const { sales, addSale, gainsDuJour, clientsDuJour } = useSales();
  const { settings, t, setLanguage, setTauxDollar, toUSD } = useSettings();
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const { isOwner } = useRole();
  const trial = useTrial();
  const { notifyLowStock, notifyStockout, notifyTrial } = useNotifications();
  useOfflineSync(() => { /* Will auto-refresh via Supabase subscriptions */ });

  const [search, setSearch] = useState("");
  const prevCritiquesRef = useRef<Set<string>>(new Set());

  // Notify on new critical stock products
  useEffect(() => {
    const prevIds = prevCritiquesRef.current;
    critiques.forEach((p) => {
      if (!prevIds.has(p.id)) {
        if (p.quantite === 0) notifyStockout(p.nom);
        else notifyLowStock(p.nom, p.quantite);
      }
    });
    prevCritiquesRef.current = new Set(critiques.map((p) => p.id));
  }, [critiques, notifyLowStock, notifyStockout]);

  // Notify on trial expiration warning
  useEffect(() => {
    if (trial.daysRemaining !== null && (trial.daysRemaining === 15 || trial.daysRemaining === 3 || trial.daysRemaining === 1)) {
      notifyTrial(trial.daysRemaining);
    }
  }, [trial.daysRemaining, notifyTrial]);
  const [activeTab, setActiveTab] = useState<TabId>(isOwner ? "dashboard" : "stock");
  const [showReports, setShowReports] = useState(false);

  const filteredStats = useMemo(() => {
    if (!search.trim()) return productStats;
    const q = search.toLowerCase();
    return productStats.filter((p) => p.nom.toLowerCase().includes(q));
  }, [productStats, search]);

  const handleRestock = (id: string) => {
    updateProduct(id, { quantite: 10 });
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-white dark:bg-white/95 p-1">
              <img src={logoBiznisPam} alt="Ayiti Biznis" className="h-7 w-7 object-contain" />
            </div>
            <h1 className="text-base font-bold leading-tight">Ayiti Biznis</h1>
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
            <HeaderMenu
              t={t}
              onSignOut={signOut}
              onOpenReports={isOwner ? () => setShowReports(true) : undefined}
            />
          </div>
        </div>
      </header>

      <TrialBadge trial={trial} t={t} />

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Welcome banner (dashboard only, owner only) */}
        {activeTab === "dashboard" && isOwner && (
          <div className="rounded-2xl overflow-hidden shadow-md">
            <div className="relative bg-gradient-to-r from-[hsl(216,100%,29%)] via-[hsl(216,100%,22%)] to-[hsl(352,80%,45%)] px-5 py-4 flex items-center gap-4">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white_0%,transparent_70%)]" />
              <div className="relative z-10 rounded-lg bg-white/95 p-1.5 shadow-sm shrink-0">
                <img src={logoBiznisPam} alt="Ayiti Biznis" className="h-9 w-9 object-contain" />
              </div>
              <div className="relative z-10 min-w-0">
                <h2 className="text-base font-bold text-white truncate">{t("auth_welcome_title")}</h2>
                <p className="text-xs text-white/75 truncate">{t("auth_welcome_desc")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Onboarding (no products) */}
        {products.length === 0 && (activeTab === "dashboard" || activeTab === "stock") && (
          <div className="space-y-5">
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center space-y-3">
              <img src={logoBiznisPam} alt="Ayiti Biznis" className="h-16 w-16 mx-auto rounded-xl bg-white dark:bg-white/95 p-2" />
              <h2 className="text-lg font-bold">{t("welcome")}</h2>
              <p className="text-sm text-muted-foreground">{t("add_first_product")}</p>
            </div>
            {isOwner && <AddProductForm onAdd={addProduct} t={t} />}
          </div>
        )}

        {/* ── DASHBOARD TAB (owner only) ── */}
        {activeTab === "dashboard" && isOwner && products.length > 0 && (
          <>
            <CriticalProducts products={critiques} t={t} onRestock={handleRestock} />

            {/* Finances */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FinanceCard icon={DollarSign} label={t("capital_invested")} value={capitalInvesti} toUSD={toUSD} />
                <div className="rounded-xl bg-card border p-4 flex items-center gap-3">
                  <div className="rounded-lg bg-secondary p-2.5">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{t("stock_value")}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold">{formatHTG(valeurStock)}</p>
                      <StockSparkline data={stockHistory} t={t} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">~${toUSD(valeurStock).toFixed(2)}</p>
                  </div>
                </div>
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

            {/* Performance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {/* AI + Indicators */}
            <AiAssistant products={products} sales={sales} language={settings.language} t={t} />

            {(plusRentable || aSurveiller) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plusRentable && (
                  <div className="rounded-xl bg-card border p-3 flex items-center gap-3">
                    <div className="rounded-lg bg-success/10 p-2"><Star className="h-4 w-4 text-success" /></div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground">{t("most_profitable")}</p>
                      <p className="text-sm font-bold truncate">{plusRentable.nom}</p>
                      <p className="text-[11px] text-success font-semibold">{plusRentable.margePourcent.toFixed(0)}% {t("margin")}</p>
                    </div>
                  </div>
                )}
                {aSurveiller && (
                  <div className="rounded-xl bg-card border border-destructive/30 p-3 flex items-center gap-3">
                    <div className="rounded-lg bg-destructive/10 p-2"><Eye className="h-4 w-4 text-destructive" /></div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground">{t("to_watch")}</p>
                      <p className="text-sm font-bold truncate text-destructive">{aSurveiller.nom}</p>
                      <p className="text-[11px] text-muted-foreground">{t("critical_stock")}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <FeedbackSection t={t} />
          </>
        )}

        {/* ── STOCK TAB ── */}
        {activeTab === "stock" && (
          <>
            <CriticalProducts products={critiques} t={t} onRestock={isOwner ? handleRestock : undefined} />
            {isOwner && <AddProductForm onAdd={addProduct} t={t} />}
            <div className="space-y-3">
              <SearchBar value={search} onChange={setSearch} placeholder={t("search")} />
              <ProductList
                products={filteredStats}
                onUpdate={updateProduct}
                onDelete={deleteProduct}
                onSale={addSale}
                t={t}
                isOwner={isOwner}
              />
            </div>
          </>
        )}

        {/* ── SALES TAB ── */}
        {activeTab === "sales" && (
          <>
            <SalesModule products={products} onSale={addSale} onUpdateStock={updateProduct} t={t} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 flex items-center gap-3">
                <div className="rounded-lg bg-primary p-2.5">
                  <ShoppingCart className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("gains_today")}</p>
                  <p className="text-lg font-bold">{formatHTG(gainsDuJour)}</p>
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
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <SalesHistory sales={sales} t={t} />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-lg mx-auto px-4 pb-20 pt-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Creovate. Tous droits réservés.
      </footer>

      <BottomNav active={activeTab} onChange={setActiveTab} t={t} alertCount={critiques.length} isOwner={isOwner} />

      {showReports && isOwner && (
        <ReportSection
          products={products}
          sales={sales}
          capitalInvesti={capitalInvesti}
          valeurStock={valeurStock}
          beneficeEstime={beneficeEstime}
          t={t}
          toUSD={toUSD}
          onClose={() => setShowReports(false)}
        />
      )}

      {/* AI Chat Panel - floating */}
      <AiChatPanel products={products} sales={sales} language={settings.language} t={t} />
    </div>
  );
};

/* ── Finance Card ── */
function FinanceCard({ icon: Icon, label, value, toUSD }: {
  icon: typeof DollarSign; label: string; value: number; toUSD: (h: number) => number;
}) {
  return (
    <div className="rounded-xl bg-card border p-4 flex items-center gap-3">
      <div className="rounded-lg bg-secondary p-2.5">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{formatHTG(value)}</p>
        <p className="text-[10px] text-muted-foreground">~${toUSD(value).toFixed(2)}</p>
      </div>
    </div>
  );
}

export default Index;
