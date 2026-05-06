import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  Package,
  Tag,
  CheckCircle,
} from "lucide-react";
import { useProduct } from "../hooks/useProduct";
import { useStore } from "../store";
import { RecommendationRow } from "../components/store/RecommendationRow";
import { trackView, trackAddToCart } from "../services/events";
import { CATEGORIES } from "../data/products";
import { useItemRecommendations } from "../hooks/useRecommendations";

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const { product, isLoading, error } = useProduct(productId);
  const { isInCart, addToCart } = useStore();
  const { sections: recSections, isLoading: recLoading } =
    useItemRecommendations(product?.id);

  // Track view on mount
  useEffect(() => {
    if (product?.id) {
      trackView(product.id);
    }
  }, [product?.id]);

  const handleAddToCart = async () => {
    if (product) {
      addToCart(product);
      await trackAddToCart(product.id);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Link
            to="/produtos"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-slate-800 rounded-2xl animate-pulse" />
            <div className="space-y-6">
              <div className="h-12 bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-8 bg-slate-800 rounded-lg animate-pulse w-2/3" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 bg-slate-800 rounded animate-pulse w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center py-12">
        <div className="text-center">
          <Package className="w-20 h-20 text-slate-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Produto não encontrado
          </h1>
          <Link
            to="/produtos"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl mt-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Produtos
          </Link>
        </div>
      </div>
    );
  }

  const inCart = isInCart(product.id);
  const categoryName =
    CATEGORIES.find((c) => c.id === product.category)?.name || product.category;
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/produtos"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Link>

        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column - Image */}
          <div className="lg:sticky lg:top-24">
            <div className="relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-2xl"
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    Fora de estoque
                  </span>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-slate-900/80 px-3 py-1 rounded-full">
                <span className="text-slate-300 text-sm font-medium">
                  {categoryName}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-slate-400 text-sm">
                  {product.rating.toFixed(1)} ({product.reviewCount} avaliações)
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div>
              {product.originalPrice && (
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-slate-400 line-through text-lg">
                    R${" "}
                    {product.originalPrice.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}
              <div className="text-4xl font-bold text-white">
                R${" "}
                {product.price.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-5 h-5 text-slate-400" />
                <span className="text-slate-400 font-medium">
                  Palavras-chave:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-slate-800 rounded-full px-3 py-1 text-sm text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-colors ${
                inCart
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : product.inStock
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
              }`}
            >
              {inCart ? (
                <>
                  <CheckCircle className="w-6 h-6" />
                  Adicionado ao Carrinho
                </>
              ) : (
                <>
                  <ShoppingCart className="w-6 h-6" />
                  Adicionar ao Carrinho
                </>
              )}
            </button>

            {/* Description */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3">
                Sobre este produto
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Recommendation Sections */}
        <div className="space-y-2">
          {recSections.map((section) => (
            <RecommendationRow
              key={section.title}
              section={section}
              isLoading={recLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
