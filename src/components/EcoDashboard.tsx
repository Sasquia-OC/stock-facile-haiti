import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Leaf, Gauge, Download, Zap } from "lucide-react";

interface EcoMetrics {
  loadTimeMs: number;
  jsBytes: number;
  totalBytes: number;
  resourceCount: number;
  cachedQueries: number;
  totalQueries: number;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

export function EcoDashboard({ t }: { t: (key: string) => string }) {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<EcoMetrics | null>(null);

  useEffect(() => {
    const compute = () => {
      try {
        const nav = performance.getEntriesByType("navigation")[0] as
          | PerformanceNavigationTiming
          | undefined;
        const resources = performance.getEntriesByType(
          "resource"
        ) as PerformanceResourceTiming[];

        let jsBytes = 0;
        let totalBytes = 0;
        for (const r of resources) {
          const size = r.encodedBodySize || r.transferSize || 0;
          totalBytes += size;
          if (r.name.endsWith(".js") || r.initiatorType === "script") {
            jsBytes += size;
          }
        }

        const cache = queryClient.getQueryCache().getAll();
        const cached = cache.filter(
          (q) => q.state.data !== undefined && q.state.fetchStatus === "idle"
        ).length;

        setMetrics({
          loadTimeMs: nav ? Math.round(nav.domContentLoadedEventEnd) : 0,
          jsBytes,
          totalBytes,
          resourceCount: resources.length,
          cachedQueries: cached,
          totalQueries: cache.length,
        });
      } catch {
        // Performance API non disponible
      }
    };
    compute();
    const id = setInterval(compute, 3000);
    return () => clearInterval(id);
  }, [queryClient]);

  if (!metrics) return null;

  // Score éco simple : <500ms = 100, >3s = 0
  const speedScore = Math.max(
    0,
    Math.min(100, Math.round(100 - (metrics.loadTimeMs - 500) / 25))
  );
  const cacheRate =
    metrics.totalQueries > 0
      ? Math.round((metrics.cachedQueries / metrics.totalQueries) * 100)
      : 0;

  const rows = [
    {
      icon: Download,
      label: t("eco_js_size"),
      value: formatBytes(metrics.jsBytes),
    },
    {
      icon: Gauge,
      label: t("eco_load_time"),
      value: `${metrics.loadTimeMs} ms`,
    },
    {
      icon: Zap,
      label: t("eco_cache_rate"),
      value: `${cacheRate}% (${metrics.cachedQueries}/${metrics.totalQueries})`,
    },
    {
      icon: Leaf,
      label: t("eco_score"),
      value: `${speedScore}/100`,
    },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm flex items-center gap-2 font-medium">
        <Leaf className="h-4 w-4 text-green-500" /> {t("eco_dashboard")}
      </label>
      <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-3.5 w-3.5" /> {label}
            </span>
            <span className="font-semibold tabular-nums">{value}</span>
          </div>
        ))}
        <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
          {t("eco_hint")}
        </p>
      </div>
    </div>
  );
}
