import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Package, ArrowUpDown } from "lucide-react";
import { fetchTopProducts, type TopProduct } from "../services/api";

type Metric = "views" | "purchases" | "cart_adds";

const CATEGORY_PILL: Record<string, string> = {
  electronics: "bg-indigo-500/20 text-indigo-300",
  fashion: "bg-pink-500/20 text-pink-300",
  home: "bg-amber-500/20 text-amber-300",
  sports: "bg-emerald-500/20 text-emerald-300",
  books: "bg-cyan-500/20 text-cyan-300",
};

const METRIC_LABEL: Record<Metric, string> = {
  views: "Mais Vistos",
  purchases: "Mais Comprados",
  cart_adds: "Mais no Carrinho",
};

function metricValue(item: TopProduct, metric: Metric): number {
  if (metric === "purchases") return item.purchases;
  if (metric === "cart_adds") return item.cart_adds;
  return item.views;
}

function truncateName(name: string, max = 20): string {
  return name.length > max ? `${name.slice(0, max)}...` : name;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [metric, setMetric] = useState<Metric>("views");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      const data = await fetchTopProducts({ limit: 10, metric });
      if (!mounted) return;
      setProducts(data);
      setIsLoading(false);
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [metric]);

  const chartData = useMemo(
    () =>
      products.map((p) => ({
        ...p,
        short_name: truncateName(p.name),
        value: metricValue(p, metric),
      })),
    [products, metric],
  );

  return (
    <div className="space-y-6 px-6 py-8">
      <section className="flex flex-wrap gap-3">
        {(["views", "purchases", "cart_adds"] as Metric[]).map((item) => (
          <button
            key={item}
            onClick={() => setMetric(item)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              metric === item
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {METRIC_LABEL[item]}
          </button>
        ))}
      </section>

      <section className="rounded-2xl bg-slate-800 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <ArrowUpDown className="h-5 w-5 text-indigo-300" />
          Top 10 Produtos — {METRIC_LABEL[metric]}
        </h2>
        {isLoading ? (
          <div className="h-[300px] animate-pulse rounded-xl bg-slate-700/40" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 24 }}>
              <XAxis
                type="number"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "#334155" }}
              />
              <YAxis
                type="category"
                dataKey="short_name"
                width={160}
                tick={{ fill: "#cbd5e1", fontSize: 12 }}
                axisLine={{ stroke: "#334155" }}
              />
              <Tooltip
                formatter={(value) =>
                  Number(value ?? 0).toLocaleString("pt-BR")
                }
                labelFormatter={(label) => `Produto: ${label}`}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl bg-slate-800">
        <div className="grid grid-cols-12 border-b border-slate-700 bg-slate-900/50 px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
          <div className="col-span-4">Produto</div>
          <div className="col-span-2">Categoria</div>
          <div className="col-span-1 text-right">Visualizações</div>
          <div className="col-span-1 text-right">Carrinho</div>
          <div className="col-span-1 text-right">Compras</div>
          <div className="col-span-3 text-right">Conversão</div>
        </div>
        <div>
          {products.map((product, idx) => {
            const conversionClass =
              product.conversion_rate > 5
                ? "text-emerald-400"
                : product.conversion_rate >= 2
                  ? "text-amber-400"
                  : "text-slate-400";

            return (
              <div
                key={product.id}
                className={`grid grid-cols-12 items-center px-4 py-3 text-sm text-slate-200 ${
                  idx % 2 === 0 ? "bg-slate-800" : "bg-slate-800/50"
                }`}
              >
                <div className="col-span-4 flex items-center gap-3">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-8 w-8 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate">{product.name}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs ${
                      CATEGORY_PILL[product.category] ??
                      "bg-slate-600/30 text-slate-200"
                    }`}
                  >
                    {product.category}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  {product.views.toLocaleString("pt-BR")}
                </div>
                <div className="col-span-1 text-right">
                  {product.cart_adds.toLocaleString("pt-BR")}
                </div>
                <div className="col-span-1 text-right">
                  {product.purchases.toLocaleString("pt-BR")}
                </div>
                <div
                  className={`col-span-3 text-right font-medium ${conversionClass}`}
                >
                  {product.conversion_rate.toFixed(2)}%
                </div>
              </div>
            );
          })}

          {!products.length && !isLoading && (
            <div className="flex items-center justify-center gap-2 px-4 py-10 text-slate-400">
              <Package className="h-4 w-4" />
              Sem dados de produto para exibir.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
