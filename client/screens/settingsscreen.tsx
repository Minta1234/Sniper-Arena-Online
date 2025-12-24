import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { GameColors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { Feather } from "@expo/vector-icons";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { logout, player } = useAuth();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [showFPS, setShowFPS] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>SETTINGS</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing["2xl"] }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>AUDIO</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="volume-2" size={20} color={GameColors.textPrimary} />
              <Text style={styles.settingLabel}>Sound Effects</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: GameColors.surfaceLight, true: GameColors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="music" size={20} color={GameColors.textPrimary} />
              <Text style={styles.settingLabel}>Music</Text>
            </View>
            <Switch
              value={musicEnabled}
              onValueChange={setMusicEnabled}
              trackColor={{ false: GameColors.surfaceLight, true: GameColors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>CONTROLS</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="smartphone" size={20} color={GameColors.textPrimary} />
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
            </View>
            <Switch
              value={hapticEnabled}
              onValueChange={setHapticEnabled}
              trackColor={{ false: GameColors.surfaceLight, true: GameColors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>GRAPHICS</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="activity" size={20} color={GameColors.textPrimary} />
              <Text style={styles.settingLabel}>Show FPS</Text>
            </View>
            <Switch
              value={showFPS}
              onValueChange={setShowFPS}
              trackColor={{ false: GameColors.surfaceLight, true: GameColors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="user" size={20} color={GameColors.textPrimary} />
              <View>
                <Text style={styles.settingLabel}>Signed in as</Text>
                <Text style={styles.settingValue}>{player?.username || "Unknown"}</Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />
          <Pressable 
            style={({ pressed }) => [styles.settingRow, styles.dangerRow, pressed && styles.pressed]}
            onPress={handleLogout}
          >
            <View style={styles.settingInfo}>
              <Feather name="log-out" size={20} color={GameColors.danger} />
              <Text style={[styles.settingLabel, styles.dangerText]}>Logout</Text>
            </View>
            <Feather name="chevron-right" size={20} color={GameColors.danger} />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="info" size={20} color={GameColors.textPrimary} />
              <Text style={styles.settingLabel}>Version</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Sniper Elite PvP</Text>
          <Text style={styles.footerSubtext}>Built with Expo</Text>
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
  sectionTitle: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    letterSpacing: 2,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  settingsGroup: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  settingLabel: {
    ...Typography.body,
    color: GameColors.textPrimary,
  },
  settingValue: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: GameColors.surfaceLight,
    marginHorizontal: Spacing.lg,
  },
  dangerRow: {
    backgroundColor: "rgba(231, 76, 60, 0.1)",
  },
  dangerText: {
    color: GameColors.danger,
  },
  pressed: {
    opacity: 0.7,
  },
  footer: {
    alignItems: "center",
    marginTop: Spacing["4xl"],
    paddingVertical: Spacing["2xl"],
  },
  footerText: {
    ...Typography.body,
    color: GameColors.textSecondary,
    fontWeight: "600",
  },
  footerSubtext: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginTop: Spacing.xs,
  },
});
