import { create } from "zustand";
import { getApiUrl } from "./query-client";

export interface GamePlayer {
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
}

export interface MatchResult {
  playerId: string;
  username: string;
  kills: number;
  deaths: number;
  score: number;
}

interface GameState {
  socket: WebSocket | null;
  matchId: string | null;
  players: GamePlayer[];
  status: "idle" | "matchmaking" | "countdown" | "playing" | "ended";
  timeRemaining: number;
  countdownSeconds: number;
  results: MatchResult[];
  winnerId: string | null;
  localPlayerId: string | null;
  
  connect: (playerId: string) => void;
  disconnect: () => void;
  sendMove: (x: number, y: number, z: number, rotation: number) => void;
  sendShoot: (targetId: string) => void;
  leaveMatch: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  socket: null,
  matchId: null,
  players: [],
  status: "idle",
  timeRemaining: 120,
  countdownSeconds: 0,
  results: [],
  winnerId: null,
  localPlayerId: null,

  connect: (playerId: string) => {
    const baseUrl = getApiUrl();
    const wsUrl = baseUrl.replace("http", "ws") + "/ws";
    
    const socket = new WebSocket(wsUrl);
    set({ socket, localPlayerId: playerId, status: "matchmaking" });

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: "join_matchmaking",
        playerId,
      }));
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case "match_joined":
            set({
              matchId: message.matchId,
              players: message.players,
              status: message.status === "waiting" ? "matchmaking" : message.status,
            });
            break;

          case "player_joined":
            set((state) => ({
              players: [...state.players.filter(p => p.id !== message.player.id), message.player],
            }));
            break;

          case "player_left":
            set((state) => ({
              players: state.players.filter(p => p.id !== message.playerId),
            }));
            break;

          case "countdown_start":
            set({ status: "countdown", countdownSeconds: message.seconds });
            const countdownInterval = setInterval(() => {
              set((state) => {
                if (state.countdownSeconds <= 1) {
                  clearInterval(countdownInterval);
                  return { countdownSeconds: 0 };
                }
                return { countdownSeconds: state.countdownSeconds - 1 };
              });
            }, 1000);
            break;

          case "match_start":
            set({ status: "playing", timeRemaining: 120 });
            break;

          case "player_moved":
            set((state) => ({
              players: state.players.map(p =>
                p.id === message.playerId
                  ? { ...p, x: message.x, y: message.y, z: message.z, rotation: message.rotation }
                  : p
              ),
            }));
            break;

          case "player_hit":
            set((state) => ({
              players: state.players.map(p =>
                p.id === message.targetId
                  ? { ...p, health: message.health }
                  : p
              ),
            }));
            break;

          case "player_killed":
            set((state) => ({
              players: state.players.map(p => {
                if (p.id === message.targetId) {
                  return {
                    ...p,
                    health: 100,
                    deaths: p.deaths + 1,
                    x: message.respawnPosition.x,
                    y: message.respawnPosition.y,
                    z: message.respawnPosition.z,
                  };
                }
                if (p.id === message.killerId) {
                  return { ...p, kills: message.killerKills };
                }
                return p;
              }),
            }));
            break;

          case "time_update":
            set({ timeRemaining: message.timeRemaining });
            break;

          case "match_ended":
            set({
              status: "ended",
              results: message.results,
              winnerId: message.winnerId,
            });
            break;
        }
      } catch (error) {
        console.error("WebSocket message parse error:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      set({ socket: null });
    };
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
    }
    set({ socket: null, status: "idle", matchId: null, players: [] });
  },

  sendMove: (x: number, y: number, z: number, rotation: number) => {
    const { socket, status } = get();
    if (socket && socket.readyState === WebSocket.OPEN && status === "playing") {
      socket.send(JSON.stringify({
        type: "player_move",
        x,
        y,
        z,
        rotation,
      }));
    }
  },

  sendShoot: (targetId: string) => {
    const { socket, status } = get();
    if (socket && socket.readyState === WebSocket.OPEN && status === "playing") {
      socket.send(JSON.stringify({
        type: "player_shoot",
        targetId,
      }));
    }
  },

  leaveMatch: () => {
    const { socket } = get();
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "leave_match" }));
    }
    get().disconnect();
  },

  reset: () => {
    set({
      matchId: null,
      players: [],
      status: "idle",
      timeRemaining: 120,
      countdownSeconds: 0,
      results: [],
      winnerId: null,
    });
  },
}));
