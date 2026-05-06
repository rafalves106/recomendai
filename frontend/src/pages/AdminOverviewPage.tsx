import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Zap,
  ArrowRight,
  BarChart2,
  Sparkles,
} from "lucide-react";
import {
  fetchOverviewKPIs,
  fetchFunnel,
  fetchEventsOverTime,
  fetchCategoryStats,
  type CategoryStat,
  type DayStats,
  type FunnelStage,
  type OverviewKPIs,
} from "../services/api";

function formatDay(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function SkeletonCard() {
  return <div className="h-36 rounded-2xl bg-slate-800 animate-pulse" />;
}

export default function AdminOverviewPage() {
  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [eventsOverTime, setEventsOverTime] = useState<DayStats[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [kpiRes, funnelRes, eventsRes, categoryRes] =
        await Promise.allSettled([
          fetchOverviewKPIs(),
          fetchFunnel(),
          fetchEventsOverTime(7),
          fetchCategoryStats(),
        ]);

      if (!mounted) return;

      if (kpiRes.status === "fulfilled") setKpis(kpiRes.value);
      if (funnelRes.status === "fulfilled") setFunnel(funnelRes.value);
      if (eventsRes.status === "fulfilled") setEventsOverTime(eventsRes.value);
      if (categoryRes.status === "fulfilled")
        setCategoryStats(categoryRes.value);

      setIsLoading(false);
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const pieTotal = useMemo(
    () => categoryStats.reduce((sum, item) => sum + item.total_events, 0),
    [categoryStats],
  );

  if (isLoading) {
    return (
      <div className="space-y-8 px-6 py-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="h-40 rounded-2xl bg-slate-800 animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 rounded-2xl bg-slate-800 animate-pulse" />
          <div className="h-80 rounded-2xl bg-slate-800 animate-pulse" />
        </div>
      </div>
    );
  }

  const safeKpis: OverviewKPIs =
    kpis ??
    ({
      total_events: 0,
      total_purchases: 0,
      total_views: 0,
      unique_users: 0,
      conversion_rate: 0,
      ai_uplift: { base_rate: 0, ai_rate: 0 },
      top_category: "",
      avg_session_depth: 0,
    } as OverviewKPIs);

  return (
    <div className="space-y-8 px-6 py-8">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-slate-800 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-400">Total de Eventos</p>
            <Zap className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {safeKpis.total_events.toLocaleString("pt-BR")}
          </p>
          <p className="mt-1 text-sm text-slate-400">interações registradas</p>
        </div>

        <div className="rounded-2xl bg-slate-800 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-400">Compras Realizadas</p>
            <ShoppingBag className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {safeKpis.total_purchases.toLocaleString("pt-BR")}
          </p>
          <p className="mt-1 text-sm text-slate-400">pedidos simulados</p>
        </div>

        <div className="rounded-2xl bg-slate-800 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-400">Usuários Ativos</p>
            <Users className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {safeKpis.unique_users.toLocaleString("pt-BR")}
          </p>
          <p className="mt-1 text-sm text-slate-400">perfis únicos</p>
        </div>

        <div className="rounded-2xl bg-slate-800 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-400">Taxa de Conversão</p>
            <TrendingUp className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {safeKpis.conversion_rate.toFixed(1)}%
          </p>
          <p className="mt-1 text-sm text-slate-400">sessões → compra</p>
        </div>
      </section>

      <section className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-600/20 to-cyan-600/20 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-cyan-300" />
            <div>
              <h3 className="font-semibold text-white">
                Impacto da IA Recomenda.AI
              </h3>
              <p className="text-sm text-slate-300">
                Comparativo de conversão do motor híbrido
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Sem IA
              </p>
              <p className="text-lg text-slate-300">
                {safeKpis.ai_uplift.base_rate.toFixed(2)}%
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-indigo-300" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Com IA
              </p>
              <p className="text-2xl font-bold text-cyan-400">
                {safeKpis.ai_uplift.ai_rate.toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-900/60 px-4 py-3 text-center">
            <p className="text-xs uppercase text-slate-400">Uplift</p>
            <p className="text-3xl font-bold text-cyan-300">2.24x</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-slate-800 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Eventos nos Últimos 7 Dias
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={eventsOverTime}>
              <XAxis
                dataKey="date"
                tickFormatter={formatDay}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "#334155" }}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "#334155" }}
              />
              <Tooltip
                formatter={(value, name) => [
                  Number(value ?? 0).toLocaleString("pt-BR"),
                  name === "events" ? "Eventos" : "Compras",
                ]}
                labelFormatter={(label) =>
                  `Data: ${formatDay(label as string)}`
                }
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="events"
                stroke="#6366f1"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="purchases"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-slate-800 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Interesse por Categoria
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryStats.map((item) => ({
                  name: item.name,
                  value: item.total_events,
                  color: item.color,
                }))}
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                paddingAngle={2}
              >
                {categoryStats.map((entry) => (
                  <Cell key={entry.category_id} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid gap-2">
            {categoryStats.map((item) => {
              const pct =
                pieTotal > 0 ? (item.total_events / pieTotal) * 100 : 0;
              return (
                <div
                  key={item.category_id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-slate-400">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-slate-800 p-6">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
          <BarChart2 className="h-5 w-5 text-indigo-400" />
          Funil de Conversão
        </h3>
        <div className="space-y-4">
          {funnel.map((stage) => (
            <div key={stage.stage}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-200">{stage.stage}</span>
                <span className="text-slate-400">
                  {stage.count.toLocaleString("pt-BR")} •{" "}
                  {stage.rate.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-700">
                <div
                  className="h-3 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, stage.rate)}%`,
                    backgroundColor: stage.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-300">
          Profundidade média de sessão: {safeKpis.avg_session_depth.toFixed(1)}{" "}
          eventos/sessão
        </p>
      </section>
    </div>
  );
}
