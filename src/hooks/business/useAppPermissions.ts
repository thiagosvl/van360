import { useState, useEffect, useCallback } from 'react';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { App, AppState } from '@capacitor/app';
import { PushNotifications } from '@capacitor/push-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { AppPermissionStatus } from '@/types/enums';

export interface AppPermissionsState {
  pushStatus: AppPermissionStatus;
  locationStatus: AppPermissionStatus;
  isChecking: boolean;
  checkAllPermissions: () => Promise<{ push: AppPermissionStatus; location: AppPermissionStatus }>;
  requestPushPermission: () => Promise<AppPermissionStatus>;
  requestLocationPermission: () => Promise<AppPermissionStatus>;
  openDeviceSettings: () => Promise<void>;
}

export function useAppPermissions(): AppPermissionsState {
  const isNative = Capacitor.isNativePlatform();
  const [pushStatus, setPushStatus] = useState<AppPermissionStatus>(
    isNative ? AppPermissionStatus.PROMPT : AppPermissionStatus.UNAVAILABLE
  );
  const [locationStatus, setLocationStatus] = useState<AppPermissionStatus>(
    isNative ? AppPermissionStatus.PROMPT : AppPermissionStatus.UNAVAILABLE
  );
  const [isChecking, setIsChecking] = useState<boolean>(true);

  const checkPushPermission = useCallback(async (): Promise<AppPermissionStatus> => {
    if (!Capacitor.isNativePlatform()) {
      return AppPermissionStatus.UNAVAILABLE;
    }

    try {
      const status = await PushNotifications.checkPermissions();
      const mapped =
        status.receive === 'granted'
          ? AppPermissionStatus.GRANTED
          : status.receive === 'denied'
          ? AppPermissionStatus.DENIED
          : AppPermissionStatus.PROMPT;
      setPushStatus(mapped);
      return mapped;
    } catch {
      setPushStatus(AppPermissionStatus.UNAVAILABLE);
      return AppPermissionStatus.UNAVAILABLE;
    }
  }, []);

  const checkLocationPermission = useCallback(async (): Promise<AppPermissionStatus> => {
    if (!Capacitor.isNativePlatform()) {
      return AppPermissionStatus.UNAVAILABLE;
    }

    try {
      const status = await Geolocation.checkPermissions();
      const mapped =
        status.location === 'granted'
          ? AppPermissionStatus.GRANTED
          : status.location === 'denied'
          ? AppPermissionStatus.DENIED
          : AppPermissionStatus.PROMPT;
      setLocationStatus(mapped);
      return mapped;
    } catch {
      setLocationStatus(AppPermissionStatus.UNAVAILABLE);
      return AppPermissionStatus.UNAVAILABLE;
    }
  }, []);

  const checkAllPermissions = useCallback(async () => {
    setIsChecking(true);
    try {
      const [push, location] = await Promise.all([
        checkPushPermission(),
        checkLocationPermission()
      ]);
      return { push, location };
    } finally {
      setIsChecking(false);
    }
  }, [checkPushPermission, checkLocationPermission]);

  const requestPushPermission = useCallback(async (): Promise<AppPermissionStatus> => {
    if (!Capacitor.isNativePlatform()) {
      return AppPermissionStatus.UNAVAILABLE;
    }

    try {
      let current = await PushNotifications.checkPermissions();
      if (current.receive === 'prompt') {
        current = await PushNotifications.requestPermissions();
      }
      const mapped =
        current.receive === 'granted'
          ? AppPermissionStatus.GRANTED
          : current.receive === 'denied'
          ? AppPermissionStatus.DENIED
          : AppPermissionStatus.PROMPT;
      setPushStatus(mapped);
      return mapped;
    } catch {
      setPushStatus(AppPermissionStatus.UNAVAILABLE);
      return AppPermissionStatus.UNAVAILABLE;
    }
  }, []);

  const requestLocationPermission = useCallback(async (): Promise<AppPermissionStatus> => {
    if (!Capacitor.isNativePlatform()) {
      return AppPermissionStatus.UNAVAILABLE;
    }

    try {
      let current = await Geolocation.checkPermissions();
      if (current.location === 'prompt') {
        current = await Geolocation.requestPermissions();
      }
      const mapped =
        current.location === 'granted'
          ? AppPermissionStatus.GRANTED
          : current.location === 'denied'
          ? AppPermissionStatus.DENIED
          : AppPermissionStatus.PROMPT;
      setLocationStatus(mapped);
      return mapped;
    } catch {
      setLocationStatus(AppPermissionStatus.UNAVAILABLE);
      return AppPermissionStatus.UNAVAILABLE;
    }
  }, []);

  const openDeviceSettings = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await NativeSettings.open({
        optionAndroid: AndroidSettings.ApplicationDetails,
        optionIOS: IOSSettings.App
      });
    } catch (error) {
      console.error('Falha ao abrir configurações nativas:', error);
    }
  }, []);

  useEffect(() => {
    checkAllPermissions();

    let handle: PluginListenerHandle | null = null;

    if (Capacitor.isNativePlatform()) {
      App.addListener('appStateChange', (state: AppState) => {
        if (state.isActive) {
          checkAllPermissions();
        }
      }).then((h) => {
        handle = h;
      });
    }

    return () => {
      handle?.remove();
    };
  }, [checkAllPermissions]);

  return {
    pushStatus,
    locationStatus,
    isChecking,
    checkAllPermissions,
    requestPushPermission,
    requestLocationPermission,
    openDeviceSettings
  };
}
