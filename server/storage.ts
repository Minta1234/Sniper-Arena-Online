import { players, matches, matchPlayers, type Player, type InsertPlayer, type Match, type MatchPlayer } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayerByUsername(username: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, data: Partial<Player>): Promise<Player | undefined>;
  getLeaderboard(limit?: number): Promise<Player[]>;
  
  createMatch(): Promise<Match>;
  getMatch(id: string): Promise<Match | undefined>;
  updateMatch(id: string, data: Partial<Match>): Promise<Match | undefined>;
  getWaitingMatch(): Promise<Match | undefined>;
  
  addPlayerToMatch(matchId: string, playerId: string): Promise<MatchPlayer>;
  getMatchPlayers(matchId: string): Promise<(MatchPlayer & { player: Player })[]>;
  updateMatchPlayer(id: string, data: Partial<MatchPlayer>): Promise<MatchPlayer | undefined>;
  getMatchPlayer(matchId: string, playerId: string): Promise<MatchPlayer | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async getPlayerByUsername(username: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.username, username));
    return player || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db
      .insert(players)
      .values(insertPlayer)
      .returning();
    return player;
  }

  async updatePlayer(id: string, data: Partial<Player>): Promise<Player | undefined> {
    const [player] = await db
      .update(players)
      .set(data)
      .where(eq(players.id, id))
      .returning();
    return player || undefined;
  }

  async getLeaderboard(limit: number = 20): Promise<Player[]> {
    return db.select().from(players).orderBy(desc(players.totalKills)).limit(limit);
  }

  async createMatch(): Promise<Match> {
    const [match] = await db
      .insert(matches)
      .values({ status: "waiting" })
      .returning();
    return match;
  }

  async getMatch(id: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || undefined;
  }

  async updateMatch(id: string, data: Partial<Match>): Promise<Match | undefined> {
    const [match] = await db
      .update(matches)
      .set(data)
      .where(eq(matches.id, id))
      .returning();
    return match || undefined;
  }

  async getWaitingMatch(): Promise<Match | undefined> {
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.status, "waiting"))
      .limit(1);
    return match || undefined;
  }

  async addPlayerToMatch(matchId: string, playerId: string): Promise<MatchPlayer> {
    const [mp] = await db
      .insert(matchPlayers)
      .values({ matchId, playerId })
      .returning();
    return mp;
  }

  async getMatchPlayers(matchId: string): Promise<(MatchPlayer & { player: Player })[]> {
    const result = await db
      .select()
      .from(matchPlayers)
      .innerJoin(players, eq(matchPlayers.playerId, players.id))
      .where(eq(matchPlayers.matchId, matchId));
    
    return result.map(r => ({
      ...r.match_players,
      player: r.players,
    }));
  }

  async updateMatchPlayer(id: string, data: Partial<MatchPlayer>): Promise<MatchPlayer | undefined> {
    const [mp] = await db
      .update(matchPlayers)
      .set(data)
      .where(eq(matchPlayers.id, id))
      .returning();
    return mp || undefined;
  }

  async getMatchPlayer(matchId: string, playerId: string): Promise<MatchPlayer | undefined> {
    const [mp] = await db
      .select()
      .from(matchPlayers)
      .where(eq(matchPlayers.matchId, matchId));
    
    const found = await db
      .select()
      .from(matchPlayers)
      .where(eq(matchPlayers.matchId, matchId));
    
    return found.find(m => m.playerId === playerId) || undefined;
  }
}

export const storage = new DatabaseStorage();
