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

export interface FunnelStage {
  stage: string;
  count: number;
  rate: number;
  color: string;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
  views: number;
  purchases: number;
  cart_adds: number;
  conversion_rate: number;
}

export interface DayStats {
  date: string;
  events: number;
  purchases: number;
}

export interface CategoryStat {
  category_id: string;
  name: string;
  color: string;
  total_events: number;
  views: number;
  purchases: number;
  conversion_rate: number;
}

export interface ProfileStat {
  profile_type: string;
  user_count: number;
  total_events: number;
  total_purchases: number;
  avg_events_per_user: number;
}

export interface OverviewKPIs {
  total_events: number;
  total_purchases: number;
  total_views: number;
  unique_users: number;
  conversion_rate: number;
  ai_uplift: { base_rate: number; ai_rate: number };
  top_category: string;
  avg_session_depth: number;
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

// ─── Recomendações ───────────────────────────────────────────────────────────

export interface RecommendationItem {
  product: Product;
  score: number;
  strategy: "popular" | "collaborative" | "item_similarity" | "hybrid";
  reason: string;
}

function mapRecommendation(raw: Record<string, unknown>): RecommendationItem {
  return {
    product: mapProduct(raw),
    score: raw.score as number,
    strategy: raw.strategy as RecommendationItem["strategy"],
    reason: raw.reason as string,
  };
}

export async function fetchPopularRecommendations(
  limit = 10,
): Promise<RecommendationItem[]> {
  try {
    const response = await apiClient.get<Record<string, unknown>[]>(
      "/api/recommendations/popular",
      { params: { limit } },
    );
    return response.data.map(mapRecommendation);
  } catch (error) {
    console.warn("API unavailable, using fallback data", error);
    return PRODUCTS.slice(0, limit).map((product) => ({
      product,
      score: 1,
      strategy: "popular" as const,
      reason: "Popular na loja",
    }));
  }
}

export async function fetchUserRecommendations(
  userId: string,
  options?: { limit?: number; productId?: string },
): Promise<RecommendationItem[]> {
  try {
    const params: Record<string, unknown> = { limit: options?.limit ?? 10 };
    if (options?.productId) {
      params.product_id = options.productId;
    }

    const response = await apiClient.get<Record<string, unknown>[]>(
      `/api/recommendations/user/${userId}`,
      { params },
    );
    return response.data.map(mapRecommendation);
  } catch (error) {
    console.warn("API unavailable, using fallback data", error);
    return PRODUCTS.slice(0, options?.limit ?? 10).map((product) => ({
      product,
      score: 1,
      strategy: "popular" as const,
      reason: "Popular na loja",
    }));
  }
}

export async function fetchItemRecommendations(
  productId: string,
  limit = 8,
): Promise<RecommendationItem[]> {
  try {
    const response = await apiClient.get<Record<string, unknown>[]>(
      `/api/recommendations/item/${productId}`,
      { params: { limit } },
    );
    return response.data.map(mapRecommendation);
  } catch (error) {
    console.warn("API unavailable, using fallback data", error);
    return PRODUCTS.filter((p) => p.id !== productId)
      .slice(0, limit)
      .map((product) => ({
        product,
        score: 1,
        strategy: "collaborative" as const,
        reason: "Também muito buscado na loja",
      }));
  }
}

export async function fetchCategoryRecommendations(
  categoryId: string,
  options?: { limit?: number; excludeId?: string },
): Promise<RecommendationItem[]> {
  try {
    const params: Record<string, unknown> = { limit: options?.limit ?? 10 };
    if (options?.excludeId) {
      params.exclude_id = options.excludeId;
    }

    const response = await apiClient.get<Record<string, unknown>[]>(
      `/api/recommendations/category/${categoryId}`,
      { params },
    );
    return response.data.map(mapRecommendation);
  } catch (error) {
    console.warn("API unavailable, using fallback data", error);
    return PRODUCTS.filter((p) => p.category === categoryId)
      .slice(0, options?.limit ?? 10)
      .map((product) => ({
        product,
        score: 1,
        strategy: "popular" as const,
        reason: "Popular na loja",
      }));
  }
}

// ─── Simulação ───────────────────────────────────────────────────────────────

export interface SimulationStatus {
  total_events: number;
  simulated_events: number;
  real_events: number;
  events_by_type: Record<string, number>;
  unique_simulated_users: number;
  most_viewed_product: {
    product_id: string;
    product_name: string;
    views: number;
  } | null;
}

export interface SimulatedUser {
  id: string;
  name: string;
  profile_type: string;
  total_events: number;
  total_purchases: number;
  favorite_category: string | null;
}

export async function triggerBatchSimulation(
  clear = false,
  delay = 0.05,
): Promise<void> {
  try {
    await apiClient.post(`/api/simulation/batch`, null, {
      params: { clear, delay },
    });
  } catch (error) {
    console.error("Failed to trigger batch simulation", error);
    throw error;
  }
}

export async function getSimulationStatus(): Promise<SimulationStatus> {
  try {
    const response = await apiClient.get<SimulationStatus>(
      `/api/simulation/status`,
    );
    return response.data;
  } catch (error) {
    console.warn("API unavailable for simulation status", error);
    return {
      total_events: 0,
      simulated_events: 0,
      real_events: 0,
      events_by_type: {},
      unique_simulated_users: 0,
      most_viewed_product: null,
    };
  }
}

export async function clearSimulatedEvents(): Promise<number> {
  try {
    const response = await apiClient.delete<{ deleted: number }>(
      `/api/simulation/clear`,
    );
    return response.data.deleted;
  } catch (error) {
    console.error("Failed to clear simulated events", error);
    throw error;
  }
}

export async function getSimulatedUsers(): Promise<SimulatedUser[]> {
  try {
    const response = await apiClient.get<SimulatedUser[]>(
      `/api/simulation/users`,
    );
    return response.data;
  } catch (error) {
    console.warn("API unavailable for simulated users", error);
    return [];
  }
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function fetchOverviewKPIs(): Promise<OverviewKPIs> {
  try {
    const response = await apiClient.get<OverviewKPIs>(
      "/api/analytics/overview",
    );
    return response.data;
  } catch (error) {
    console.warn("API unavailable for overview KPIs", error);
    return {
      total_events: 0,
      total_purchases: 0,
      total_views: 0,
      unique_users: 0,
      conversion_rate: 0,
      ai_uplift: { base_rate: 0, ai_rate: 0 },
      top_category: "",
      avg_session_depth: 0,
    };
  }
}

export async function fetchFunnel(): Promise<FunnelStage[]> {
  try {
    const response = await apiClient.get<FunnelStage[]>(
      "/api/analytics/funnel",
    );
    return response.data;
  } catch (error) {
    console.warn("API unavailable for funnel", error);
    return [];
  }
}

export async function fetchTopProducts(params?: {
  limit?: number;
  metric?: string;
}): Promise<TopProduct[]> {
  try {
    const response = await apiClient.get<TopProduct[]>(
      "/api/analytics/top-products",
      { params },
    );
    return response.data;
  } catch (error) {
    console.warn("API unavailable for top products", error);
    return [];
  }
}

export async function fetchEventsOverTime(days?: number): Promise<DayStats[]> {
  try {
    const response = await apiClient.get<DayStats[]>(
      "/api/analytics/events-over-time",
      { params: { days } },
    );
    return response.data;
  } catch (error) {
    console.warn("API unavailable for events over time", error);
    return [];
  }
}

export async function fetchCategoryStats(): Promise<CategoryStat[]> {
  try {
    const response = await apiClient.get<CategoryStat[]>(
      "/api/analytics/category-stats",
    );
    return response.data;
  } catch (error) {
    console.warn("API unavailable for category stats", error);
    return [];
  }
}

export async function fetchUserProfileStats(): Promise<ProfileStat[]> {
  try {
    const response = await apiClient.get<ProfileStat[]>(
      "/api/analytics/user-profiles",
    );
    return response.data;
  } catch (error) {
    console.warn("API unavailable for user profile stats", error);
    return [];
  }
}

export default apiClient;
