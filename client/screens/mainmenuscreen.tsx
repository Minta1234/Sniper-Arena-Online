import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ImageBackground,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { GameColors, Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { Feather } from "@expo/vector-icons";

const AVATARS = [
  require("@assets/avatars/tactical_operative_avatar.png"),
  require("@assets/avatars/urban_sniper_avatar.png"),
  require("@assets/avatars/ghost_recon_avatar.png"),
  require("@assets/avatars/elite_marksman_avatar.png"),
];

export default function MainMenuScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { player } = useAuth();

  const avatarSource = AVATARS[player?.avatarId || 0];

  return (
    <ImageBackground
      source={require("@assets/game/urban_rooftop_background.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      
      <View style={[styles.content, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}
            onPress={() => navigation.navigate("Settings")}
          >
            <Feather name="settings" size={24} color={GameColors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.playerCard}>
          <Image source={avatarSource} style={styles.avatar} />
          <View style={styles.playerInfo}>
            <Text style={styles.username}>{player?.username || "Player"}</Text>
            <Text style={styles.level}>Level {player?.level || 1}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather name="crosshair" size={16} color={GameColors.primary} />
              <Text style={styles.statValue}>{player?.totalKills || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="award" size={16} color={GameColors.accent} />
              <Text style={styles.statValue}>{player?.matchesWon || 0}</Text>
            </View>
          </View>
        </View>

        <View style={styles.logoSection}>
          <Feather name="crosshair" size={48} color={GameColors.primary} />
          <Text style={styles.title}>SNIPER ELITE</Text>
          <Text style={styles.subtitle}>PVP COMBAT</Text>
        </View>

        <View style={styles.menuButtons}>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={() => navigation.navigate("Matchmaking")}
          >
            <Feather name="target" size={24} color="#fff" />
            <Text style={styles.primaryButtonText}>FIND MATCH</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => navigation.navigate("Leaderboard")}
          >
            <Feather name="bar-chart-2" size={20} color={GameColors.primary} />
            <Text style={styles.secondaryButtonText}>LEADERBOARDS</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => navigation.navigate("Profile")}
          >
            <Feather name="user" size={20} color={GameColors.primary} />
            <Text style={styles.secondaryButtonText}>PROFILE</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Server Online</Text>
          </View>
          <Text style={styles.version}>v1.0.0</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26, 26, 29, 0.85)",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing["2xl"],
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: GameColors.hudBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  playerCard: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginTop: Spacing.lg,
    ...Shadows.card,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    position: "absolute",
    left: Spacing.lg,
    top: Spacing.lg,
  },
  playerInfo: {
    marginLeft: 76,
  },
  username: {
    ...Typography.h4,
    color: GameColors.textPrimary,
  },
  level: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: Spacing.md,
    marginLeft: 76,
    gap: Spacing.xl,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statValue: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  logoSection: {
    alignItems: "center",
    marginVertical: Spacing["4xl"],
  },
  title: {
    ...Typography.h1,
    color: GameColors.textPrimary,
    marginTop: Spacing.lg,
    letterSpacing: 4,
  },
  subtitle: {
    ...Typography.caption,
    color: GameColors.primary,
    letterSpacing: 8,
  },
  menuButtons: {
    gap: Spacing.lg,
  },
  primaryButton: {
    backgroundColor: GameColors.primary,
    height: 64,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
    ...Shadows.button,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    ...Typography.h4,
    color: "#fff",
    letterSpacing: 2,
  },
  secondaryButton: {
    backgroundColor: GameColors.surface,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 2,
    borderColor: GameColors.primary,
  },
  secondaryButtonText: {
    ...Typography.body,
    color: GameColors.primary,
    fontWeight: "600",
    letterSpacing: 1,
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GameColors.success,
  },
  statusText: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  version: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
});
