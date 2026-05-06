/** Product data used throughout the storefront and dashboard. */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

/** Category metadata for storefront navigation and filtering. */
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
}

/** Item stored in the shopping cart. */
export interface CartItem {
  product: Product;
  quantity: number;
}

/** Registered or simulated user profile information. */
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

/** Event types captured by the recommendation engine. */
export type EventType =
  | "view"
  | "search"
  | "click"
  | "add_to_cart"
  | "purchase"
  | "remove_from_cart";

/** Behavior event emitted by user interactions inside the app. */
export interface BehaviorEvent {
  id: string;
  userId: string;
  productId: string;
  eventType: EventType;
  timestamp: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

/** Product recommendation entry returned by the AI engine. */
export interface Recommendation {
  product: Product;
  score: number;
  strategy: "popular" | "collaborative" | "item_similarity" | "hybrid";
  reason: string;
}

/** A section that groups recommendations by context or strategy. */
export interface RecommendationSection {
  title: string;
  subtitle?: string;
  recommendations: Recommendation[];
  strategy: string;
}

/** Dashboard metric displayed in the admin overview. */
export interface DashboardKPI {
  label: string;
  value: string | number;
  change: number;
  changeType: "increase" | "decrease" | "neutral";
  icon: string;
  unit?: string;
}

/** Top-performing product metrics used in analytics tables and charts. */
export interface TopProduct {
  product: Product;
  views: number;
  purchases: number;
  cartAdds: number;
  conversionRate: number;
}

/** Profile used to simulate synthetic browsing and buying behavior. */
export interface SimulatedUser {
  id: string;
  name: string;
  profileType:
    | "tech_enthusiast"
    | "fashion_shopper"
    | "home_decor"
    | "bargain_hunter"
    | "loyal_customer";
  favoriteCategories: string[];
  sessionCount: number;
  totalPurchases: number;
}
