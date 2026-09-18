import { Check, Gift, Crown, Landmark, CreditCard, Smartphone, Wallet, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlansSectionProps {
  t: (key: string) => string;
  daysRemaining?: number;
  currentPlan?: string;
}

const paymentMethods = [
  { key: "pay_bank", Icon: Landmark },
  { key: "pay_card", Icon: CreditCard },
  { key: "pay_moncash", Icon: Smartphone },
  { key: "pay_zelle", Icon: Send },
  { key: "pay_paypal", Icon: Wallet },
];

export function PlansSection({ t, daysRemaining, currentPlan }: PlansSectionProps) {
  const isTrial = currentPlan !== "Basic";

  return (
    <div className="space-y-3">
      {/* Essai gratuit */}
      <div className="rounded-xl border bg-card p-4 space-y-2 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{t("plan_trial_name")}</span>
          </div>
          {isTrial && <Badge variant="secondary">{t("plan_current")}</Badge>}
        </div>
        <p className="text-2xl font-bold">
          0 $ <span className="text-xs font-normal text-muted-foreground">/ 90 {t("plan_days")}</span>
        </p>
        {typeof daysRemaining === "number" && (
          <p className="text-xs text-muted-foreground">
            {t("plan_days_left").replace("{days}", String(daysRemaining))}
          </p>
        )}
        <ul className="space-y-1 pt-1">
          {["plan_feat_stock", "plan_feat_sales", "plan_feat_reports", "plan_feat_ai"].map((k) => (
            <li key={k} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
              {t(k)}
            </li>
          ))}
        </ul>
      </div>

      {/* Plan Basic */}
      <div className="rounded-xl border-2 border-primary bg-card p-4 space-y-2 text-left relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{t("plan_basic_name")}</span>
          </div>
          <Badge>{t("plan_recommended")}</Badge>
        </div>
        <p className="text-2xl font-bold">
          2,99 $ <span className="text-xs font-normal text-muted-foreground">/ {t("plan_month")}</span>
        </p>
        <p className="text-xs text-muted-foreground">{t("plan_basic_desc")}</p>
        <ul className="space-y-1 pt-1">
          {["plan_feat_all_trial", "plan_feat_unlimited", "plan_feat_backup", "plan_feat_support"].map((k) => (
            <li key={k} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
              {t(k)}
            </li>
          ))}
        </ul>
      </div>

      {/* Moyens de paiement */}
      <div className="rounded-xl border bg-muted/40 p-4 space-y-2 text-left">
        <p className="text-sm font-semibold">{t("plan_payment_methods")}</p>
        <div className="grid grid-cols-2 gap-2">
          {paymentMethods.map(({ key, Icon }) => (
            <div key={key} className="flex items-center gap-2 rounded-lg bg-background border p-2">
              <Icon className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-medium">{t(key)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground pt-1">{t("plan_payment_note")}</p>
      </div>
    </div>
  );
}
