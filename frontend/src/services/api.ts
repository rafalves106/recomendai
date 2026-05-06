import axios from "axios";
import { PRODUCTS } from "../data/products";
import type { BehaviorEvent, Product } from "../types";

// ─── Cliente HTTP ────────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

// ─── Tipos locais ────────────────────────────────────────────────────────────

export interface LiveEvent {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  event_type: string;
  timestamp: string;
  user_label: string;
}

export interface EventPayload {
  user_id: string;
  session_id: string;
  product_id: string;
  event_type:
    | "view"
    | "search"
    | "click"
    | "add_to_cart"
    | "purchase"
    | "remove_from_cart";
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

// ─── Mapper snake_case → camelCase ───────────────────────────────────────────
// A API Python retorna snake_case; o TypeScript espera camelCase.

function mapProduct(raw: Record<string, unknown>): Product {
  return {
    id: raw.id as string,
    name: raw.name as string,
    description: raw.description as string,
    price: raw.price as number,
    originalPrice: raw.original_price as number | undefined,
    category: raw.category as string,
    imageUrl: raw.image_url as string,
    tags: raw.tags as string[],
    rating: raw.rating as number,
    reviewCount: raw.review_count as number,
    inStock: raw.in_stock as boolean,
  };
}

// ─── Produtos ────────────────────────────────────────────────────────────────

export async function fetchProducts(params?: {
  category?: string;
  q?: string;
  in_stock?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  try {
    const response = await apiClient.get<Record<string, unknown>[]>(
      "/api/products",
      { params },
    );
    return response.data.map(mapProduct);
  } catch (error) {
    console.warn("API unavailable, using fallback data", error);
    return PRODUCTS;
  }
}

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  try {
    const response = await apiClient.get<Record<string, unknown>[]>(
      "/api/products/featured",
      { params: { limit } },
    );
    return response.data.map(mapProduct);
  } catch (error) {
    console.warn("API unavailable, using fallback data", error);
    return PRODUCTS.slice(0, limit);
  }
}

export async function fetchProductsByCategory(
  categoryId: string,
): Promise<Product[]> {
  try {
    const response = await apiClient.get<Record<string, unknown>[]>(
      `/api/products/category/${categoryId}`,
    );
    return response.data.map(mapProduct);
  } catch (error) {
    console.warn("API unavailable, using fallback data", error);
    return PRODUCTS.filter((p) => p.category === categoryId);
  }
}

export async function fetchProductById(productId: string): Promise<Product> {
  try {
    const response = await apiClient.get<Record<string, unknown>>(
      `/api/products/${productId}`,
    );
    return mapProduct(response.data);
  } catch (error) {
    const fallback = PRODUCTS.find((p) => p.id === productId);
    if (fallback) return fallback;
    throw new Error("Produto não encontrado", { cause: error });
  }
}

// ─── Eventos ─────────────────────────────────────────────────────────────────

export async function postEvent(payload: EventPayload): Promise<void> {
  try {
    await apiClient.post("/api/events", payload);
  } catch (error) {
    console.warn("Falha ao registrar evento", error);
    // Nunca lança — rastreamento não pode quebrar a UI
  }
}

export async function fetchLiveEvents(): Promise<LiveEvent[]> {
  try {
    const response = await apiClient.get<LiveEvent[]>("/api/events/live");
    return response.data;
  } catch (error) {
    console.warn("API unavailable", error);
    return [];
  }
}

export async function fetchEventStats(): Promise<Record<string, number>> {
  try {
    const response =
      await apiClient.get<Record<string, number>>("/api/events/stats");
    return response.data;
  } catch (error) {
    console.warn("API unavailable", error);
    return {};
  }
}

export async function fetchUserEvents(
  userId: string,
  limit = 50,
): Promise<BehaviorEvent[]> {
  try {
    const response = await apiClient.get<BehaviorEvent[]>(
      `/api/events/user/${userId}`,
      { params: { limit } },
    );
    return response.data;
  } catch (error) {
    console.warn("API unavailable", error);
    return [];
  }
}

export default apiClient;
