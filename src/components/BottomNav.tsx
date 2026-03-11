import { LayoutDashboard, Package, ShoppingCart, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabId = "dashboard" | "stock" | "sales" | "history";

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  t: (key: string) => string;
  alertCount?: number;
  isOwner?: boolean;
}

const ownerTabs: { id: TabId; icon: typeof LayoutDashboard; labelKey: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, labelKey: "dashboard" },
  { id: "stock", icon: Package, labelKey: "inventory" },
  { id: "sales", icon: ShoppingCart, labelKey: "pos" },
  { id: "history", icon: Clock, labelKey: "history" },
];

const employeeTabs: { id: TabId; icon: typeof LayoutDashboard; labelKey: string }[] = [
  { id: "stock", icon: Package, labelKey: "inventory" },
  { id: "sales", icon: ShoppingCart, labelKey: "pos" },
  { id: "history", icon: Clock, labelKey: "history" },
];

export function BottomNav({ active, onChange, t, alertCount = 0 }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-14">
        {tabs.map(({ id, icon: Icon, labelKey }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative",
              active === id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {id === "stock" && alertCount > 0 && (
                <span className="absolute -top-1 -right-1.5 h-3.5 min-w-[14px] flex items-center justify-center text-[9px] font-bold rounded-full bg-destructive text-destructive-foreground px-0.5">
                  {alertCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{t(labelKey)}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
