import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  metrics: router({
    getMetrics: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;
      const metrics = await db.getUserMetrics(ctx.user.id);
      if (!metrics) {
        // Create default metrics if they don't exist
        return await db.createOrUpdateUserMetrics(ctx.user.id, {
          totalPoints: 0,
          totalSearches: 0,
          dailyQuota: 10,
          dailySearches: 0,
        });
      }
      return metrics;
    }),

    getDailyStats: protectedProcedure
      .input(
        z.object({
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return [];
        return await db.getUserDailyStatsRange(ctx.user.id, input.startDate, input.endDate);
      }),

    recordSearch: protectedProcedure
      .input(
        z.object({
          points: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        await db.incrementUserSearches(ctx.user.id, 1);
        if (input.points) {
          await db.incrementUserPoints(ctx.user.id, input.points);
        }
        // Record daily stats
        const today = new Date().toISOString().split("T")[0];
        const dailyStats = await db.getDailyStats(ctx.user.id, today);
        await db.recordDailyStats({
          userId: ctx.user.id,
          date: today,
          searches: (dailyStats?.searches || 0) + 1,
          points: (dailyStats?.points || 0) + (input.points || 0),
        });
        return { success: true };
      }),
  }),

  opportunities: router({
    getOpportunities: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return await db.getUserOpportunities(ctx.user.id);
    }),

    getByCategory: protectedProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return [];
        return await db.getOpportunitiesByCategory(ctx.user.id, input.category);
      }),

    markCompleted: protectedProcedure
      .input(
        z.object({
          externalId: z.string(),
          pointsEarned: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        await db.markOpportunityCompleted(ctx.user.id, input.externalId, input.pointsEarned);
        await db.incrementUserPoints(ctx.user.id, input.pointsEarned);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
