import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { GameColors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { Feather } from "@expo/vector-icons";

interface LeaderboardPlayer {
  id: string;
  username: string;
  totalKills: number;
  totalDeaths: number;
  matchesWon: number;
  matchesPlayed: number;
  level: number;
}

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { player } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<{ players: LeaderboardPlayer[] }>({
    queryKey: ["/api/leaderboard"],
  });

  const players = data?.players || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>LEADERBOARDS</Text>
        <Pressable style={styles.refreshButton} onPress={() => refetch()}>
          <Feather name="refresh-cw" size={20} color={GameColors.textPrimary} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GameColors.primary} />
          <Text style={styles.loadingText}>Loading rankings...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={GameColors.danger} />
          <Text style={styles.errorText}>Failed to load leaderboard</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing["2xl"] }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.rankColumn]}>RANK</Text>
            <Text style={[styles.headerText, styles.playerColumn]}>PLAYER</Text>
            <Text style={[styles.headerText, styles.statColumn]}>K</Text>
            <Text style={[styles.headerText, styles.statColumn]}>W</Text>
            <Text style={[styles.headerText, styles.statColumn]}>LVL</Text>
          </View>

          {players.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="users" size={48} color={GameColors.textSecondary} />
              <Text style={styles.emptyText}>No players yet</Text>
              <Text style={styles.emptySubtext}>Be the first to join!</Text>
            </View>
          ) : (
            players.map((p, index) => {
              const isCurrentPlayer = p.id === player?.id;
              const rank = index + 1;
              
              return (
                <View 
                  key={p.id}
                  style={[
                    styles.playerRow,
                    isCurrentPlayer && styles.playerRowHighlight,
                    rank <= 3 && styles.topThreeRow,
                  ]}
                >
                  <View style={[styles.rankColumn, styles.rankContainer]}>
                    {rank === 1 ? (
                      <View style={[styles.rankBadge, styles.rankGold]}>
                        <Feather name="award" size={16} color="#FFD700" />
                      </View>
                    ) : rank === 2 ? (
                      <View style={[styles.rankBadge, styles.rankSilver]}>
                        <Text style={styles.rankBadgeText}>2</Text>
                      </View>
                    ) : rank === 3 ? (
                      <View style={[styles.rankBadge, styles.rankBronze]}>
                        <Text style={styles.rankBadgeText}>3</Text>
                      </View>
                    ) : (
                      <Text style={styles.rankText}>{rank}</Text>
                    )}
                  </View>
                  
                  <View style={styles.playerColumn}>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {p.username}
                    </Text>
                    {isCurrentPlayer ? (
                      <Text style={styles.youBadge}>YOU</Text>
                    ) : null}
                  </View>

                  <Text style={[styles.statText, styles.statColumn]}>{p.totalKills}</Text>
                  <Text style={[styles.statText, styles.statColumn]}>{p.matchesWon}</Text>
                  <Text style={[styles.statText, styles.statColumn]}>{p.level}</Text>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
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
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: GameColors.hudBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...Typography.body,
    color: GameColors.textSecondary,
    marginTop: Spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["2xl"],
  },
  errorText: {
    ...Typography.body,
    color: GameColors.textSecondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  retryButton: {
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.md,
    backgroundColor: GameColors.primary,
    borderRadius: BorderRadius.sm,
  },
  retryButtonText: {
    ...Typography.body,
    color: "#fff",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing["2xl"],
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: GameColors.surfaceLight,
    marginBottom: Spacing.sm,
  },
  headerText: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    letterSpacing: 1,
    fontWeight: "600",
  },
  rankColumn: {
    width: 50,
    alignItems: "center",
  },
  playerColumn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statColumn: {
    width: 45,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyText: {
    ...Typography.h4,
    color: GameColors.textSecondary,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginTop: Spacing.xs,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  playerRowHighlight: {
    borderWidth: 2,
    borderColor: GameColors.primary,
  },
  topThreeRow: {
    backgroundColor: "rgba(247, 183, 49, 0.1)",
  },
  rankContainer: {
    justifyContent: "center",
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  rankGold: {
    backgroundColor: "rgba(255, 215, 0, 0.2)",
  },
  rankSilver: {
    backgroundColor: "rgba(192, 192, 192, 0.2)",
  },
  rankBronze: {
    backgroundColor: "rgba(205, 127, 50, 0.2)",
  },
  rankBadgeText: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "700",
  },
  rankText: {
    ...Typography.body,
    color: GameColors.textSecondary,
  },
  playerName: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "600",
    flex: 1,
  },
  youBadge: {
    ...Typography.caption,
    color: GameColors.primary,
    fontWeight: "700",
  },
  statText: {
    ...Typography.body,
    color: GameColors.textPrimary,
  },
});
