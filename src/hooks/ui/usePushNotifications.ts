import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { PushNotificationAction } from '@/types/enums';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { usePushToken } from '../api/usePushToken';
import { useSession } from '../business/useSession';
import { toast } from '@/utils/notifications/toast';

export const getCachedPushTokenInfo = async (): Promise<{ token: string; platform: string } | null> => {
  const token = localStorage.getItem('van360_fcm_token');
  if (!token) return null;
  const platform = localStorage.getItem('van360_fcm_platform') || 'android';
  return { token, platform };
};

export const usePushNotifications = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const { mutateAsync: registerPushToken } = usePushToken();

  // 1. Configura listener de clique nas notificações (Roteamento de Ações)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const addActionListener = async () => {
      try {
        await PushNotifications.addListener(
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

        // Listener para notificação recebida em primeiro plano (Log apenas, apresentação nativa é tratada pelo Capacitor)
        await PushNotifications.addListener(
          'pushNotificationReceived',
          (notification) => {
            console.log('[Push] Notificação recebida em primeiro plano:', notification);
          }
        );
      } catch (e) {
        console.error('Erro ao adicionar listener de acao de push:', e);
      }
    };

    addActionListener();
  }, [navigate]);

  // 2. Sempre que a aplicação inicializa OU quando o usuário se autentica (session.user.id muda),
  // solicita permissão, registra no FCM e envia o token pro backend.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let isMounted = true;

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

        // Criar canal de notificação de Alta Importância no Android
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

        // Listener para captura do token
        await PushNotifications.addListener('registration', async (token) => {
          console.log('[Push] Token do dispositivo capturado:', token.value);
          const info = await Device.getInfo();
          localStorage.setItem('van360_fcm_token', token.value);
          localStorage.setItem('van360_fcm_platform', info.platform);

          if (session?.user?.id && isMounted) {
            console.log('[Push] Enviando token para o backend para o usuario:', session.user.id);
            await registerPushToken({
              token: token.value,
              platform: info.platform
            }).catch(err => console.error('[Push] Erro ao enviar token ao backend:', err));
          }
        });

        await PushNotifications.addListener('registrationError', (error) => {
          console.error('[Push] Erro no registro de push:', error);
        });

        // Dispara o registro nativo no Firebase/Capacitor
        await PushNotifications.register();

        // Fallback: se o token já estava em cache no localStorage e o usuário acabou de se autenticar
        const cachedToken = localStorage.getItem('van360_fcm_token');
        const cachedPlatform = localStorage.getItem('van360_fcm_platform') || 'android';
        if (session?.user?.id && cachedToken && isMounted) {
          console.log('[Push] Enviando token em cache para o backend:', cachedToken);
          await registerPushToken({
            token: cachedToken,
            platform: cachedPlatform
          }).catch(err => console.error('[Push] Erro ao enviar token em cache ao backend:', err));
        }
      } catch (err) {
        console.error('[Push] Falha na inicialização do Push:', err);
      }
    };

    initAndRegisterPush();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);
};
