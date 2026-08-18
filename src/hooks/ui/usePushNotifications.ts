import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { PushNotificationAction } from '@/types/enums';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { usePushToken } from '../api/usePushToken';
import { useSession } from '../business/useSession';
import { useResponsavelAuth } from '@/contexts/ResponsavelAuthContext';
import { responsavelApi } from '@/services/api/responsavel.api';

export const getCachedPushTokenInfo = async (): Promise<{ token: string; platform: string } | null> => {
  const token = localStorage.getItem('van360_fcm_token');
  if (!token) return null;
  const platform = localStorage.getItem('van360_fcm_platform') || 'android';
  return { token, platform };
};

export const usePushNotifications = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const { token: responsavelToken, isAuthenticated: isResponsavelAuth } = useResponsavelAuth();
  const { mutateAsync: registerPushToken } = usePushToken();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handles: PluginListenerHandle[] = [];

    const addActionListener = async () => {
      try {
        const actionHandle = await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (notification) => {
            const data = notification.notification.data;
            const action = data?.action;
            if (!action) return;

            switch (action) {
              case PushNotificationAction.OPEN_HOME: navigate(ROUTES.PRIVATE.MOTORISTA.HOME); break;
              case PushNotificationAction.OPEN_SUBSCRIPTION: navigate(ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION); break;
              case PushNotificationAction.OPEN_CONTRACTS: navigate(ROUTES.PRIVATE.MOTORISTA.CONTRACTS); break;
              case PushNotificationAction.OPEN_ROUTE: navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES); break;
              case PushNotificationAction.OPEN_TEAM: navigate(ROUTES.PRIVATE.MOTORISTA.TEAM); break;
              case PushNotificationAction.OPEN_BILLING: navigate(ROUTES.PRIVATE.MOTORISTA.BILLING); break;
              case PushNotificationAction.OPEN_PASSENGERS: navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGERS); break;
              case PushNotificationAction.OPEN_PASSENGER_REQUESTS: navigate(`${ROUTES.PRIVATE.MOTORISTA.PASSENGERS}?tab=solicitacoes`); break;
              case PushNotificationAction.OPEN_SCHOOLS: navigate(ROUTES.PRIVATE.MOTORISTA.SCHOOLS); break;
              case PushNotificationAction.OPEN_VEHICLES: navigate(ROUTES.PRIVATE.MOTORISTA.VEHICLES); break;
              case PushNotificationAction.OPEN_EXPENSES: navigate(ROUTES.PRIVATE.MOTORISTA.EXPENSES); break;
              case PushNotificationAction.OPEN_REPORTS: navigate(ROUTES.PRIVATE.MOTORISTA.REPORTS); break;
              case PushNotificationAction.OPEN_SETTINGS: navigate(ROUTES.PRIVATE.MOTORISTA.SETTINGS); break;
              case PushNotificationAction.OPEN_BIRTHDAYS: navigate(ROUTES.PRIVATE.MOTORISTA.BIRTHDAYS); break;
              default: navigate(ROUTES.PRIVATE.MOTORISTA.HOME); break;
            }
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
  }, [navigate]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let isMounted = true;
    const handles: PluginListenerHandle[] = [];

    const dispatchTokenToBackend = async (fcmToken: string, platform: string) => {
      if (!isMounted) return;

      if (session?.user?.id) {
        await registerPushToken({ token: fcmToken, platform })
          .catch(err => console.error('[Push] Erro ao enviar token do usuário ao backend:', err));
      } else if (isResponsavelAuth && responsavelToken) {
        await responsavelApi.registerPushToken({ token: fcmToken, platform }, responsavelToken)
          .catch(err => console.error('[Push] Erro ao enviar token do responsável ao backend:', err));
      }
    };

    const initAndRegisterPush = async () => {
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
