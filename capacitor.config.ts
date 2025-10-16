import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tibis.zipvan',
  appName: 'ZipVan',
  webDir: 'dist',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: false,
      autoDeleteFailed: true,
      autoDeletePrevious: true,
      resetWhenUpdate: false,
      appReadyTimeout: 10000,
      responseTimeout: 20,
      keepUrlPathAfterReload: false,
      disableJSLogging: false,
      shakeMenu: false,
    },
  },
};

export default config;
