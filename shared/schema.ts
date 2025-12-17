import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatarId: integer("avatar_id").notNull().default(0),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  totalKills: integer("total_kills").notNull().default(0),
  totalDeaths: integer("total_deaths").notNull().default(0),
  matchesPlayed: integer("matches_played").notNull().default(0),
  matchesWon: integer("matches_won").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matches = pgTable("matches", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  status: text("status").notNull().default("waiting"),
  winnerId: varchar("winner_id"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matchPlayers = pgTable("match_players", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull(),
  playerId: varchar("player_id").notNull(),
  kills: integer("kills").notNull().default(0),
  deaths: integer("deaths").notNull().default(0),
  score: integer("score").notNull().default(0),
  isReady: boolean("is_ready").notNull().default(false),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const playersRelations = relations(players, ({ many }) => ({
  matchPlayers: many(matchPlayers),
}));

export const matchesRelations = relations(matches, ({ many, one }) => ({
  matchPlayers: many(matchPlayers),
  winner: one(players, {
    fields: [matches.winnerId],
    references: [players.id],
  }),
}));

export const matchPlayersRelations = relations(matchPlayers, ({ one }) => ({
  match: one(matches, {
    fields: [matchPlayers.matchId],
    references: [matches.id],
  }),
  player: one(players, {
    fields: [matchPlayers.playerId],
    references: [players.id],
  }),
}));

export const insertPlayerSchema = createInsertSchema(players).pick({
  username: true,
  password: true,
});

export const loginSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(4),
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type MatchPlayer = typeof matchPlayers.$inferSelect;
