import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Dimensions,
  Modal,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { GameColors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { useGameStore, type GamePlayer } from "@/lib/gameSocket";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function GameplayScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { player } = useAuth();
  const { 
    players, 
    status, 
    timeRemaining, 
    localPlayerId, 
    sendShoot, 
    leaveMatch 
  } = useGameStore();

  const [isPaused, setIsPaused] = useState(false);
  const [isScoped, setIsScoped] = useState(false);
  const [hitMarker, setHitMarker] = useState(false);
  const [killNotification, setKillNotification] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<GamePlayer | null>(null);

  const hitFlashAnim = useRef(new Animated.Value(0)).current;
  const killBannerAnim = useRef(new Animated.Value(-100)).current;

  const localPlayer = players.find(p => p.id === localPlayerId);
  const enemies = players.filter(p => p.id !== localPlayerId);

  useEffect(() => {
    if (status === "ended") {
      navigation.replace("MatchResults");
    }
  }, [status]);

  const handleShoot = useCallback(() => {
    if (!selectedTarget) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    sendShoot(selectedTarget.id);

    setHitMarker(true);
    Animated.sequence([
      Animated.timing(hitFlashAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(hitFlashAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => setHitMarker(false), 200);
  }, [selectedTarget, sendShoot]);

  const handleEnemySelect = (enemy: GamePlayer) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setSelectedTarget(enemy);
  };

  const handleLeaveMatch = () => {
    leaveMatch();
    navigation.replace("MainMenu");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@assets/game/urban_rooftop_background.png")}
        style={styles.gameBackground}
        resizeMode="cover"
      />

      {isScoped && (
        <Image
          source={require("@assets/game/sniper_scope_overlay.png")}
          style={styles.scopeOverlay}
          resizeMode="contain"
        />
      )}

      {hitMarker && (
        <Animated.View 
          style={[
            styles.hitFlash,
            { opacity: hitFlashAnim }
          ]}
        />
      )}

      <View style={[styles.hudTop, { top: insets.top + Spacing.lg }]}>
        <View style={styles.hudLeft}>
          <Pressable 
            style={styles.pauseButton}
            onPress={() => setIsPaused(true)}
          >
            <Feather name="menu" size={24} color={GameColors.textPrimary} />
          </Pressable>
          <View style={styles.healthBar}>
            <View 
              style={[
                styles.healthFill, 
                { width: `${localPlayer?.health || 100}%` },
                (localPlayer?.health || 100) <= 30 && styles.healthLow
              ]} 
            />
            <Text style={styles.healthText}>{localPlayer?.health || 100}</Text>
          </View>
          <View style={styles.statBadge}>
            <Feather name="crosshair" size={14} color={GameColors.primary} />
            <Text style={styles.statText}>{localPlayer?.kills || 0}</Text>
          </View>
        </View>

        <View style={styles.hudRight}>
          <View style={styles.timerBadge}>
            <Feather name="clock" size={14} color={GameColors.textSecondary} />
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.enemyList}>
        <Text style={styles.enemyListTitle}>TARGETS</Text>
        {enemies.map(enemy => (
          <Pressable
            key={enemy.id}
            style={[
              styles.enemyCard,
              selectedTarget?.id === enemy.id && styles.enemyCardSelected
            ]}
            onPress={() => handleEnemySelect(enemy)}
          >
            <View style={styles.enemyInfo}>
              <Text style={styles.enemyName}>{enemy.username}</Text>
              <View style={styles.enemyHealthBar}>
                <View 
                  style={[
                    styles.enemyHealthFill,
                    { width: `${enemy.health}%` }
                  ]} 
                />
              </View>
            </View>
            {selectedTarget?.id === enemy.id && (
              <Feather name="target" size={16} color={GameColors.danger} />
            )}
          </Pressable>
        ))}
      </View>

      <View style={[styles.controlsBottom, { bottom: insets.bottom + Spacing.xl }]}>
        <Pressable
          style={({ pressed }) => [
            styles.scopeButton,
            isScoped && styles.scopeButtonActive,
            pressed && styles.buttonPressed
          ]}
          onPress={() => {
            setIsScoped(!isScoped);
            if (Platform.OS !== "web") {
              Haptics.selectionAsync();
            }
          }}
        >
          <Feather 
            name="zoom-in" 
            size={28} 
            color={isScoped ? GameColors.background : GameColors.textPrimary} 
          />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.fireButton,
            pressed && styles.fireButtonPressed,
            !selectedTarget && styles.fireButtonDisabled
          ]}
          onPress={handleShoot}
          disabled={!selectedTarget}
        >
          <Feather name="crosshair" size={32} color="#fff" />
        </Pressable>
      </View>

      <Modal visible={isPaused} transparent animationType="fade">
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseModal}>
            <Text style={styles.pauseTitle}>PAUSED</Text>
            
            <Pressable
              style={({ pressed }) => [styles.pauseButton2, pressed && styles.buttonPressed]}
              onPress={() => setIsPaused(false)}
            >
              <Text style={styles.pauseButtonText}>RESUME</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.pauseButton2, styles.leaveButton, pressed && styles.buttonPressed]}
              onPress={handleLeaveMatch}
            >
              <Text style={styles.leaveButtonText}>LEAVE MATCH</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
  },
  gameBackground: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  scopeOverlay: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.9,
  },
  hitFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(231, 76, 60, 0.3)",
  },
  hudTop: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  hudLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    backgroundColor: GameColors.hudBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: GameColors.hudBorder,
  },
  healthBar: {
    width: 120,
    height: 24,
    backgroundColor: GameColors.hudBackground,
    borderRadius: BorderRadius.xs,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: GameColors.hudBorder,
    justifyContent: "center",
  },
  healthFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: GameColors.success,
  },
  healthLow: {
    backgroundColor: GameColors.danger,
  },
  healthText: {
    ...Typography.caption,
    color: GameColors.textPrimary,
    textAlign: "center",
    fontWeight: "700",
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: GameColors.hudBackground,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: GameColors.hudBorder,
  },
  statText: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "700",
  },
  hudRight: {
    alignItems: "flex-end",
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: GameColors.hudBackground,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: GameColors.hudBorder,
  },
  timerText: {
    ...Typography.mono,
    color: GameColors.textPrimary,
  },
  enemyList: {
    position: "absolute",
    top: 120,
    right: Spacing.lg,
    width: 160,
    gap: Spacing.sm,
  },
  enemyListTitle: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  enemyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.hudBackground,
    borderRadius: BorderRadius.xs,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: GameColors.hudBorder,
  },
  enemyCardSelected: {
    borderColor: GameColors.danger,
    borderWidth: 2,
  },
  enemyInfo: {
    flex: 1,
  },
  enemyName: {
    ...Typography.caption,
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  enemyHealthBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    marginTop: Spacing.xs,
    overflow: "hidden",
  },
  enemyHealthFill: {
    height: "100%",
    backgroundColor: GameColors.danger,
  },
  controlsBottom: {
    position: "absolute",
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  scopeButton: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: GameColors.hudBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: GameColors.hudBorder,
  },
  scopeButtonActive: {
    backgroundColor: GameColors.textPrimary,
    borderColor: GameColors.textPrimary,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  fireButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GameColors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: GameColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  fireButtonPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: "#cc5429",
  },
  fireButtonDisabled: {
    opacity: 0.5,
  },
  pauseOverlay: {
    flex: 1,
    backgroundColor: GameColors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  pauseModal: {
    width: "80%",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  pauseTitle: {
    ...Typography.h2,
    color: GameColors.textPrimary,
    marginBottom: Spacing["2xl"],
    letterSpacing: 4,
  },
  pauseButton2: {
    width: "100%",
    height: Spacing.buttonHeight,
    backgroundColor: GameColors.primary,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  pauseButtonText: {
    ...Typography.body,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 1,
  },
  leaveButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: GameColors.danger,
  },
  leaveButtonText: {
    ...Typography.body,
    color: GameColors.danger,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
