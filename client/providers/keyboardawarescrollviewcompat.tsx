import React from "react";
import { ScrollView, ScrollViewProps, Platform } from "react-native";

let KeyboardAwareScrollView: React.FC<ScrollViewProps>;

// Native: ใช้ KeyboardAwareScrollView ของ react-native-keyboard-controller
if (Platform.OS !== "web") {
  const { KeyboardAwareScrollView: KASV } = require("react-native-keyboard-controller");
  KeyboardAwareScrollView = (props) => <KASV {...props} />;
} else {
  // Web: fallback เป็น ScrollView ธรรมดา
  KeyboardAwareScrollView = (props) => <ScrollView {...props} />;
}

export default KeyboardAwareScrollView;
