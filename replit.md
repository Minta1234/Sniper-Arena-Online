# Sniper Elite PvP - 3D Mobile Sniper Game

## Overview
A real-time PvP multiplayer 3D sniper game for mobile devices built with Expo React Native. Players compete in tactical urban rooftop combat with elimination-based gameplay.

## Current State
- **Version**: 1.0.0
- **Status**: MVP Complete
- **Last Updated**: December 2025

## Tech Stack
- **Frontend**: Expo SDK 54, React Native, React Navigation 7
- **Backend**: Express.js with WebSocket (ws) for real-time multiplayer
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query

## Project Structure
```
├── client/                    # Expo React Native app
│   ├── assets/               # Game assets (avatars, backgrounds)
│   ├── components/           # Reusable UI components
│   ├── constants/            # Theme and game colors
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Auth and game socket stores
│   ├── navigation/           # React Navigation setup
│   └── screens/              # App screens
├── server/                    # Express backend
│   ├── db.ts                 # Database connection
│   ├── routes.ts             # API routes + WebSocket
│   └── storage.ts            # Database operations
├── shared/                    # Shared types and schemas
│   └── schema.ts             # Drizzle database schema
└── assets/                    # Static assets
```

## Features
1. **Authentication**: Username/password login with secure password hashing
2. **Real-time PvP**: WebSocket-based multiplayer matchmaking (2-4 players)
3. **Gameplay**: Touch-based controls with scope zoom and target selection
4. **Leaderboards**: Global ranking by total kills
5. **Profile**: Avatar customization with 4 tactical avatars
6. **Stats Tracking**: K/D ratio, matches played, wins, XP progression

## Key Screens
- **Login**: Username/password authentication
- **Main Menu**: Find match, leaderboards, profile, settings
- **Matchmaking**: Real-time lobby with countdown
- **Gameplay**: Full-screen combat with HUD overlays
- **Match Results**: Final standings and XP earned
- **Profile**: Avatar selection and career stats
- **Leaderboard**: Global player rankings
- **Settings**: Audio, controls, account management

## Database Schema
- `players`: User accounts with stats (kills, deaths, wins, XP, level)
- `matches`: Game sessions with winner tracking
- `match_players`: Player participation and per-match stats

## Running the App
The app runs via the "Start dev servers" workflow which starts:
- Expo development server on port 8081
- Express API server on port 5000

## Game Design
- **Theme**: Military tactical with orange/dark accents
- **Style**: iOS 26 liquid glass inspired with frosted effects
- **Colors**: Primary (#FF6B35), Surface (#2C2C34), Background (#1A1A1D)
