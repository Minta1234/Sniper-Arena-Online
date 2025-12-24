import { registerRootComponent, Platform } from "expo";
import App from "@/App";

if (Platform.OS === "web") {
  // web-specific setup (ถ้ามี)
}

registerRootComponent(App);
