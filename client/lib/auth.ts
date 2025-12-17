import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { apiRequest, getApiUrl } from "./query-client";

export interface Player {
  id: string;
  username: string;
  avatarId: number;
  level: number;
  xp: number;
  totalKills: number;
  totalDeaths: number;
  matchesPlayed: number;
  matchesWon: number;
  createdAt: string;
}

interface AuthState {
  player: Player | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePlayer: (data: Partial<Player>) => void;
  loadStoredAuth: () => Promise<void>;
}

const PLAYER_KEY = "@sniper_player";

export const useAuth = create<AuthState>((set, get) => ({
  player: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/login", { username, password });
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    await AsyncStorage.setItem(PLAYER_KEY, JSON.stringify(data.player));
    set({ player: data.player, isAuthenticated: true });
  },

  register: async (username: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/register", { username, password });
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    await AsyncStorage.setItem(PLAYER_KEY, JSON.stringify(data.player));
    set({ player: data.player, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem(PLAYER_KEY);
    set({ player: null, isAuthenticated: false });
  },

  updatePlayer: (data: Partial<Player>) => {
    const current = get().player;
    if (current) {
      const updated = { ...current, ...data };
      set({ player: updated });
      AsyncStorage.setItem(PLAYER_KEY, JSON.stringify(updated));
    }
  },

  loadStoredAuth: async () => {
    try {
      const stored = await AsyncStorage.getItem(PLAYER_KEY);
      if (stored) {
        const player = JSON.parse(stored);
        set({ player, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
