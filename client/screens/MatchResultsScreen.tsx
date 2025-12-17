import React from "react";
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
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { GameColors, Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { useGameStore } from "@/lib/gameSocket";
import { Feather } from "@expo/vector-icons";

const AVATARS = [
  require("@assets/avatars/tactical_operative_avatar.png"),
  require("@assets/avatars/urban_sniper_avatar.png"),
  require("@assets/avatars/ghost_recon_avatar.png"),
  require("@assets/avatars/elite_marksman_avatar.png"),
];

export default function MatchResultsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { player } = useAuth();
  const { results, winnerId, reset } = useGameStore();

  const isWinner = player?.id === winnerId;
  const sortedResults = [...results].sort((a, b) => b.kills - a.kills);
  const winnerResult = sortedResults.find(r => r.playerId === winnerId);

  const handleReturn = () => {
    reset();
    navigation.replace("MainMenu");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.xl }]}>
      <Text style={styles.title}>MATCH RESULTS</Text>

      <View style={[styles.winnerBanner, isWinner && styles.winnerBannerHighlight]}>
        <View style={styles.winnerIconContainer}>
          <Feather 
            name={isWinner ? "award" : "user"} 
            size={32} 
            color={isWinner ? GameColors.accent : GameColors.textSecondary} 
          />
        </View>
        <View style={styles.winnerInfo}>
          <Text style={styles.winnerLabel}>
            {isWinner ? "VICTORY!" : "WINNER"}
          </Text>
          <Text style={styles.winnerName}>
            {winnerResult?.username || "Unknown"}
          </Text>
        </View>
        <View style={styles.winnerStats}>
          <Text style={styles.winnerKills}>{winnerResult?.kills || 0}</Text>
          <Text style={styles.winnerKillsLabel}>KILLS</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.resultsContainer, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>FINAL STANDINGS</Text>
        
        {sortedResults.map((result, index) => {
          const isCurrentPlayer = result.playerId === player?.id;
          return (
            <View 
              key={result.playerId}
              style={[
                styles.resultCard,
                isCurrentPlayer && styles.resultCardHighlight
              ]}
            >
              <View style={styles.rankBadge}>
                <Text style={[
                  styles.rankText,
                  index === 0 && styles.rankFirst
                ]}>
                  {index + 1}
                </Text>
              </View>
              
              <View style={styles.playerSection}>
                <Text style={styles.playerName}>{result.username}</Text>
                {isCurrentPlayer && (
                  <Text style={styles.youBadge}>YOU</Text>
                )}
              </View>

              <View style={styles.statsSection}>
                <View style={styles.statColumn}>
                  <Text style={styles.statValue}>{result.kills}</Text>
                  <Text style={styles.statLabel}>K</Text>
                </View>
                <View style={styles.statColumn}>
                  <Text style={styles.statValue}>{result.deaths}</Text>
                  <Text style={styles.statLabel}>D</Text>
                </View>
                <View style={styles.statColumn}>
                  <Text style={[styles.statValue, styles.scoreValue]}>{result.score}</Text>
                  <Text style={styles.statLabel}>PTS</Text>
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.xpSection}>
          <Feather name="trending-up" size={24} color={GameColors.accent} />
          <View style={styles.xpInfo}>
            <Text style={styles.xpLabel}>XP EARNED</Text>
            <Text style={styles.xpValue}>
              +{(sortedResults.find(r => r.playerId === player?.id)?.kills || 0) * 100 + (isWinner ? 500 : 100)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Pressable
          style={({ pressed }) => [styles.returnButton, pressed && styles.buttonPressed]}
          onPress={handleReturn}
        >
          <Feather name="home" size={20} color="#fff" />
          <Text style={styles.returnButtonText}>RETURN TO MENU</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
    paddingHorizontal: Spacing["2xl"],
  },
  title: {
    ...Typography.h2,
    color: GameColors.textPrimary,
    textAlign: "center",
    letterSpacing: 4,
    marginBottom: Spacing["2xl"],
  },
  winnerBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: GameColors.surfaceLight,
    marginBottom: Spacing["2xl"],
  },
  winnerBannerHighlight: {
    borderColor: GameColors.accent,
    backgroundColor: "rgba(247, 183, 49, 0.1)",
  },
  winnerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GameColors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  winnerInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  winnerLabel: {
    ...Typography.caption,
    color: GameColors.accent,
    letterSpacing: 2,
  },
  winnerName: {
    ...Typography.h3,
    color: GameColors.textPrimary,
  },
  winnerStats: {
    alignItems: "center",
  },
  winnerKills: {
    ...Typography.h1,
    color: GameColors.primary,
  },
  winnerKillsLabel: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  resultsContainer: {
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  resultCardHighlight: {
    borderColor: GameColors.primary,
    borderWidth: 2,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GameColors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "700",
  },
  rankFirst: {
    color: GameColors.accent,
  },
  playerSection: {
    flex: 1,
    marginLeft: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  playerName: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  youBadge: {
    ...Typography.caption,
    color: GameColors.primary,
    fontWeight: "700",
  },
  statsSection: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  statColumn: {
    alignItems: "center",
    minWidth: 32,
  },
  statValue: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "700",
  },
  scoreValue: {
    color: GameColors.accent,
  },
  statLabel: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    fontSize: 10,
  },
  xpSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(247, 183, 49, 0.15)",
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  xpInfo: {
    flex: 1,
  },
  xpLabel: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    letterSpacing: 1,
  },
  xpValue: {
    ...Typography.h3,
    color: GameColors.accent,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.lg,
    backgroundColor: GameColors.background,
  },
  returnButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
    height: Spacing.buttonHeight,
    backgroundColor: GameColors.primary,
    borderRadius: BorderRadius.sm,
    ...Shadows.button,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  returnButtonText: {
    ...Typography.body,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 1,
  },
});
