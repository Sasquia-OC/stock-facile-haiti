import { useEffect, useCallback, useRef } from "react";

type NotificationType = "stock" | "sale" | "trial";

export function useNotifications() {
  const permission = useRef(typeof Notification !== "undefined" ? Notification.permission : "denied");

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return false;
    if (Notification.permission === "granted") {
      permission.current = "granted";
      return true;
    }
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    permission.current = result;
    return result === "granted";
  }, []);

  // Auto-request on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const notify = useCallback(
    (title: string, body: string, _type?: NotificationType) => {
      if (typeof Notification === "undefined" || permission.current !== "granted") return;
      try {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: _type || "general",
        });
      } catch {
        // Silent fail on unsupported environments
      }
    },
    []
  );

  const notifyLowStock = useCallback(
    (productName: string, quantity: number) => {
      notify(
        "⚠️ Stock bas",
        `${productName} — il ne reste que ${quantity} unité(s).`,
        "stock"
      );
    },
    [notify]
  );

  const notifyStockout = useCallback(
    (productName: string) => {
      notify(
        "🚨 Rupture de stock",
        `${productName} est en rupture de stock !`,
        "stock"
      );
    },
    [notify]
  );

  const notifySale = useCallback(
    (productName: string, total: number) => {
      notify(
        "✅ Vente enregistrée",
        `${productName} — ${total.toLocaleString("fr-HT")} HTG`,
        "sale"
      );
    },
    [notify]
  );

  const notifyTrial = useCallback(
    (daysLeft: number) => {
      notify(
        "⏳ Essai gratuit",
        `Il vous reste ${daysLeft} jour(s) d'essai gratuit.`,
        "trial"
      );
    },
    [notify]
  );

  return {
    requestPermission,
    notify,
    notifyLowStock,
    notifyStockout,
    notifySale,
    notifyTrial,
  };
}
