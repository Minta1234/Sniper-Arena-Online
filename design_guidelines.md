# Design Guidelines: 3D Sniper PvP Mobile Game

## Architecture Decisions

### Authentication
**Auth Required** - Real-time multiplayer necessitates user accounts for:
- Matchmaking and player identification
- Leaderboard rankings and match history
- Profile progression and statistics

**Implementation:**
- Primary: **Google Play Games Sign-In** (native Android gaming integration)
- Secondary: **Email/Password** as fallback
- Mock matchmaking in prototype using local state
- Include:
  - Login/Signup screens with gaming-focused branding
  - Player profile with customizable avatar selection (4 preset military-themed avatars: tactical operative, urban sniper, ghost recon, elite marksman)
  - Settings for controls, audio, graphics quality
  - Account management with logout and account deletion (nested under Settings > Account)

### Navigation Architecture
**Primary: Stack-Based Game Flow**
- Linear progression: Main Menu → Matchmaking → Game → Results → Main Menu
- Drawer menu accessible from Main Menu only (not during gameplay)

**Navigation Structure:**
1. **Main Menu Stack**
   - Main Menu (root)
   - Settings (modal)
   - Profile/Stats (modal)
   - Leaderboards (modal)
2. **Game Flow Stack**
   - Matchmaking Lobby
   - Gameplay (full-screen, no standard navigation)
   - Match Results
3. **Pause Menu** (in-game overlay modal)

### Screen Specifications

#### Main Menu
- **Layout:**
  - Header: None (full-screen branded experience)
  - Background: Dramatic urban rooftop 3D environment (subtle parallax or slow rotation)
  - Centered vertical button stack
  - Top: Player profile card (avatar, username, level)
  - Bottom: Settings gear icon
- **Components:**
  - Large primary button: "FIND MATCH" (CTA)
  - Secondary buttons: "LEADERBOARDS", "PROFILE", "SETTINGS"
  - Version number and server status indicator in bottom corner
- **Safe Area:** Full-screen with insets.top + 24px and insets.bottom + 24px padding

#### Matchmaking Lobby
- **Layout:**
  - Header: Custom transparent header with "MATCHMAKING" title and back button (left)
  - Main: Scrollable list of player slots (2-4 players)
  - Bottom: Status text "Finding players..." with animated dots
  - Floating cancel button at bottom
- **Components:**
  - Player cards showing: Avatar, Username, Level, Ready status
  - Loading spinner for empty slots
  - Countdown timer when all players ready (3 seconds before match start)
- **Safe Area:** Top: headerHeight + 16px, Bottom: insets.bottom + 80px (for cancel button)

#### Gameplay Screen
- **Layout:**
  - Header: None (full-screen 3D viewport)
  - HUD overlays positioned around screen edges
  - No standard navigation (pause via hamburger icon)
- **Components:**
  - **Top-left HUD:** Health bar (horizontal), ammo counter, kill count
  - **Top-right HUD:** Match timer, current score/rank
  - **Center:** Sniper scope overlay (when zoomed) with crosshair
  - **Bottom-right:** Fire button (large circular, 80px diameter)
  - **Bottom-left:** Scope toggle (zoom in/out, 60px diameter)
  - **Top-left corner:** Pause/menu hamburger icon (40px)
- **Safe Area:** 
  - HUD elements: 16px from screen edges + safe area insets
  - Fire button: insets.bottom + insets.right + 24px
  - Scope button: insets.bottom + insets.left + 24px

#### Pause Menu (In-Game Overlay)
- **Layout:**
  - Semi-transparent dark overlay (rgba(0,0,0,0.85))
  - Centered modal card (80% screen width, auto height)
  - Blurred gameplay background
- **Components:**
  - Title: "PAUSED"
  - Vertical button stack: "Resume", "Settings", "Leave Match" (destructive)
  - Settings nested modal if selected
- **Interaction:** Tap outside modal to resume

#### Match Results Screen
- **Layout:**
  - Header: Custom with "MATCH RESULTS" title, no back button
  - Main: Scrollable leaderboard of match participants
  - Bottom: Fixed footer with "RETURN TO MENU" button
- **Components:**
  - Winner announcement banner at top (gold accent)
  - Player ranking list: Position, Avatar, Username, Kills, Deaths, Score
  - Personal stats highlighted in accent color
  - XP/level progress bar
- **Safe Area:** Top: headerHeight + 16px, Bottom: insets.bottom + 80px (for fixed button)

## Design System

### Color Palette
**Theme: Military Tactical**
- **Primary:** #FF6B35 (Tactical Orange - CTAs, fire button)
- **Secondary:** #2C3E50 (Dark Slate - backgrounds, cards)
- **Accent:** #F7B731 (Gold - winner highlights, achievements)
- **Success:** #26A69A (Teal - health, positive feedback)
- **Danger:** #E74C3C (Red - low health, destructive actions)
- **Background:** #1A1A1D (Near Black)
- **Surface:** #2C2C34 (Dark Gray - cards, HUD backgrounds)
- **Text Primary:** #FFFFFF
- **Text Secondary:** #B0B0B8 (Light Gray)

### Typography
**Font Family:** Roboto (Material Design standard)
- **Display (Main Menu Title):** 36px, Bold, Uppercase
- **Heading (Screen Titles):** 24px, Bold
- **Body (Buttons, Stats):** 16px, Medium
- **Caption (HUD info):** 14px, Regular
- **Monospace (Scores, Timer):** Roboto Mono, 18px, Medium

### Visual Design

#### UI Elements
- **Buttons (Primary):**
  - Background: Primary color gradient
  - Height: 56px
  - Border radius: 8px
  - Uppercase text
  - Pressed state: 10% darker, subtle scale (0.98)
  - Shadow: width: 0, height: 4, opacity: 0.3, radius: 8
  
- **Buttons (Secondary):**
  - Background: Surface color
  - Border: 2px solid Primary color
  - Same dimensions and states as primary

- **HUD Elements:**
  - Background: Semi-transparent dark (rgba(44, 44, 52, 0.7))
  - Border radius: 4px
  - 2px border with 20% opacity white
  - No shadows (performance optimization)

- **Player Cards:**
  - Background: Surface color
  - Border radius: 12px
  - Padding: 16px
  - Subtle border: 1px solid rgba(255,255,255,0.1)
  - Shadow: width: 0, height: 2, opacity: 0.2, radius: 4

#### Icons
- **System Icons:** Material Icons from @expo/vector-icons
- **HUD Icons:** Feather icons (crosshair, target, scope)
- Size: 24px standard, 32px for primary actions
- Color: White with 90% opacity, primary color when active

#### Game-Specific Visual Feedback
- **Scope Zoom:** Animated vignette overlay, crosshair fade-in (300ms)
- **Hit Marker:** Brief red flash + haptic feedback
- **Kill Notification:** Slide-in banner from top (2s duration)
- **Low Health:** Pulsing red vignette at screen edges
- **Damage Taken:** Brief screen shake + red overlay flash

### Critical Assets

**Generated Assets (8 total):**
1. **Player Avatars (4):**
   - Tactical Operative (green night vision theme)
   - Urban Sniper (gray urban camo theme)
   - Ghost Recon (black stealth theme)
   - Elite Marksman (tan desert theme)
   - Style: Minimalist, geometric, military-inspired icons (512x512px)

2. **Sniper Scope Overlay:**
   - Circular scope reticle with crosshair
   - Range markers and mil-dots
   - Semi-transparent dark vignette
   - Style: Realistic military scope (1024x1024px, PNG with transparency)

3. **Urban Rooftop Background:**
   - Cityscape with rooftops and skyline
   - Dusk/evening lighting
   - Subtle depth of field
   - Style: Low-poly 3D aesthetic for performance (2048x1536px)

4. **App Icon:**
   - Sniper scope crosshair on orange gradient
   - Style: Bold, recognizable at small sizes (1024x1024px)

### Accessibility
- **Touch Targets:** Minimum 48x48px for all interactive elements
- **Contrast:** WCAG AA compliant (4.5:1 for text, 3:1 for UI components)
- **Haptic Feedback:** Subtle vibration on shots, hits, and button presses
- **Audio Cues:** Gunshot, hit confirmation, match events (mutable in settings)
- **Colorblind Mode:** Settings option to change hit markers and UI accents to high-contrast yellows and blues

### Performance Considerations
- **HUD:** 60 FPS minimum, avoid expensive effects during gameplay
- **Animations:** Use hardware-accelerated transforms only
- **3D Rendering:** Optimize for mid-range Android devices (reduce poly count, texture resolution settings)