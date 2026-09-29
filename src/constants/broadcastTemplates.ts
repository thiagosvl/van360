import { PushNotificationAction } from '@/types/enums';

export type BroadcastCategory =
  | 'Novidades'
  | 'Rotas'
  | 'Contratos'
  | 'Financeiro'
  | 'Alunos'
  | 'Relatorios'
  | 'Sistema';

export interface BroadcastTemplate {
  id: string;
  name: string;
  category: BroadcastCategory;
  title: string;
  body: string;
  defaultAction: PushNotificationAction;
  suggestedStatuses: string[];
}

export const BROADCAST_CATEGORIES: Array<{ id: 'TODAS' | BroadcastCategory; label: string }> = [
  { id: 'TODAS', label: 'Todas as Categorias' },
  { id: 'Novidades', label: '✨ Novidades' },
  { id: 'Rotas', label: '📍 Rotas & Itinerário' },
  { id: 'Contratos', label: '✍️ Contratos' },
  { id: 'Financeiro', label: '💰 Cobranças & Gastos' },
  { id: 'Alunos', label: '📇 Alunos & Pais' },
  { id: 'Relatorios', label: '📈 Relatórios' },
  { id: 'Sistema', label: '⚙️ Sistema & Planos' },
];

export const BROADCAST_TEMPLATES: BroadcastTemplate[] = [
  // 1. Novidades da Plataforma (Geral)
  {
    id: 'novidade_geral',
    name: 'Novidade no Aplicativo (Geral)',
    category: 'Novidades',
    title: '✨ Tem novidade no seu aplicativo!',
    body: 'Acabamos de lançar melhorias para facilitar ainda mais o seu dia a dia na van. Abra o app para conferir!',
    defaultAction: PushNotificationAction.OPEN_HOME,
    suggestedStatuses: ['TODOS'],
  },

  // 2. Rotas, Itinerário e App dos Pais
  {
    id: 'rotas_itinerario_sem_papel',
    name: 'Chega de Rotas no Papel',
    category: 'Rotas',
    title: '📋 Chega de montar itinerário no papel!',
    body: 'Faça seu itinerário direto pelo aplicativo, marcando quem embarcou, quem desembarcou ou quem faltou com apenas um toque.',
    defaultAction: PushNotificationAction.OPEN_ROUTE,
    suggestedStatuses: ['ACTIVE', 'TRIAL'],
  },
  {
    id: 'rotas_aviso_ausencia_pais',
    name: 'Aviso de Ausência pelo App dos Pais',
    category: 'Rotas',
    title: '🚫 Menos mensagens no seu WhatsApp!',
    body: 'Os pais podem avisar a ausência dos filhos direto pelo aplicativo, até com dias de antecedência. Você já sai sabendo quem vai faltar!',
    defaultAction: PushNotificationAction.OPEN_ROUTE,
    suggestedStatuses: ['ACTIVE', 'TRIAL'],
  },
  {
    id: 'rotas_mapa_ao_vivo_pais',
    name: 'Localização da Van no Mapa para os Pais',
    category: 'Rotas',
    title: '📍 Menos ligações de pais perguntando da van',
    body: 'No aplicativo dos pais, eles acompanham a van em tempo real no mapa e sabem a hora exata em que o filho vai chegar.',
    defaultAction: PushNotificationAction.OPEN_ROUTE,
    suggestedStatuses: ['ACTIVE', 'TRIAL'],
  },

  // 3. Contratos Digitais
  {
    id: 'contratos_envio_whatsapp_pais',
    name: 'Contratos Enviados no WhatsApp dos Pais',
    category: 'Contratos',
    title: '✍️ Envie contratos direto no WhatsApp dos pais',
    body: 'Gere contratos para todos os alunos e a gente envia o link de assinatura automaticamente para os pais. Tudo assinado pelo celular em 1 minuto!',
    defaultAction: PushNotificationAction.OPEN_CONTRACTS,
    suggestedStatuses: ['ACTIVE', 'TRIAL'],
  },
  {
    id: 'contratos_sem_papelada',
    name: 'Formalize o Transporte sem Papelada',
    category: 'Contratos',
    title: '📄 Seus contratos organizados e sem papelada',
    body: 'Chega de imprimir folhas e correr atrás de assinaturas. Formalize o transporte dos seus alunos pelo celular com total validade jurídica.',
    defaultAction: PushNotificationAction.OPEN_CONTRACTS,
    suggestedStatuses: ['ACTIVE', 'TRIAL'],
  },

  // 4. Cobrança, Parcelas, Pix e Gastos
  {
    id: 'cobranca_lembrete_parcelas_pix',
    name: 'Lembretes das Parcelas com sua Chave Pix',
    category: 'Financeiro',
    title: '💰 Chega de cobrar pais no WhatsApp!',
    body: 'O Van360 avisa os pais antes do vencimento com a sua chave Pix cadastrada. Reduza atrasos sem o constrangimento de cobrar.',
    defaultAction: PushNotificationAction.OPEN_BILLING,
    suggestedStatuses: ['ACTIVE', 'TRIAL'],
  },
  {
    id: 'cobranca_recibos_app_pais',
    name: 'Recibos na Hora e no App dos Pais',
    category: 'Financeiro',
    title: '🧾 Recibos de pagamento gerados na hora!',
    body: 'Deu baixa na parcela? O recibo sai na hora! Você pode mandar no WhatsApp ou os pais acessam e baixam direto no aplicativo deles.',
    defaultAction: PushNotificationAction.OPEN_BILLING,
    suggestedStatuses: ['ACTIVE', 'TRIAL'],
  },
  {
    id: 'cobranca_controle_parcelas',
    name: 'Controle dos Pagamentos das Parcelas',
    category: 'Financeiro',
    title: '📊 Saiba quem já pagou e quem está em aberto',
    body: 'Acompanhe as parcelas do mês sem confusão de caderninho. Veja na hora o que já entrou na conta e o que falta receber.',
    defaultAction: PushNotificationAction.OPEN_BILLING,
    suggestedStatuses: ['ACTIVE', 'TRIAL'],
  },
  {
    id: 'gastos_combustivel_despesas',
    name: 'Controle de Gastos da sua Van',
    category: 'Financeiro',
    title: '⛽ Controle combustível, manutenção e despesas',
    body: 'Anote abastecimentos, revisões, pneus e gastos da van direto no aplicativo. Saiba exatamente o seu lucro real no final do mês!',
    defaultAction: PushNotificationAction.OPEN_EXPENSES,
    suggestedStatuses: ['ACTIVE', 'TRIAL'],
  },

  // 5. Alunos, Carteirinhas e Link de Cadastro
  {
    id: 'alunos_link_cadastro_pais',
    name: 'Cadastre Alunos Enviando o Link aos Pais',
    category: 'Alunos',
    title: '📲 Deixe os pais preencherem os dados por você',
    body: 'Cadastre todos os seus alunos sem perder tempo digitando: basta enviar o seu link exclusivo para os pais e eles preenchem tudo pelo celular!',
    defaultAction: PushNotificationAction.OPEN_PASSENGER_REQUESTS,
    suggestedStatuses: ['ACTIVE', 'TRIAL'],
  },
  {
    id: 'alunos_carteirinha_digital',
    name: 'Dados do Aluno na Carteirinha Digital',
    category: 'Alunos',
    title: '📇 Telefones e dados na carteirinha do aluno',
    body: 'Consulte telefones dos pais, escola, turma, endereço e avisos importantes com um toque na carteirinha do aluno, na palma da sua mão.',
    defaultAction: PushNotificationAction.OPEN_PASSENGERS,
    suggestedStatuses: ['ACTIVE', 'TRIAL'],
  },

  // 6. Relatórios
  {
    id: 'relatorios_resumo_operacao',
    name: 'Relatórios Claros da sua Van',
    category: 'Relatorios',
    title: '📈 Relatórios simples e fáceis de entender',
    body: 'Acompanhe o resumo financeiro, total recebido, pendências e dados da sua van em relatórios práticos, sem complicação.',
    defaultAction: PushNotificationAction.OPEN_REPORTS,
    suggestedStatuses: ['ACTIVE', 'TRIAL'],
  },

  // 7. Sistema & SaaS
  {
    id: 'app_update_restart',
    name: 'Atualização do Aplicativo (Reiniciar)',
    category: 'Sistema',
    title: '🚀 Nova versão disponível para você!',
    body: 'Acabamos de lançar melhorias importantes no Van360! Feche e abra o aplicativo de novo para carregar tudo atualizado.',
    defaultAction: PushNotificationAction.OPEN_HOME,
    suggestedStatuses: ['TODOS'],
  },
  {
    id: 'system_maintenance',
    name: 'Aviso de Manutenção Rápida',
    category: 'Sistema',
    title: '⚙️ Manutenção rápida hoje às 23h',
    body: 'Faremos uma melhoria rápida em nossos servidores hoje às 23h. O aplicativo voltará ao normal em poucos minutos.',
    defaultAction: PushNotificationAction.OPEN_HOME,
    suggestedStatuses: ['TODOS'],
  },
  {
    id: 'saas_renewal_reminder',
    name: 'Lembrete de Renovação do Acesso',
    category: 'Sistema',
    title: '💳 Mantenha o seu Van360 ativo',
    body: 'Sua assinatura Van360 está próxima do vencimento. Acesse a aba de planos e faça a renovação rápida via Pix para não parar seus recursos.',
    defaultAction: PushNotificationAction.OPEN_SUBSCRIPTION,
    suggestedStatuses: ['PAST_DUE'],
  },
  {
    id: 'trial_expiring_soon',
    name: 'Fim do Teste Grátis',
    category: 'Sistema',
    title: '⏳ Seu período de teste está acabando',
    body: 'Aproveite para escolher o seu plano com condições especiais e continue gerenciando suas vans e cobranças sem interrupções.',
    defaultAction: PushNotificationAction.OPEN_SUBSCRIPTION,
    suggestedStatuses: ['TRIAL'],
  },
];
