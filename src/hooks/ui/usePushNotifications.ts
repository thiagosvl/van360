import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { CobrancaTab, PushNotificationAction } from '@/types/enums';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { usePushToken } from '../api/usePushToken';
import { useSession } from '../business/useSession';
import { useResponsavelAuth } from '@/contexts/ResponsavelAuthContext';
import { responsavelApi } from '@/services/api/responsavel.api';

import { normalizeNotificationRoute, savePendingDeepLink } from '@/utils/deepLink';

export const getCachedPushTokenInfo = async (): Promise<{ token: string; platform: string } | null> => {
  const token = localStorage.getItem('van360_fcm_token');
  if (!token) return null;
  const platform = localStorage.getItem('van360_fcm_platform') || 'android';
  return { token, platform };
};

export function resolveNotificationRoute(
  data?: Record<string, unknown>,
  isResponsavel = false
): string {
  if (!data) {
    return isResponsavel ? ROUTES.PRIVATE.RESPONSAVEL.HOME : ROUTES.PRIVATE.MOTORISTA.HOME;
  }

  const explicitUrl = (data.targetUrl || data.url || data.link || data.checkoutUrl || data.contractUrl) as string | undefined;
  if (explicitUrl && typeof explicitUrl === 'string') {
    return normalizeNotificationRoute(explicitUrl);
  }

  const action = data.action as PushNotificationAction | undefined;
  switch (action) {
    case PushNotificationAction.OPEN_HOME:
      return ROUTES.PRIVATE.MOTORISTA.HOME;
    case PushNotificationAction.OPEN_SUBSCRIPTION:
      return ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION;
    case PushNotificationAction.OPEN_CONTRACTS:
      return ROUTES.PRIVATE.MOTORISTA.CONTRACTS;
    case PushNotificationAction.OPEN_ROUTE:
      return isResponsavel ? ROUTES.PRIVATE.RESPONSAVEL.HOME : ROUTES.PRIVATE.MOTORISTA.ROUTES;
    case PushNotificationAction.OPEN_TEAM:
      return ROUTES.PRIVATE.MOTORISTA.TEAM;
    case PushNotificationAction.OPEN_BILLING:
      return `${ROUTES.PRIVATE.MOTORISTA.BILLING}?tab=${CobrancaTab.ARECEBER}`;
    case PushNotificationAction.OPEN_PASSENGERS:
      return ROUTES.PRIVATE.MOTORISTA.PASSENGERS;
    case PushNotificationAction.OPEN_PASSENGER_REQUESTS:
      return `${ROUTES.PRIVATE.MOTORISTA.PASSENGERS}?tab=solicitacoes`;
    case PushNotificationAction.OPEN_SCHOOLS:
      return ROUTES.PRIVATE.MOTORISTA.SCHOOLS;
    case PushNotificationAction.OPEN_VEHICLES:
      return ROUTES.PRIVATE.MOTORISTA.VEHICLES;
    case PushNotificationAction.OPEN_EXPENSES:
      return ROUTES.PRIVATE.MOTORISTA.EXPENSES;
    case PushNotificationAction.OPEN_REPORTS:
      return ROUTES.PRIVATE.MOTORISTA.REPORTS;
    case PushNotificationAction.OPEN_SETTINGS:
      return ROUTES.PRIVATE.MOTORISTA.ACCOUNT;
    case PushNotificationAction.OPEN_BIRTHDAYS:
      return ROUTES.PRIVATE.MOTORISTA.BIRTHDAYS;
    case PushNotificationAction.OPEN_TRACKING:
      return isResponsavel ? ROUTES.PRIVATE.RESPONSAVEL.HOME : ROUTES.PRIVATE.MOTORISTA.ROUTES;
    default:
      return isResponsavel ? ROUTES.PRIVATE.RESPONSAVEL.HOME : ROUTES.PRIVATE.MOTORISTA.HOME;
  }
}

export const usePushNotifications = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const { token: responsavelToken, isAuthenticated: isResponsavelAuth } = useResponsavelAuth();
  const { mutateAsync: registerPushToken } = usePushToken();
  const lastDispatchedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handles: PluginListenerHandle[] = [];

    const addActionListener = async () => {
      try {
        const actionHandle = await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (notification) => {
            const data = notification.notification.data as Record<string, unknown> | undefined;
            const targetRoute = resolveNotificationRoute(data, isResponsavelAuth);
            savePendingDeepLink(targetRoute);
            navigate(targetRoute);
          }
        );
        handles.push(actionHandle);

        const receivedHandle = await PushNotifications.addListener(
          'pushNotificationReceived',
          (notification) => {
            console.log('[Push] Notificação recebida em primeiro plano:', notification);
          }
        );
        handles.push(receivedHandle);
      } catch (e) {
        console.error('Erro ao adicionar listener de acao de push:', e);
      }
    };

    addActionListener();

    return () => {
      handles.forEach((h) => h.remove());
    };
  }, [navigate, isResponsavelAuth]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let isMounted = true;
    const handles: PluginListenerHandle[] = [];

    const dispatchTokenToBackend = async (fcmToken: string, platform: string) => {
      if (!isMounted || !fcmToken) return;
      if (lastDispatchedTokenRef.current === fcmToken) return;
      lastDispatchedTokenRef.current = fcmToken;

      if (session?.user?.id) {
        await registerPushToken({ token: fcmToken, platform })
          .catch(err => {
            lastDispatchedTokenRef.current = null;
            console.error('[Push] Erro ao enviar token do usuário ao backend:', err);
          });
      } else if (isResponsavelAuth && responsavelToken) {
        await responsavelApi.registerPushToken({ token: fcmToken, platform }, responsavelToken)
          .catch(err => {
            lastDispatchedTokenRef.current = null;
            console.error('[Push] Erro ao enviar token do responsável ao backend:', err);
          });
      }
    };

    const initAndRegisterPush = async () => {
      const isAuthenticated = Boolean(session?.user?.id || (isResponsavelAuth && responsavelToken));
      if (!isAuthenticated) return;

      try {
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.warn('[Push] Permissão de Push não concedida pelo usuário');
          return;
        }

        if (Capacitor.getPlatform() === 'android') {
          await PushNotifications.createChannel({
            id: 'default',
            name: 'Notificações Van360',
            description: 'Notificações gerais do aplicativo',
            importance: 5,
            visibility: 1,
            sound: 'default',
            vibration: true,
          }).catch(err => console.error('[Push] Erro ao criar canal de notificação:', err));
        }

        const regHandle = await PushNotifications.addListener('registration', async (token) => {
          console.log('[Push] Token do dispositivo capturado:', token.value);
          const info = await Device.getInfo();
          const platform = info.platform || 'android';
          localStorage.setItem('van360_fcm_token', token.value);
          localStorage.setItem('van360_fcm_platform', platform);

          await dispatchTokenToBackend(token.value, platform);
        });
        handles.push(regHandle);

        const errHandle = await PushNotifications.addListener('registrationError', (error) => {
          console.error('[Push] Erro no registro de push:', error);
        });
        handles.push(errHandle);

        await PushNotifications.register();

        const cachedToken = localStorage.getItem('van360_fcm_token');
        const cachedPlatform = localStorage.getItem('van360_fcm_platform') || 'android';
        if (cachedToken) {
          await dispatchTokenToBackend(cachedToken, cachedPlatform);
        }
      } catch (err) {
        console.error('[Push] Falha na inicialização do Push:', err);
      }
    };

    initAndRegisterPush();

    return () => {
      isMounted = false;
      handles.forEach((h) => h.remove());
    };
  }, [session?.user?.id, isResponsavelAuth, responsavelToken]);
};
