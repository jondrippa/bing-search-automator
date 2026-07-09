import { eq, and, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
  users,
  userMetrics,
  dailyStats,
  opportunities,
  microsoftTokens,
  InsertUser,
  InsertUserMetrics,
  InsertDailyStats,
  InsertOpportunity,
  InsertMicrosoftToken,
  User,
  UserMetrics,
  DailyStats,
  Opportunity,
  MicrosoftToken,
} from "../drizzle/schema";

let dbInstance: any = null;

async function getDb() {
  if (dbInstance) return dbInstance;

  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "app_db",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    dbInstance = drizzle(pool);
    return dbInstance;
  } catch (error) {
    console.error("Database connection failed:", error);
    return null;
  }
}

// ============ User Management ============

export async function getUserByOpenId(openId: string): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] || null;
}

export async function upsertUser(data: Partial<InsertUser> & { openId: string }): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  const existing = await getUserByOpenId(data.openId);

  if (existing) {
    await db.update(users).set(data).where(eq(users.openId, data.openId));
  } else {
    await db.insert(users).values({
      openId: data.openId,
      name: data.name || null,
      email: data.email || null,
      loginMethod: data.loginMethod || null,
      role: "user",
      lastSignedIn: data.lastSignedIn || new Date(),
    });
  }

  return getUserByOpenId(data.openId);
}

// ============ User Metrics ============

export async function getUserMetrics(userId: number): Promise<UserMetrics | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(userMetrics)
    .where(eq(userMetrics.userId, userId))
    .limit(1);

  return result[0] || null;
}

export async function createOrUpdateUserMetrics(
  userId: number,
  data: Partial<InsertUserMetrics>
): Promise<UserMetrics | null> {
  const db = await getDb();
  if (!db) return null;

  const existing = await getUserMetrics(userId);

  if (existing) {
    await db
      .update(userMetrics)
      .set(data)
      .where(eq(userMetrics.userId, userId));
  } else {
    await db.insert(userMetrics).values({
      userId,
      ...data,
    });
  }

  return getUserMetrics(userId);
}

export async function incrementUserSearches(userId: number, count: number = 1): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const metrics = await getUserMetrics(userId);
  if (metrics) {
    await db
      .update(userMetrics)
      .set({
        totalSearches: metrics.totalSearches + count,
        dailySearches: metrics.dailySearches + count,
      })
      .where(eq(userMetrics.userId, userId));
  }
}

export async function incrementUserPoints(userId: number, points: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const metrics = await getUserMetrics(userId);
  if (metrics) {
    await db
      .update(userMetrics)
      .set({
        totalPoints: metrics.totalPoints + points,
      })
      .where(eq(userMetrics.userId, userId));
  }
}

export async function resetDailySearches(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(userMetrics)
    .set({
      dailySearches: 0,
    })
    .where(eq(userMetrics.userId, userId));
}

// ============ Daily Stats ============

export async function getDailyStats(userId: number, date: string): Promise<DailyStats | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(dailyStats)
    .where(and(eq(dailyStats.userId, userId), eq(dailyStats.date, date)))
    .limit(1);

  return result[0] || null;
}

export async function getUserDailyStatsRange(
  userId: number,
  startDate: string,
  endDate: string
): Promise<DailyStats[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(dailyStats)
    .where(
      and(
        eq(dailyStats.userId, userId),
        gte(dailyStats.date, startDate),
        lte(dailyStats.date, endDate)
      )
    )
    .orderBy(desc(dailyStats.date));
}

export async function recordDailyStats(data: InsertDailyStats): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existing = await getDailyStats(data.userId, data.date);

  if (existing) {
    await db
      .update(dailyStats)
      .set(data)
      .where(
        and(
          eq(dailyStats.userId, data.userId),
          eq(dailyStats.date, data.date)
        )
      );
  } else {
    await db.insert(dailyStats).values(data);
  }
}

// ============ Opportunities ============

export async function getUserOpportunities(userId: number): Promise<Opportunity[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(opportunities)
    .where(eq(opportunities.userId, userId))
    .orderBy(desc(opportunities.priority), desc(opportunities.pointsAvailable));
}

export async function getOpportunitiesByCategory(
  userId: number,
  category: string
): Promise<Opportunity[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(opportunities)
    .where(and(eq(opportunities.userId, userId), eq(opportunities.category, category)))
    .orderBy(desc(opportunities.priority));
}

export async function createOrUpdateOpportunity(
  userId: number,
  externalId: string,
  data: Partial<InsertOpportunity>
): Promise<Opportunity | null> {
  const db = await getDb();
  if (!db) return null;

  const existing = await db
    .select()
    .from(opportunities)
    .where(
      and(
        eq(opportunities.userId, userId),
        eq(opportunities.externalId, externalId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(opportunities)
      .set(data)
      .where(
        and(
          eq(opportunities.userId, userId),
          eq(opportunities.externalId, externalId)
        )
      );
  } else {
    const insertData: any = {
      userId,
      externalId,
      title: data.title || "Untitled",
      category: data.category || "other",
      pointsAvailable: data.pointsAvailable || 0,
      isCompleted: data.isCompleted || false,
      priority: data.priority || "medium",
      ...data,
    };
    await db.insert(opportunities).values(insertData);
  }

  const result = await db
    .select()
    .from(opportunities)
    .where(
      and(
        eq(opportunities.userId, userId),
        eq(opportunities.externalId, externalId)
      )
    )
    .limit(1);

  return result[0] || null;
}

export async function markOpportunityCompleted(
  userId: number,
  externalId: string,
  pointsEarned: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(opportunities)
    .set({
      isCompleted: true,
      pointsEarned,
    })
    .where(
      and(
        eq(opportunities.userId, userId),
        eq(opportunities.externalId, externalId)
      )
    );
}

// ============ Microsoft Tokens ============

export async function getMicrosoftToken(userId: number): Promise<MicrosoftToken | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(microsoftTokens)
    .where(eq(microsoftTokens.userId, userId))
    .limit(1);

  return result[0] || null;
}

export async function saveMicrosoftToken(data: InsertMicrosoftToken): Promise<MicrosoftToken | null> {
  const db = await getDb();
  if (!db) return null;

  const existing = await getMicrosoftToken(data.userId);

  if (existing) {
    await db
      .update(microsoftTokens)
      .set(data)
      .where(eq(microsoftTokens.userId, data.userId));
  } else {
    await db.insert(microsoftTokens).values(data);
  }

  return getMicrosoftToken(data.userId);
}

export async function deleteMicrosoftToken(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(microsoftTokens).where(eq(microsoftTokens.userId, userId));
}
