import logoBiznisPam from "@/assets/logo-biznis-pam.png";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Lock, LogOut } from "lucide-react";

export default function TrialExpired() {
  const { t } = useSettings();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="mx-auto rounded-2xl bg-white dark:bg-white/95 p-3 w-fit shadow-md">
          <img src={logoBiznisPam} alt="Ayiti Biznis" className="h-16 w-16 object-contain" />
        </div>

        <div className="space-y-2">
          <div className="mx-auto rounded-full bg-destructive/10 p-3 w-fit">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold">{t("trial_expired_title")}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("trial_expired_desc")}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-3">
          <p className="text-sm font-semibold">{t("trial_expired_cta")}</p>
          <p className="text-xs text-muted-foreground">{t("trial_expired_contact")}</p>
        </div>

        <Button variant="outline" className="w-full gap-2" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </Button>
      </div>
    </div>
  );
}
