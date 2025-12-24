import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { GameColors, Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/query-client";
import { Feather } from "@expo/vector-icons";

const AVATARS = [
  { id: 0, source: require("@assets/avatars/tactical_operative_avatar.png"), name: "Tactical Operative" },
  { id: 1, source: require("@assets/avatars/urban_sniper_avatar.png"), name: "Urban Sniper" },
  { id: 2, source: require("@assets/avatars/ghost_recon_avatar.png"), name: "Ghost Recon" },
  { id: 3, source: require("@assets/avatars/elite_marksman_avatar.png"), name: "Elite Marksman" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { player, updatePlayer } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(player?.avatarId || 0);
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarSelect = async (avatarId: number) => {
    setSelectedAvatar(avatarId);
    if (player && avatarId !== player.avatarId) {
      setIsSaving(true);
      try {
        await apiRequest("PUT", `/api/players/${player.id}`, { avatarId });
        updatePlayer({ avatarId });
      } catch (error) {
        console.error("Failed to update avatar:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const kdRatio = player?.totalDeaths 
    ? (player.totalKills / player.totalDeaths).toFixed(2) 
    : player?.totalKills?.toString() || "0.00";

  const winRate = player?.matchesPlayed 
    ? Math.round((player.matchesWon / player.matchesPlayed) * 100)
    : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>PROFILE</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing["2xl"] }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <Image source={AVATARS[selectedAvatar].source} style={styles.currentAvatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{player?.username || "Player"}</Text>
            <Text style={styles.level}>Level {player?.level || 1}</Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${(player?.xp || 0) % 1000 / 10}%` }]} />
            </View>
            <Text style={styles.xpText}>{(player?.xp || 0) % 1000} / 1000 XP</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>SELECT AVATAR</Text>
        <View style={styles.avatarGrid}>
          {AVATARS.map((avatar) => (
            <Pressable
              key={avatar.id}
              style={[
                styles.avatarOption,
                selectedAvatar === avatar.id && styles.avatarOptionSelected
              ]}
              onPress={() => handleAvatarSelect(avatar.id)}
            >
              <Image source={avatar.source} style={styles.avatarImage} />
              <Text style={styles.avatarName}>{avatar.name}</Text>
              {selectedAvatar === avatar.id ? (
                <View style={styles.selectedCheck}>
                  <Feather name="check" size={16} color="#fff" />
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>CAREER STATS</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Feather name="crosshair" size={24} color={GameColors.primary} />
            <Text style={styles.statValue}>{player?.totalKills || 0}</Text>
            <Text style={styles.statLabel}>Total Kills</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="x-circle" size={24} color={GameColors.danger} />
            <Text style={styles.statValue}>{player?.totalDeaths || 0}</Text>
            <Text style={styles.statLabel}>Total Deaths</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="target" size={24} color={GameColors.accent} />
            <Text style={styles.statValue}>{kdRatio}</Text>
            <Text style={styles.statLabel}>K/D Ratio</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="play" size={24} color={GameColors.textSecondary} />
            <Text style={styles.statValue}>{player?.matchesPlayed || 0}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="award" size={24} color={GameColors.accent} />
            <Text style={styles.statValue}>{player?.matchesWon || 0}</Text>
            <Text style={styles.statLabel}>Victories</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="percent" size={24} color={GameColors.success} />
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing["2xl"],
    marginBottom: Spacing.lg,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: GameColors.hudBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    ...Typography.h3,
    color: GameColors.textPrimary,
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing["2xl"],
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing["2xl"],
    ...Shadows.card,
  },
  currentAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: GameColors.primary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  username: {
    ...Typography.h3,
    color: GameColors.textPrimary,
  },
  level: {
    ...Typography.caption,
    color: GameColors.primary,
    marginBottom: Spacing.sm,
  },
  xpBar: {
    height: 6,
    backgroundColor: GameColors.surfaceLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    backgroundColor: GameColors.accent,
  },
  xpText: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  avatarOption: {
    width: "47%",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarOptionSelected: {
    borderColor: GameColors.primary,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: Spacing.sm,
  },
  avatarName: {
    ...Typography.caption,
    color: GameColors.textPrimary,
    textAlign: "center",
  },
  selectedCheck: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GameColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    width: "31%",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    alignItems: "center",
    ...Shadows.card,
  },
  statValue: {
    ...Typography.h3,
    color: GameColors.textPrimary,
    marginTop: Spacing.sm,
  },
  statLabel: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
});
