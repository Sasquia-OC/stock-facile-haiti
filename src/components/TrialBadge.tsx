import { TrialInfo } from "@/hooks/use-trial";
import { Clock, AlertTriangle } from "lucide-react";

interface TrialBadgeProps {
  trial: TrialInfo;
  t: (key: string) => string;
}

export function TrialBadge({ trial, t }: TrialBadgeProps) {
  if (trial.loading || trial.isExpired) return null;
  if (trial.status !== "active_trial") return null;

  const bgClass = trial.isCritical
    ? "bg-destructive/15 border-destructive/40 text-destructive"
    : trial.isWarning
    ? "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300"
    : "bg-primary/10 border-primary/20 text-primary";

  const Icon = trial.isCritical ? AlertTriangle : Clock;

  return (
    <div className={`mx-4 mt-2 rounded-lg border px-3 py-2 flex items-center gap-2 text-xs font-medium ${bgClass}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>
        {t("trial_badge").replace("{days}", String(trial.daysRemaining))}
      </span>
    </div>
  );
}
