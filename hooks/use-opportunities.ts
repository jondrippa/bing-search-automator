import { trpc } from "@/lib/trpc";
import { useCallback } from "react";

export function useOpportunities() {
  // Fetch opportunities from API
  const { data: opportunities = [], isLoading, error } = trpc.opportunities.getOpportunities.useQuery();
  
  // Mark opportunity as completed
  const markCompletedMutation = trpc.opportunities.markCompleted.useMutation();

  const markCompleted = useCallback(
    async (externalId: string, pointsEarned: number) => {
      try {
        await markCompletedMutation.mutateAsync({
          externalId,
          pointsEarned,
        });
        return { success: true };
      } catch (error) {
        console.error("Error marking opportunity as completed:", error);
        return { success: false, error };
      }
    },
    [markCompletedMutation]
  );

  // Get opportunities by category
  const getByCategory = useCallback(
    (category: string) => {
      if (!opportunities) return [];
      if (category === "all") return opportunities;
      return opportunities.filter((opp: any) => opp.category === category);
    },
    [opportunities]
  );

  // Get total available points
  const getTotalPoints = useCallback(() => {
    if (!opportunities) return 0;
    return opportunities.reduce((sum: number, opp: any) => {
      if (!opp.isCompleted) {
        return sum + (opp.pointsAvailable || 0);
      }
      return sum;
    }, 0);
  }, [opportunities]);

  // Get expiring opportunities (within 24 hours)
  const getExpiringOpportunities = useCallback(() => {
    if (!opportunities) return [];
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return opportunities.filter((opp: any) => {
      if (!opp.expiresAt) return false;
      const expiresAt = new Date(opp.expiresAt);
      return expiresAt > now && expiresAt <= tomorrow;
    });
  }, [opportunities]);

  return {
    opportunities,
    isLoading,
    error,
    markCompleted,
    getByCategory,
    getTotalPoints,
    getExpiringOpportunities,
  };
}
