import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "com.xaoxay.truco",
  appName: "Tru-Co",
  webDir: "dist",
  backgroundColor: "#392319",
  ios: { contentInset: "never" },
  plugins: { SystemBars: { insetsHandling: "native" } },
};
export default config;
