import React from "react";

export default function KeyboardProviderWrapper({ children }: { children: React.ReactNode }) {
  // Web: fallback ไม่มี provider
  return <>{children}</>;
}
