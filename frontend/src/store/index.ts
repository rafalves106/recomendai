import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PRODUCTS } from "../data/products";
import type { CartItem, Product, SimulatedUser } from "../types";

interface StoreState {
  items: CartItem[];
  currentUserId: string;
  sessionId: string;
  query: string;
  results: Product[];
  isSearching: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string) => boolean;
  resetSession: () => void;
  setQuery: (query: string) => void;
  clearSearch: () => void;
}

const createUuid = (): string => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `uuid-${Math.random().toString(36).slice(2)}-${Date.now()}`;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],
      currentUserId: createUuid(),
      sessionId: createUuid(),
      query: "",
      results: [],
      isSearching: false,
      addToCart: (product) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity: 1 }],
          };
        }),
      removeFromCart: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) => item.product.id !== productId,
              ),
            };
          }

          return {
            items: state.items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item,
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0,
        ),
      isInCart: (productId) =>
        get().items.some((item) => item.product.id === productId),
      resetSession: () => set({ sessionId: createUuid() }),
      setQuery: (query) => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
          set({ query: "", results: [], isSearching: false });
          return;
        }

        const results = PRODUCTS.filter((product) => {
          const haystack = [
            product.name,
            product.description,
            product.tags.join(" "),
          ]
            .join(" ")
            .toLowerCase();

          return haystack.includes(normalizedQuery);
        });

        set({ query, results, isSearching: true });
      },
      clearSearch: () => set({ query: "", results: [], isSearching: false }),
    }),
    {
      name: "recomenda-ai-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export type { SimulatedUser };

export default useStore;
