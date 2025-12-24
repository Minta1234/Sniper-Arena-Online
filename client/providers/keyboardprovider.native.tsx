import React from "react";
import { Platform } from "react-native";

let KeyboardProviderWrapper: React.FC<{ children: React.ReactNode }>;

if (Platform.OS === "web") {
  // Web fallback: ไม่ใช้ native KeyboardProvider
  KeyboardProviderWrapper = ({ children }) => <>{children}</>;
} else {
  // Native (iOS/Android)
  const { KeyboardProvider } = require("react-native-keyboard-controller");
  KeyboardProviderWrapper = ({ children }) => <KeyboardProvider>{children}</KeyboardProvider>;
}

export default KeyboardProviderWrapper;
