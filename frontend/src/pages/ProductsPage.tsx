import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, Package } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { ProductCard } from "../components/store/ProductCard";
import { CATEGORIES } from "../data/products";
import { trackSearch } from "../services/events";

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("categoria");
  const qParam = searchParams.get("q");

  const [activeCategory, setActiveCategory] = useState<string | null>(
    categoryParam,
  );
  const [searchInput, setSearchInput] = useState(qParam ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(qParam ?? "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch products with current filters
  const { products, isLoading } = useProducts({
    category: activeCategory ?? undefined,
    q: debouncedQuery || undefined,
  });

  // Track search when query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim()) {
      trackSearch(debouncedQuery.trim());
    }
  }, [debouncedQuery]);

  // Update URL when category changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (activeCategory) {
      newParams.set("categoria", activeCategory);
    } else {
      newParams.delete("categoria");
    }
    setSearchParams(newParams);
  }, [activeCategory, searchParams, setSearchParams]);

  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
  };

  const handleClearFilters = () => {
    setActiveCategory(null);
    setSearchInput("");
  };

  // Skeleton loaders
  const skeletons = Array.from({ length: 12 }, (_, i) => (
    <div
      key={`skeleton-${i}`}
      className="bg-slate-800 rounded-2xl aspect-square animate-pulse"
    />
  ));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-8 h-8 text-indigo-500" />
            <h1 className="text-3xl font-bold text-white">Todos os Produtos</h1>
          </div>
          <p className="text-slate-400 text-lg">
            {products.length} produtos encontrados
          </p>
        </div>

        {/* FILTERS ROW */}
        <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 mb-8 space-y-4">
          {/* Search */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeCategory === null
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Todos
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {skeletons}
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <Package className="w-16 h-16 text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Nenhum produto encontrado
            </h2>
            <p className="text-slate-400 mb-6">
              Tente buscar por outro termo ou categoria
            </p>
            <button
              onClick={handleClearFilters}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {/* PRODUCTS GRID */}
        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
