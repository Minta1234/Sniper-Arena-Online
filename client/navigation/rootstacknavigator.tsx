import React, { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/lib/auth";
import { GameColors } from "@/constants/theme";

import LoginScreen from "@/screens/LoginScreen";
import MainMenuScreen from "@/screens/MainMenuScreen";
import MatchmakingScreen from "@/screens/MatchmakingScreen";
import GameplayScreen from "@/screens/GameplayScreen";
import MatchResultsScreen from "@/screens/MatchResultsScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import LeaderboardScreen from "@/screens/LeaderboardScreen";
import SettingsScreen from "@/screens/SettingsScreen";

export type RootStackParamList = {
  Login: undefined;
  MainMenu: undefined;
  Matchmaking: undefined;
  Gameplay: undefined;
  MatchResults: undefined;
  Profile: undefined;
  Leaderboard: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { isLoading, isAuthenticated, loadStoredAuth } = useAuth();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={GameColors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="MainMenu" component={MainMenuScreen} />
          <Stack.Screen name="Matchmaking" component={MatchmakingScreen} />
          <Stack.Screen 
            name="Gameplay" 
            component={GameplayScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="MatchResults" 
            component={MatchResultsScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen 
            name="Leaderboard" 
            component={LeaderboardScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ presentation: "modal" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: GameColors.background,
  },
});
