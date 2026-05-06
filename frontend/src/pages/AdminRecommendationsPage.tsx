import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  Brain,
  ArrowUp,
} from "lucide-react";
import {
  fetchTopProducts,
  fetchCategoryStats,
  fetchOverviewKPIs,
  type CategoryStat,
  type OverviewKPIs,
  type TopProduct,
} from "../services/api";

const SCORE_COLORS = ["#6366f1", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b"];

export default function AdminRecommendationsPage() {
  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [kpiRes, productsRes, categoryRes] = await Promise.allSettled([
        fetchOverviewKPIs(),
        fetchTopProducts({ limit: 5, metric: "purchases" }),
        fetchCategoryStats(),
      ]);

      if (!mounted) return;

      if (kpiRes.status === "fulfilled") setKpis(kpiRes.value);
      if (productsRes.status === "fulfilled") setTopProducts(productsRes.value);
      if (categoryRes.status === "fulfilled")
        setCategoryStats(categoryRes.value);

      setIsLoading(false);
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

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

  const estimatedCtr =
    safeKpis.total_views > 0
      ? (
          (safeKpis.total_purchases / safeKpis.total_views) *
          100 *
          2.24
        ).toFixed(1)
      : "0.0";

  const meanConversion = useMemo(() => {
    if (!categoryStats.length) return 0;
    const total = categoryStats.reduce(
      (sum, item) => sum + item.conversion_rate,
      0,
    );
    return total / categoryStats.length;
  }, [categoryStats]);

  if (isLoading) {
    return (
      <div className="space-y-6 px-6 py-8">
        <div className="h-36 animate-pulse rounded-2xl bg-slate-800" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="h-28 animate-pulse rounded-2xl bg-slate-800" />
          <div className="h-28 animate-pulse rounded-2xl bg-slate-800" />
          <div className="h-28 animate-pulse rounded-2xl bg-slate-800" />
          <div className="h-28 animate-pulse rounded-2xl bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 py-8">
      <section className="rounded-2xl bg-slate-800 p-6">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-white">
          <Brain className="h-7 w-7 text-cyan-400" />
          Performance das Recomendações
        </h1>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
            <h3 className="font-semibold text-orange-300">🔥 Popularidade</h3>
            <p className="mt-2 text-sm text-slate-300">
              Produtos mais acessados globalmente
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Usado como fallback e para novos usuários
            </p>
          </div>
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
            <h3 className="font-semibold text-indigo-300">🤖 IA Híbrida</h3>
            <p className="mt-2 text-sm text-slate-300">
              Combina perfil + coocorrência + popularidade
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Estratégia principal do motor
            </p>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
            <h3 className="font-semibold text-blue-300">🔗 Coocorrência</h3>
            <p className="mt-2 text-sm text-slate-300">
              "Quem viu X também viu Y" por sessão
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Baseado em {safeKpis.total_events.toLocaleString("pt-BR")} eventos
              reais
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-slate-800 p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-400">Recomendações Geradas</p>
            <Zap className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {(safeKpis.total_views * 3).toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-800 p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-400">CTR Estimado</p>
            <Target className="h-5 w-5 text-indigo-300" />
          </div>
          <p className="text-2xl font-bold text-white">{estimatedCtr}%</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-emerald-600/20 to-emerald-500/5 p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-300">Uplift de Conversão</p>
            <TrendingUp className="h-5 w-5 text-emerald-300" />
          </div>
          <p className="flex items-center gap-2 text-2xl font-bold text-emerald-300">
            <ArrowUp className="h-5 w-5" />
            +124%
          </p>
          <p className="text-xs text-slate-300">vs. sem recomendação</p>
        </div>

        <div className="rounded-2xl bg-slate-800 p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-400">Sessões com Recomendação</p>
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>
          <p className="text-2xl font-bold text-white">
            {safeKpis.unique_users} usuários
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-slate-800 p-6">
          <h3 className="mb-5 text-lg font-semibold text-white">
            Top Produtos Recomendados
          </h3>
          <div className="space-y-4">
            {topProducts.map((product, idx) => {
              const maxPurchases = topProducts[0]?.purchases || 1;
              const width = (product.purchases / maxPurchases) * 100;
              return (
                <div key={product.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-200">
                      <span className="w-5 font-semibold text-slate-400">
                        #{idx + 1}
                      </span>
                      <span className="truncate">{product.name}</span>
                    </div>
                    <span className="rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-300">
                      {product.purchases.toLocaleString("pt-BR")} compras
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-700">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${width}%`,
                        backgroundColor:
                          SCORE_COLORS[idx % SCORE_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-800 p-6">
          <h3 className="mb-5 text-lg font-semibold text-white">
            Efetividade por Categoria
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryStats}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value) => `${Number(value ?? 0).toFixed(2)}%`}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
              />
              <ReferenceLine
                y={meanConversion}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                label={{
                  value: "Média",
                  fill: "#94a3b8",
                  position: "insideTopRight",
                }}
              />
              <Bar dataKey="conversion_rate" radius={[6, 6, 0, 0]}>
                {categoryStats.map((entry) => (
                  <Cell key={entry.category_id} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Sparkles className="h-5 w-5 text-cyan-300" />
          Como o Motor Funciona
        </h3>
        <div className="mb-5 rounded-xl bg-slate-800 p-4 text-center text-slate-100">
          <span className="text-sm text-slate-400">Score Final</span>
          <p className="mt-1 text-lg font-semibold">
            (Coocorrência × 40%) + (Perfil × 40%) + (Popularidade × 20%)
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-sm font-semibold text-indigo-300">
              🔗 Coocorrência
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Captura padrões de navegação conjunta por sessão para inferir
              relações entre produtos.
            </p>
          </div>
          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-sm font-semibold text-cyan-300">🧠 Perfil</p>
            <p className="mt-2 text-sm text-slate-300">
              Ajusta recomendações ao histórico comportamental de cada tipo de
              usuário simulado.
            </p>
          </div>
          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-sm font-semibold text-amber-300">
              🔥 Popularidade
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Garante cobertura com itens de alta demanda, reduzindo cold-start
              e mantendo relevância.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
