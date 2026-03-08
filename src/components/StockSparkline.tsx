import { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";

interface StockSparklineProps {
  data: { date: string; value: number }[];
  t: (key: string) => string;
}

function formatHTG(amount: number) {
  return amount.toLocaleString("fr-HT", { minimumFractionDigits: 0 }) + " HTG";
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-card border px-3 py-1.5 shadow-lg text-xs">
      <p className="text-muted-foreground">{payload[0]?.payload?.date}</p>
      <p className="font-bold">{formatHTG(payload[0]?.value ?? 0)}</p>
    </div>
  );
}

export function StockSparkline({ data, t }: StockSparklineProps) {
  const trend = useMemo(() => {
    if (data.length < 2) return "flat";
    const first = data[0].value;
    const last = data[data.length - 1].value;
    const diff = last - first;
    const pct = first > 0 ? Math.abs(diff / first) * 100 : 0;
    // Green = stock flowing out (sales happening), blue = stagnant
    if (pct < 2) return "flat";
    return diff < 0 ? "down" : "up";
  }, [data]);

  const strokeColor =
    trend === "down"
      ? "hsl(var(--success))"
      : "hsl(var(--primary))";

  if (data.length < 2) return null;

  return (
    <div className="h-10 w-24 sm:w-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: strokeColor, strokeWidth: 0 }}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
