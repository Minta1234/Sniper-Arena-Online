import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { GameColors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { useGameStore } from "@/lib/gameSocket";
import { Feather } from "@expo/vector-icons";

const AVATARS = [
  require("@assets/avatars/tactical_operative_avatar.png"),
  require("@assets/avatars/urban_sniper_avatar.png"),
  require("@assets/avatars/ghost_recon_avatar.png"),
  require("@assets/avatars/elite_marksman_avatar.png"),
];

const MAX_PLAYERS = 4;

export default function MatchmakingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { player } = useAuth();
  const { connect, disconnect, leaveMatch, status, players, countdownSeconds } = useGameStore();

  useFocusEffect(
    useCallback(() => {
      if (player?.id) {
        connect(player.id);
      }
      return () => {
        if (status !== "playing") {
          leaveMatch();
        }
      };
    }, [player?.id])
  );

  useEffect(() => {
    if (status === "playing") {
      navigation.replace("Gameplay");
    }
  }, [status]);

  const handleCancel = () => {
    leaveMatch();
    navigation.goBack();
  };

  const emptySlots = Math.max(0, MAX_PLAYERS - players.length);

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing["5xl"] }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleCancel}>
          <Feather name="arrow-left" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>MATCHMAKING</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.statusSection}>
          {status === "countdown" ? (
            <>
              <View style={styles.countdownCircle}>
                <Text style={styles.countdownNumber}>{countdownSeconds}</Text>
              </View>
              <Text style={styles.statusText}>MATCH STARTING</Text>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={GameColors.primary} />
              <Text style={styles.statusText}>Finding players...</Text>
              <Text style={styles.statusSubtext}>{players.length}/{MAX_PLAYERS} players</Text>
            </>
          )}
        </View>

        <View style={styles.playersSection}>
          <Text style={styles.sectionTitle}>PLAYERS</Text>
          <View style={styles.playersList}>
            {players.map((p) => (
              <View key={p.id} style={styles.playerCard}>
                <Image source={AVATARS[p.avatarId || 0]} style={styles.avatar} />
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{p.username}</Text>
                  <View style={styles.readyBadge}>
                    <Feather name="check-circle" size={14} color={GameColors.success} />
                    <Text style={styles.readyText}>Ready</Text>
                  </View>
                </View>
              </View>
            ))}
            {Array.from({ length: emptySlots }).map((_, idx) => (
              <View key={`empty-${idx}`} style={[styles.playerCard, styles.emptyCard]}>
                <View style={styles.emptyAvatar}>
                  <ActivityIndicator size="small" color={GameColors.textSecondary} />
                </View>
                <View style={styles.playerInfo}>
                  <Text style={styles.emptyText}>Waiting for player...</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
        onPress={handleCancel}
      >
        <Feather name="x" size={20} color={GameColors.danger} />
        <Text style={styles.cancelButtonText}>CANCEL</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
    paddingHorizontal: Spacing["2xl"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing["2xl"],
  },
  backButton: {
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
  content: {
    flex: 1,
  },
  statusSection: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  countdownCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: GameColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: "700",
    color: "#fff",
  },
  statusText: {
    ...Typography.h4,
    color: GameColors.textPrimary,
    marginTop: Spacing.lg,
  },
  statusSubtext: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginTop: Spacing.xs,
  },
  playersSection: {
    flex: 1,
  },
  sectionTitle: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  playersList: {
    gap: Spacing.md,
  },
  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  emptyCard: {
    opacity: 0.5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  emptyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: GameColors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  playerInfo: {
    marginLeft: Spacing.lg,
    flex: 1,
  },
  playerName: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  emptyText: {
    ...Typography.body,
    color: GameColors.textSecondary,
  },
  readyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  readyText: {
    ...Typography.caption,
    color: GameColors.success,
  },
  cancelButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: GameColors.danger,
    backgroundColor: "transparent",
  },
  buttonPressed: {
    opacity: 0.7,
  },
  cancelButtonText: {
    ...Typography.body,
    color: GameColors.danger,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
