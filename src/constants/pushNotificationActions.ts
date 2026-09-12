import { PushNotificationAction } from '@/types/enums';
import {
  Home,
  CreditCard,
  FileSignature,
  MapPin,
  Users,
  DollarSign,
  GraduationCap,
  School,
  Truck,
  Receipt,
  BarChart3,
  Settings,
  Cake,
  UserPlus,
  Compass,
  type LucideIcon,
} from 'lucide-react';

export interface PushNotificationActionOption {
  value: PushNotificationAction;
  label: string;
  route: string;
  icon: LucideIcon;
}

export const PUSH_NOTIFICATION_ACTION_OPTIONS: PushNotificationActionOption[] = [
  {
    value: PushNotificationAction.OPEN_HOME,
    label: 'Início do Aplicativo',
    route: '/inicio',
    icon: Home,
  },
  {
    value: PushNotificationAction.OPEN_ROUTE,
    label: 'Rotas e Itinerário',
    route: '/rotas',
    icon: MapPin,
  },
  {
    value: PushNotificationAction.OPEN_BILLING,
    label: 'Cobranças e Parcelas',
    route: '/parcelas?tab=areceber',
    icon: DollarSign,
  },
  {
    value: PushNotificationAction.OPEN_PASSENGER_REQUESTS,
    label: 'Cadastros Enviados pelos Pais',
    route: '/alunos?tab=solicitacoes',
    icon: UserPlus,
  },
  {
    value: PushNotificationAction.OPEN_PASSENGERS,
    label: 'Carteirinhas dos Alunos',
    route: '/alunos',
    icon: GraduationCap,
  },
  {
    value: PushNotificationAction.OPEN_CONTRACTS,
    label: 'Contratos Digitais',
    route: '/contratos',
    icon: FileSignature,
  },
  {
    value: PushNotificationAction.OPEN_EXPENSES,
    label: 'Gastos da Van',
    route: '/gastos',
    icon: Receipt,
  },
  {
    value: PushNotificationAction.OPEN_REPORTS,
    label: 'Relatórios da Operação',
    route: '/relatorios',
    icon: BarChart3,
  },
  {
    value: PushNotificationAction.OPEN_TRACKING,
    label: 'Localização da Van ao Vivo',
    route: '/rotas (mapa)',
    icon: Compass,
  },
  {
    value: PushNotificationAction.OPEN_SUBSCRIPTION,
    label: 'Meu Plano / Assinatura',
    route: '/assinatura',
    icon: CreditCard,
  },
  {
    value: PushNotificationAction.OPEN_SCHOOLS,
    label: 'Minhas Escolas',
    route: '/escolas',
    icon: School,
  },
  {
    value: PushNotificationAction.OPEN_VEHICLES,
    label: 'Minhas Vans / Veículos',
    route: '/veiculos',
    icon: Truck,
  },
  {
    value: PushNotificationAction.OPEN_TEAM,
    label: 'Monitores e Auxiliares',
    route: '/equipe',
    icon: Users,
  },
  {
    value: PushNotificationAction.OPEN_BIRTHDAYS,
    label: 'Aniversariantes do Mês',
    route: '/aniversariantes',
    icon: Cake,
  },
  {
    value: PushNotificationAction.OPEN_SETTINGS,
    label: 'Configurações e Chave Pix',
    route: '/conta',
    icon: Settings,
  },
];
