import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, X, Sun, Moon, Monitor, Globe, Database, Package, ShoppingCart, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Language } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";


interface SettingsPanelProps {
  language: Language;
  theme: "light" | "dark" | "system";
  tauxDollar: number;
  onLanguageChange: (lang: Language) => void;
  onThemeChange: (theme: "light" | "dark" | "system") => void;
  onTauxChange: (taux: number) => void;
  t: (key: string) => string;
}

export function SettingsPanel({
  language,
  theme,
  tauxDollar,
  onLanguageChange,
  onThemeChange,
  onTauxChange,
  t,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const [storageCounts, setStorageCounts] = useState({ products: 0, sales: 0, conversations: 0 });

  useEffect(() => {
    if (!open) return;
    const fetchCounts = async () => {
      const [prodRes, salesRes, convRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("sales").select("id", { count: "exact", head: true }),
        supabase.from("chat_conversations").select("id", { count: "exact", head: true }),
      ]);
      setStorageCounts({
        products: prodRes.count ?? 0,
        sales: salesRes.count ?? 0,
        conversations: convRes.count ?? 0,
      });
    };
    fetchCounts();
  }, [open]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => setOpen(true)}
      >
        <Settings className="h-5 w-5" />
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="flex flex-row items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <DrawerTitle>{t("settings")}</DrawerTitle>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="px-5 pb-6 space-y-5">
            {/* Language */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" /> {t("language")}
              </Label>
              <div className="flex gap-2">
                <Button
                  variant={language === "fr" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => onLanguageChange("fr")}
                >
                  {t("french")}
                </Button>
                <Button
                  variant={language === "ht" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => onLanguageChange("ht")}
                >
                  {t("creole")}
                </Button>
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <Label className="text-sm">{t("theme")}</Label>
              <div className="flex gap-2">
                {[
                  { value: "light" as const, icon: Sun, label: t("light") },
                  { value: "dark" as const, icon: Moon, label: t("dark") },
                  { value: "system" as const, icon: Monitor, label: t("system") },
                ].map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    variant={theme === value ? "default" : "outline"}
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => onThemeChange(value)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* USD Rate */}
            <div className="space-y-2">
              <Label className="text-sm">{t("usd_rate")} (1 USD = ? HTG)</Label>
              <Input
                type="number"
                min="1"
                value={tauxDollar}
                onChange={(e) => onTauxChange(Number(e.target.value) || 132)}
                className="h-11"
              />
            </div>

            {/* Storage Usage */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4" /> {t("storage_usage")}
              </Label>
              <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Package className="h-3.5 w-3.5" /> {t("storage_products")}
                  </span>
                  <span className="font-semibold">{storageCounts.products}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <ShoppingCart className="h-3.5 w-3.5" /> {t("storage_sales")}
                  </span>
                  <span className="font-semibold">{storageCounts.sales}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5" /> {t("storage_conversations")}
                  </span>
                  <span className="font-semibold">{storageCounts.conversations}</span>
                </div>
              </div>
            </div>



            <Button onClick={() => setOpen(false)} className="w-full">
              {t("close")}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
