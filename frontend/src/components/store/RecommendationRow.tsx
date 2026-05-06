import { Sparkles } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { RecommendationSection } from "../../types";

export interface RecommendationRowProps {
  section: RecommendationSection;
  isLoading?: boolean;
}

function StrategyBadge({ strategy }: { strategy: string }) {
  switch (strategy) {
    case "popular":
      return (
        <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-400">
          🔥 Popularidade
        </span>
      );
    case "collaborative":
      return (
        <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300">
          👥 Colaborativo
        </span>
      );
    case "item_similarity":
      return (
        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
          🔗 Similaridade
        </span>
      );
    default:
      return (
        <span className="rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-3 py-1 text-xs font-semibold text-white">
          🤖 IA Híbrida
        </span>
      );
  }
}

export function RecommendationRow({
  section,
  isLoading,
}: RecommendationRowProps) {
  return (
    <section className="space-y-4 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">{section.title}</h2>
          </div>
          {section.subtitle ? (
            <p className="mt-2 text-sm text-slate-400">{section.subtitle}</p>
          ) : null}
        </div>
        <StrategyBadge strategy={section.strategy} />
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="min-w-[220px] animate-pulse overflow-hidden rounded-2xl bg-slate-800"
            >
              <div className="aspect-square bg-slate-700" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded bg-slate-700" />
                <div className="h-3 w-1/2 rounded bg-slate-700" />
                <div className="h-10 rounded-xl bg-slate-700" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {section.recommendations.map((recommendation) => (
              <ProductCard
                key={recommendation.product.id}
                product={recommendation.product}
                showRecommendationBadge
                recommendationReason={recommendation.reason}
                className="min-w-[220px] flex-shrink-0"
              />
            ))}
          </div>
          <p className="mt-2 pr-4 text-right text-xs text-slate-600">
            ✨ Recomendações geradas pelo motor de IA Recomenda.AI
          </p>
        </>
      )}
    </section>
  );
}
