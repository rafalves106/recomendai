import {
  BookOpen,
  Cpu,
  Dumbbell,
  Home,
  Package,
  Sparkles,
  Shirt,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CATEGORIES, PRODUCTS } from "../data/products";
import type { Recommendation, RecommendationSection } from "../types";
import { ProductCard } from "../components/store/ProductCard";
import { RecommendationRow } from "../components/store/RecommendationRow";
import useStore from "../store";

const categoryIcons = {
  Cpu,
  Shirt,
  Home,
  Dumbbell,
  BookOpen,
};

function buildRecommendationSection(
  title: string,
  subtitle: string,
  strategy: RecommendationSection["strategy"],
  products = PRODUCTS,
  reason: string,
): RecommendationSection {
  return {
    title,
    subtitle,
    strategy,
    recommendations: products.map((product, index) => ({
      product,
      score: Number((0.98 - index * 0.03).toFixed(2)),
      strategy,
      reason,
    })) as Recommendation[],
  };
}

export default function HomePage() {
  const activeQuery = useStore((state) => state.query);
  const featuredProducts = PRODUCTS.slice(0, 8);
  const personalizedSection = buildRecommendationSection(
    "Recomendados para Você",
    "Baseado no seu histórico de navegação",
    "hybrid",
    PRODUCTS.slice(8, 13),
    "Baseado no seu histórico de navegação",
  );
  const popularSection = buildRecommendationSection(
    "Mais Populares Agora",
    "Muito comprado nas últimas horas",
    "popular",
    PRODUCTS.slice(13, 18),
    "Muito comprado nas últimas horas",
  );

  return (
    <div className="space-y-20 pb-20">
      <section className="relative min-h-[400px] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px] opacity-10" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-300">
            <Sparkles className="h-4 w-4" />
            Powered by Recomenda.AI
          </span>

          <h1 className="mt-8 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Descubra produtos feitos para você
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Nossa IA analisa seu comportamento e recomenda o que você realmente
            quer encontrar.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/produtos"
              className="rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
            >
              Explorar Produtos
            </Link>
            <Link
              to="/admin"
              className="rounded-full border border-slate-700 px-6 py-3 font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              Ver Dashboard
            </Link>
          </div>

          {activeQuery ? (
            <div className="mt-8 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
              Busca ativa: “{activeQuery}”
            </div>
          ) : null}

          <div className="mt-12 grid w-full gap-4 sm:grid-cols-3">
            {[
              {
                icon: Package,
                value: "30+ Produtos",
                label: "Catálogo simulado",
              },
              {
                icon: Cpu,
                value: "5 Categorias",
                label: "Cobertura do protótipo",
              },
              {
                icon: Sparkles,
                value: "IA em tempo real",
                label: "Recomendação híbrida",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <Icon className="mx-auto h-6 w-6 text-cyan-300" />
                  <p className="mt-3 text-xl font-bold text-white">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white">
          Explorar por Categoria
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((category) => {
            const Icon =
              categoryIcons[category.icon as keyof typeof categoryIcons] ??
              Package;

            return (
              <Link
                key={category.id}
                to={`/produtos?categoria=${category.slug}`}
                className="rounded-2xl bg-slate-800 p-6 transition hover:-translate-y-1 hover:bg-slate-700 hover:shadow-glow-accent"
              >
                <Icon className="h-6 w-6 text-cyan-400" />
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {category.productCount} produtos
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white">Produtos em Destaque</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <div className="space-y-2">
        <RecommendationRow section={personalizedSection} />
        <RecommendationRow section={popularSection} />
      </div>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-slate-900 to-slate-800 p-[1px]">
          <div className="rounded-3xl bg-slate-950 px-6 py-8 sm:px-8">
            <h2 className="text-2xl font-bold text-white">
              Transforme sua loja com recomendações inteligentes
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Leve a experiência de descoberta do cliente a outro nível com uma
              SaaS que combina análise de comportamento, segmentação automática
              e métricas para o time de negócio.
            </p>

            <div className="mt-6">
              <Link
                to="/admin"
                className="inline-flex rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
              >
                Ir para o Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
