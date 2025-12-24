import React from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function KeyboardProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <KeyboardProvider>{children}</KeyboardProvider>;
}
