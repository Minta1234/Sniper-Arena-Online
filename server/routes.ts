import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { loginSchema, insertPlayerSchema } from "@shared/schema";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password: string, stored: string): boolean => {
  const [salt, hash] = stored.split(":");
  const hashBuffer = Buffer.from(hash, "hex");
  const suppliedBuffer = scryptSync(password, salt, 64);
  return timingSafeEqual(hashBuffer, suppliedBuffer);
};

interface GameState {
  players: Map<string, {
    id: string;
    username: string;
    avatarId: number;
    x: number;
    y: number;
    z: number;
    rotation: number;
    health: number;
    kills: number;
    deaths: number;
  }>;
  matchId: string;
  status: "waiting" | "countdown" | "playing" | "ended";
  timeRemaining: number;
}

const activeGames = new Map<string, GameState>();
const playerConnections = new Map<string, WebSocket>();
const playerMatches = new Map<string, string>();

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const parsed = insertPlayerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input" });
      }

      const existing = await storage.getPlayerByUsername(parsed.data.username);
      if (existing) {
        return res.status(400).json({ error: "Username already taken" });
      }

      const player = await storage.createPlayer({
        username: parsed.data.username,
        password: hashPassword(parsed.data.password),
      });

      const { password, ...safePlayer } = player;
      res.json({ player: safePlayer });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input" });
      }

      const player = await storage.getPlayerByUsername(parsed.data.username);
      if (!player || !verifyPassword(parsed.data.password, player.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const { password, ...safePlayer } = player;
      res.json({ player: safePlayer });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/players/:id", async (req: Request, res: Response) => {
    try {
      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      const { password, ...safePlayer } = player;
      res.json({ player: safePlayer });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.put("/api/players/:id", async (req: Request, res: Response) => {
    try {
      const { avatarId } = req.body;
      const player = await storage.updatePlayer(req.params.id, { avatarId });
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      const { password, ...safePlayer } = player;
      res.json({ player: safePlayer });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/leaderboard", async (_req: Request, res: Response) => {
    try {
      const players = await storage.getLeaderboard(20);
      const safePlayers = players.map(({ password, ...p }) => p);
      res.json({ players: safePlayers });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    let playerId: string | null = null;
    let currentMatchId: string | null = null;

    ws.on("message", async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "join_matchmaking": {
            playerId = message.playerId;
            if (!playerId) return;

            playerConnections.set(playerId, ws);
            
            let match = await storage.getWaitingMatch();
            if (!match) {
              match = await storage.createMatch();
              activeGames.set(match.id, {
                players: new Map(),
                matchId: match.id,
                status: "waiting",
                timeRemaining: 120,
              });
            }

            currentMatchId = match.id;
            playerMatches.set(playerId, match.id);

            const existingMp = await storage.getMatchPlayer(match.id, playerId);
            if (!existingMp) {
              await storage.addPlayerToMatch(match.id, playerId);
            }

            const player = await storage.getPlayer(playerId);
            if (!player) return;

            const gameState = activeGames.get(match.id);
            if (gameState) {
              const spawnPositions = [
                { x: -5, y: 1, z: -5 },
                { x: 5, y: 1, z: -5 },
                { x: -5, y: 1, z: 5 },
                { x: 5, y: 1, z: 5 },
              ];
              const spawnIdx = gameState.players.size % spawnPositions.length;
              const spawn = spawnPositions[spawnIdx];

              gameState.players.set(playerId, {
                id: playerId,
                username: player.username,
                avatarId: player.avatarId,
                x: spawn.x,
                y: spawn.y,
                z: spawn.z,
                rotation: 0,
                health: 100,
                kills: 0,
                deaths: 0,
              });

              broadcastToMatch(match.id, {
                type: "player_joined",
                player: gameState.players.get(playerId),
                playerCount: gameState.players.size,
              });

              ws.send(JSON.stringify({
                type: "match_joined",
                matchId: match.id,
                players: Array.from(gameState.players.values()),
                status: gameState.status,
              }));

              if (gameState.players.size >= 2 && gameState.status === "waiting") {
                gameState.status = "countdown";
                broadcastToMatch(match.id, { type: "countdown_start", seconds: 3 });
                
                setTimeout(() => {
                  if (gameState && gameState.status === "countdown") {
                    gameState.status = "playing";
                    gameState.timeRemaining = 120;
                    storage.updateMatch(match.id, { status: "playing", startedAt: new Date() });
                    broadcastToMatch(match.id, { type: "match_start" });
                    startMatchTimer(match.id);
                  }
                }, 3000);
              }
            }
            break;
          }

          case "player_move": {
            if (!playerId || !currentMatchId) return;
            const gameState = activeGames.get(currentMatchId);
            if (!gameState || gameState.status !== "playing") return;

            const playerState = gameState.players.get(playerId);
            if (playerState) {
              playerState.x = message.x;
              playerState.y = message.y;
              playerState.z = message.z;
              playerState.rotation = message.rotation;

              broadcastToMatch(currentMatchId, {
                type: "player_moved",
                playerId,
                x: message.x,
                y: message.y,
                z: message.z,
                rotation: message.rotation,
              }, playerId);
            }
            break;
          }

          case "player_shoot": {
            if (!playerId || !currentMatchId) return;
            const gameState = activeGames.get(currentMatchId);
            if (!gameState || gameState.status !== "playing") return;

            const targetId = message.targetId;
            const targetState = gameState.players.get(targetId);
            const shooterState = gameState.players.get(playerId);

            if (targetState && shooterState) {
              const damage = 25 + Math.floor(Math.random() * 15);
              targetState.health -= damage;

              broadcastToMatch(currentMatchId, {
                type: "player_hit",
                targetId,
                shooterId: playerId,
                damage,
                health: targetState.health,
              });

              if (targetState.health <= 0) {
                shooterState.kills += 1;
                targetState.deaths += 1;
                targetState.health = 100;

                const spawnPositions = [
                  { x: -5, y: 1, z: -5 },
                  { x: 5, y: 1, z: -5 },
                  { x: -5, y: 1, z: 5 },
                  { x: 5, y: 1, z: 5 },
                ];
                const spawnIdx = Math.floor(Math.random() * spawnPositions.length);
                const spawn = spawnPositions[spawnIdx];
                targetState.x = spawn.x;
                targetState.y = spawn.y;
                targetState.z = spawn.z;

                broadcastToMatch(currentMatchId, {
                  type: "player_killed",
                  targetId,
                  killerId: playerId,
                  killerKills: shooterState.kills,
                  respawnPosition: spawn,
                });
              }
            }
            break;
          }

          case "leave_match": {
            if (playerId && currentMatchId) {
              handlePlayerDisconnect(playerId, currentMatchId);
            }
            break;
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      if (playerId) {
        playerConnections.delete(playerId);
        if (currentMatchId) {
          handlePlayerDisconnect(playerId, currentMatchId);
        }
      }
    });
  });

  function broadcastToMatch(matchId: string, message: object, excludePlayerId?: string) {
    const gameState = activeGames.get(matchId);
    if (!gameState) return;

    const messageStr = JSON.stringify(message);
    gameState.players.forEach((_, pid) => {
      if (pid !== excludePlayerId) {
        const conn = playerConnections.get(pid);
        if (conn && conn.readyState === WebSocket.OPEN) {
          conn.send(messageStr);
        }
      }
    });
  }

  async function handlePlayerDisconnect(playerId: string, matchId: string) {
    const gameState = activeGames.get(matchId);
    if (!gameState) return;

    const playerState = gameState.players.get(playerId);
    if (playerState) {
      await storage.updatePlayer(playerId, {
        totalKills: (await storage.getPlayer(playerId))?.totalKills || 0 + playerState.kills,
        totalDeaths: (await storage.getPlayer(playerId))?.totalDeaths || 0 + playerState.deaths,
      });
    }

    gameState.players.delete(playerId);
    playerMatches.delete(playerId);

    broadcastToMatch(matchId, {
      type: "player_left",
      playerId,
      playerCount: gameState.players.size,
    });

    if (gameState.players.size < 2 && gameState.status === "playing") {
      endMatch(matchId);
    }
  }

  async function endMatch(matchId: string) {
    const gameState = activeGames.get(matchId);
    if (!gameState) return;

    gameState.status = "ended";

    let winnerId: string | null = null;
    let maxKills = -1;

    gameState.players.forEach((state, pid) => {
      if (state.kills > maxKills) {
        maxKills = state.kills;
        winnerId = pid;
      }
    });

    await storage.updateMatch(matchId, {
      status: "ended",
      winnerId: winnerId || undefined,
      endedAt: new Date(),
    });

    for (const [pid, state] of gameState.players) {
      const player = await storage.getPlayer(pid);
      if (player) {
        const isWinner = pid === winnerId;
        await storage.updatePlayer(pid, {
          totalKills: player.totalKills + state.kills,
          totalDeaths: player.totalDeaths + state.deaths,
          matchesPlayed: player.matchesPlayed + 1,
          matchesWon: player.matchesWon + (isWinner ? 1 : 0),
          xp: player.xp + (state.kills * 100) + (isWinner ? 500 : 100),
        });
      }
    }

    broadcastToMatch(matchId, {
      type: "match_ended",
      winnerId,
      results: Array.from(gameState.players.values()).map(p => ({
        playerId: p.id,
        username: p.username,
        kills: p.kills,
        deaths: p.deaths,
        score: p.kills * 100,
      })),
    });

    setTimeout(() => {
      activeGames.delete(matchId);
    }, 10000);
  }

  function startMatchTimer(matchId: string) {
    const interval = setInterval(() => {
      const gameState = activeGames.get(matchId);
      if (!gameState || gameState.status !== "playing") {
        clearInterval(interval);
        return;
      }

      gameState.timeRemaining -= 1;
      broadcastToMatch(matchId, {
        type: "time_update",
        timeRemaining: gameState.timeRemaining,
      });

      if (gameState.timeRemaining <= 0) {
        clearInterval(interval);
        endMatch(matchId);
      }
    }, 1000);
  }

  return httpServer;
}
