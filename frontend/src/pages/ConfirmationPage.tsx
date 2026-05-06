import { useLocation, Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { RecommendationRow } from "../components/store/RecommendationRow";
import { PRODUCTS } from "../data/products";
import type { CartItem, RecommendationSection } from "../types";

export function ConfirmationPage() {
  const location = useLocation();
  const state = location.state as {
    orderId?: string;
    customerName?: string;
    items?: CartItem[];
  } | null;

  const orderId = state?.orderId || "ORD-" + Date.now();
  const customerName = state?.customerName || "Cliente";
  const items = state?.items || [];

  // Build recommendation sections from purchase
  const purchasedCategories = new Set(items.map((i) => i.product.category));
  const similarSection: RecommendationSection | null =
    purchasedCategories.size > 0
      ? {
          title: "Baseado na sua compra",
          subtitle: undefined,
          strategy: "hybrid",
          recommendations: PRODUCTS.filter(
            (p) =>
              purchasedCategories.has(p.category) &&
              !items.find((i) => i.product.id === p.id),
          )
            .slice(0, 5)
            .map((p) => ({
              product: p,
              score: 0.8,
              strategy: "hybrid" as const,
              reason: "Combina com o que você comprou",
            })),
        }
      : null;

  const collaborativeSection: RecommendationSection = {
    title: "Outros clientes também compraram",
    subtitle: undefined,
    strategy: "collaborative",
    recommendations: PRODUCTS.slice(10, 15).map((p) => ({
      product: p,
      score: 0.75,
      strategy: "collaborative" as const,
      reason: "Popular entre clientes com gosto similar",
    })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="animate-bounce">
              <CheckCircle className="w-20 h-20 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Pedido Realizado!
          </h1>
          <p className="text-slate-300 text-lg mb-4">
            Obrigado, {customerName}! Seu pedido foi confirmado.
          </p>
          <div className="inline-block bg-cyan-900/40 border border-cyan-500/50 rounded-full px-4 py-2">
            <span className="text-cyan-300 font-semibold">
              Pedido #{orderId}
            </span>
          </div>
        </div>

        {/* Order Summary Card */}
        {items.length > 0 && (
          <div className="bg-slate-800 rounded-2xl p-6 mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Itens do Pedido</h2>
            </div>

            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 pb-3 border-b border-slate-700"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      {item.quantity}x R${" "}
                      {item.product.price.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">
                      R${" "}
                      {(item.product.price * item.quantity).toLocaleString(
                        "pt-BR",
                        { minimumFractionDigits: 2 },
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-white">Total:</span>
                <span className="text-2xl font-bold text-white">
                  R${" "}
                  {items
                    .reduce(
                      (sum, item) => sum + item.product.price * item.quantity,
                      0,
                    )
                    .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Recommendation Rows */}
        {similarSection && (
          <div className="mb-12">
            <RecommendationRow section={similarSection} isLoading={false} />
          </div>
        )}

        <div className="mb-12">
          <RecommendationRow section={collaborativeSection} isLoading={false} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            to="/produtos"
            className="px-6 py-3 border border-indigo-600 text-indigo-400 rounded-xl font-semibold hover:bg-indigo-600/10 transition-colors text-center"
          >
            Ver mais produtos
          </Link>
          <Link
            to="/admin"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            Ir para o Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-cyan-400">
          As suas compras alimentam o motor de recomendação da IA ✨
        </p>
      </div>
    </div>
  );
}

export default ConfirmationPage;
