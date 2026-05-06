import { useEffect, useState } from "react";
import type { RecommendationItem } from "../services/api";
import {
  fetchUserRecommendations,
  fetchItemRecommendations,
  fetchPopularRecommendations,
} from "../services/api";
import { useStore } from "../store";
import type { RecommendationSection } from "../types";

function buildSection(
  title: string,
  subtitle: string | undefined,
  strategy: "popular" | "collaborative" | "item_similarity" | "hybrid",
  items: RecommendationItem[],
): RecommendationSection {
  return {
    title,
    subtitle,
    strategy,
    recommendations: items.map((item) => ({
      product: item.product,
      score: item.score,
      strategy,
      reason: item.reason,
    })),
  };
}

export function usePersonalizedRecommendations(productId?: string) {
  const [sections, setSections] = useState<RecommendationSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      setIsLoading(true);

      const currentUserId = useStore.getState().currentUserId;

      try {
        const [userRecs, popularRecs] = await Promise.allSettled([
          fetchUserRecommendations(currentUserId, {
            limit: 8,
            productId,
          }),
          fetchPopularRecommendations(8),
        ]).then((results) => [
          results[0].status === "fulfilled" ? results[0].value : [],
          results[1].status === "fulfilled" ? results[1].value : [],
        ]);

        const newSections: RecommendationSection[] = [
          buildSection("Recomendados para Você", undefined, "hybrid", userRecs),
          buildSection(
            "Mais Populares Agora",
            undefined,
            "popular",
            popularRecs,
          ),
        ];

        setSections(newSections);
      } catch (error) {
        console.warn("Failed to load personalized recommendations", error);
        setSections([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecommendations();
  }, [productId]);

  return { sections, isLoading };
}

export function useItemRecommendations(productId: string | undefined) {
  const [sections, setSections] = useState<RecommendationSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      if (!productId) {
        setSections([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const currentUserId = useStore.getState().currentUserId;

      try {
        const [itemRecs, userRecs] = await Promise.allSettled([
          fetchItemRecommendations(productId, 8),
          fetchUserRecommendations(currentUserId, { limit: 6 }),
        ]).then((results) => [
          results[0].status === "fulfilled" ? results[0].value : [],
          results[1].status === "fulfilled" ? results[1].value : [],
        ]);

        const newSections: RecommendationSection[] = [
          buildSection(
            "Quem viu isso também viu",
            undefined,
            "item_similarity",
            itemRecs,
          ),
          buildSection(
            "Você também pode gostar",
            undefined,
            "hybrid",
            userRecs,
          ),
        ];

        setSections(newSections);
      } catch (error) {
        console.warn("Failed to load item recommendations", error);
        setSections([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecommendations();
  }, [productId]);

  return { sections, isLoading };
}
