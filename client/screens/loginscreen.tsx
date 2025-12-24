import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { GameColors, Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { Feather } from "@expo/vector-icons";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }

    if (username.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters");
      return;
    }

    if (password.length < 4) {
      Alert.alert("Error", "Password must be at least 4 characters");
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing["3xl"], paddingBottom: insets.bottom + Spacing["2xl"] },
      ]}
    >
      <View style={styles.header}>
        <Image
          source={require("@assets/game/urban_rooftop_background.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        <View style={styles.logoContainer}>
          <Feather name="crosshair" size={64} color={GameColors.primary} />
          <Text style={styles.title}>SNIPER ELITE</Text>
          <Text style={styles.subtitle}>PVP COMBAT</Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>{isLogin ? "SIGN IN" : "CREATE ACCOUNT"}</Text>

        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color={GameColors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={GameColors.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color={GameColors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={GameColors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isLogin ? "ENTER BATTLE" : "JOIN THE FIGHT"}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={styles.switchButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchText}>
            {isLogin ? "New recruit? " : "Already enlisted? "}
            <Text style={styles.switchTextHighlight}>
              {isLogin ? "Sign up" : "Sign in"}
            </Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26, 26, 29, 0.7)",
  },
  logoContainer: {
    alignItems: "center",
  },
  title: {
    ...Typography.display,
    color: GameColors.textPrimary,
    marginTop: Spacing.lg,
    letterSpacing: 4,
  },
  subtitle: {
    ...Typography.body,
    color: GameColors.primary,
    letterSpacing: 8,
    marginTop: Spacing.xs,
  },
  form: {
    flex: 1,
    padding: Spacing["2xl"],
  },
  formTitle: {
    ...Typography.h3,
    color: GameColors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing["3xl"],
    letterSpacing: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: GameColors.surfaceLight,
    marginBottom: Spacing.lg,
    height: Spacing.inputHeight,
  },
  inputIcon: {
    marginLeft: Spacing.lg,
  },
  input: {
    flex: 1,
    color: GameColors.textPrimary,
    paddingHorizontal: Spacing.md,
    ...Typography.body,
  },
  submitButton: {
    backgroundColor: GameColors.primary,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
    ...Shadows.button,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    ...Typography.body,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 2,
  },
  switchButton: {
    marginTop: Spacing["2xl"],
    alignItems: "center",
    padding: Spacing.md,
  },
  switchText: {
    ...Typography.body,
    color: GameColors.textSecondary,
  },
  switchTextHighlight: {
    color: GameColors.primary,
    fontWeight: "600",
  },
});
