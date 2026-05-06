import { postEvent, type EventPayload } from "./api";
import { useStore } from "../store";

/**
 * Get current user and session from store
 */
function getStoreState() {
  return useStore.getState();
}

/**
 * Helper to build event payload
 */
function buildEventPayload(
  productId: string,
  eventType: EventPayload["event_type"],
  metadata?: Record<string, unknown>,
): EventPayload {
  const { currentUserId, sessionId } = getStoreState();
  return {
    user_id: currentUserId,
    session_id: sessionId,
    product_id: productId,
    event_type: eventType,
    metadata,
  };
}

/**
 * Track product page view
 */
export async function trackView(productId: string): Promise<void> {
  try {
    const payload = buildEventPayload(productId, "view");
    await postEvent(payload);
  } catch (error) {
    console.warn("[trackView] Error:", error);
  }
}

/**
 * Track product card click
 */
export async function trackClick(productId: string): Promise<void> {
  try {
    const payload = buildEventPayload(productId, "click");
    await postEvent(payload);
  } catch (error) {
    console.warn("[trackClick] Error:", error);
  }
}

/**
 * Track adding product to cart
 */
export async function trackAddToCart(productId: string): Promise<void> {
  try {
    const payload = buildEventPayload(productId, "add_to_cart");
    await postEvent(payload);
  } catch (error) {
    console.warn("[trackAddToCart] Error:", error);
  }
}

/**
 * Track removing product from cart
 */
export async function trackRemoveFromCart(productId: string): Promise<void> {
  try {
    const payload = buildEventPayload(productId, "remove_from_cart");
    await postEvent(payload);
  } catch (error) {
    console.warn("[trackRemoveFromCart] Error:", error);
  }
}

/**
 * Track purchase — posts one event per product
 */
export async function trackPurchase(productIds: string[]): Promise<void> {
  try {
    const promises = productIds.map((id) => {
      const payload = buildEventPayload(id, "purchase");
      return postEvent(payload);
    });
    await Promise.allSettled(promises);
  } catch (error) {
    console.warn("[trackPurchase] Error:", error);
  }
}

/**
 * Track search action
 */
export async function trackSearch(query: string): Promise<void> {
  try {
    const payload = buildEventPayload("search", "search", { query });
    await postEvent(payload);
  } catch (error) {
    console.warn("[trackSearch] Error:", error);
  }
}
