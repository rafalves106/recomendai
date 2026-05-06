import { useEffect, useState } from "react";
import type { Product } from "../types";
import { fetchProducts } from "../services/api";
import { PRODUCTS } from "../data/products";

interface UseProductsParams {
  category?: string;
  q?: string;
  in_stock?: boolean;
  limit?: number;
}

export function useProducts(params?: UseProductsParams) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProducts(params);
        setProducts(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao carregar produtos";
        setError(message);
        setProducts(PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [JSON.stringify(params)]);

  return { products, isLoading, error };
}
