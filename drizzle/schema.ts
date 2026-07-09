import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// User metrics table for tracking points and searches
export const userMetrics = mysqlTable("userMetrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  totalPoints: int("totalPoints").default(0).notNull(),
  totalSearches: int("totalSearches").default(0).notNull(),
  dailyQuota: int("dailyQuota").default(10).notNull(),
  dailySearches: int("dailySearches").default(0).notNull(),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Daily stats table for tracking historical data
export const dailyStats = mysqlTable("dailyStats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD format
  searches: int("searches").default(0).notNull(),
  points: int("points").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Opportunities table for tracking available earning opportunities
export const opportunities = mysqlTable("opportunities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  externalId: varchar("externalId", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // quiz, survey, shopping, etc.
  pointsAvailable: int("pointsAvailable").default(0).notNull(),
  pointsEarned: int("pointsEarned").default(0),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  expiresAt: timestamp("expiresAt"),
  url: text("url"),
  icon: varchar("icon", { length: 255 }),
  priority: varchar("priority", { length: 20 }).default("medium").notNull(),
  lastSynced: timestamp("lastSynced").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Microsoft auth tokens table for storing Bing Rewards access
export const microsoftTokens = mysqlTable("microsoftTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt").notNull(),
  email: varchar("email", { length: 320 }),
  lastRefreshed: timestamp("lastRefreshed").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserMetrics = typeof userMetrics.$inferSelect;
export type InsertUserMetrics = typeof userMetrics.$inferInsert;
export type DailyStats = typeof dailyStats.$inferSelect;
export type InsertDailyStats = typeof dailyStats.$inferInsert;
export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;
export type MicrosoftToken = typeof microsoftTokens.$inferSelect;
export type InsertMicrosoftToken = typeof microsoftTokens.$inferInsert;
