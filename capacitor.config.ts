import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "com.xaoxay.truco",
  appName: "Truco",
  webDir: "dist",
  backgroundColor: "#392319",
  ios: { contentInset: "never" },
  plugins: { SystemBars: { insetsHandling: "css" } },
};
export default config;
