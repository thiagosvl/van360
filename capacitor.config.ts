import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tibis.van360',
  appName: 'Van360',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    CapacitorUpdater: {
      autoUpdate: false,
      stats: false,
      autoDeleteFailed: true,
      autoDeletePrevious: true,
      resetWhenUpdate: false,
      appReadyTimeout: 10000,
      responseTimeout: 20,
      keepUrlPathAfterReload: true,
      disableJSLogging: false,
      shakeMenu: false,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
    },
  },
  server: {
    hostname: 'app.van360.com.br',
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: true
  }
};

export default config;
