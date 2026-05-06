import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Star } from "lucide-react";
import { cn } from "../../lib/cn";
import useStore from "../../store";
import { CATEGORIES } from "../../data/products";
import type { Product } from "../../types";

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  showRecommendationBadge?: boolean;
  recommendationReason?: string;
  className?: string;
}

export function ProductCard({
  product,
  onAddToCart,
  showRecommendationBadge = false,
  recommendationReason,
  className,
}: ProductCardProps) {
  const addToCart = useStore((state) => state.addToCart);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const categoryName = useMemo(
    () =>
      CATEGORIES.find((category) => category.id === product.category)?.name ??
      product.category,
    [product.category],
  );

  useEffect(() => {
    if (!feedbackVisible) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setFeedbackVisible(false);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [feedbackVisible]);

  const ratingStars = useMemo(() => {
    const filled = Math.round(product.rating);
    return Array.from({ length: 5 }, (_, index) => index < filled);
  }, [product.rating]);

  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const handleAddToCart = () => {
    if (!product.inStock) {
      return;
    }

    addToCart(product);
    onAddToCart?.(product);
    setFeedbackVisible(true);
  };

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl bg-slate-800 shadow-lg transition duration-300 hover:scale-[1.02] hover:shadow-glow",
        className,
      )}
    >
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className={cn(
            "aspect-square w-full object-cover",
            !product.inStock && "grayscale",
          )}
        />

        <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-300">
          {categoryName}
        </span>

        {showRecommendationBadge ? (
          <span className="absolute right-2 top-2 rounded-full bg-indigo-500/90 px-2 py-1 text-xs font-semibold text-white">
            ✨ Recomendado
          </span>
        ) : null}

        {!product.inStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70">
            <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200">
              Fora de estoque
            </span>
          </div>
        ) : null}
      </div>

      <div className="space-y-4 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-white">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="flex items-center gap-0.5 text-amber-400">
            {ratingStars.map((filled, index) => (
              <Star
                key={`${product.id}-star-${index}`}
                className={cn("h-3.5 w-3.5", filled && "fill-amber-400")}
              />
            ))}
          </div>
          <span>({product.reviewCount})</span>
        </div>

        <div className="space-y-1">
          {product.originalPrice ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 line-through">
                R$ {product.originalPrice.toFixed(2).replace(".", ",")}
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                -{discountPercent}%
              </span>
            </div>
          ) : null}

          <p className="text-xl font-bold text-white">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition",
            product.inStock
              ? "bg-indigo-600 hover:bg-indigo-500"
              : "cursor-not-allowed bg-slate-700 text-slate-400",
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.inStock ? "Adicionar ao carrinho" : "Indisponível"}
        </button>

        {feedbackVisible ? (
          <p className="text-xs font-medium text-cyan-400">Adicionado!</p>
        ) : null}

        {recommendationReason ? (
          <p className="text-xs italic text-cyan-400">{recommendationReason}</p>
        ) : null}
      </div>
    </article>
  );
}
