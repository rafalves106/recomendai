import { useEffect, useState } from "react";
import type { Product } from "../types";
import { fetchProductById } from "../services/api";
import { PRODUCTS } from "../data/products";

export function useProduct(productId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId || !productId.trim()) {
      setIsLoading(false);
      setProduct(null);
      return;
    }

    const loadProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProductById(productId);
        setProduct(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao carregar produto";
        setError(message);

        // Try to find in fallback
        const fallback = PRODUCTS.find((p) => p.id === productId);
        if (fallback) {
          setProduct(fallback);
          setError(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  return { product, isLoading, error };
}
