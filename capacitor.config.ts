import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tibis.zipvan",
  appName: "Zip Van",
  webDir: "dist",

  server: {
    androidScheme: "https",
  },

  plugins: {
    CapacitorUpdater: {
      autoUpdate: false, // 🔧 Desativado, pois o update é manual via código
      resetWhenUpdate: false, // mantém dados e cache do app
      autoDeleteFailed: true, // limpa bundles corrompidos automaticamente
    },
  },
};

export default config;
