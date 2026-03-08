import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, X, Sun, Moon, Monitor, Globe } from "lucide-react";
import { useState } from "react";
import { Language } from "@/types/product";

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

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => setOpen(true)}
      >
        <Settings className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-5 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="font-bold">{t("settings")}</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

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

        <Button onClick={() => setOpen(false)} className="w-full">
          {t("close")}
        </Button>
      </div>
    </div>
  );
}
