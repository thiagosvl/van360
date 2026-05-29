# Backlog de Melhorias SaaS — Van360

Ideias mapeadas para implementação futura. Ordenadas por prioridade de impacto.

---

## 🔴 Alta Prioridade — Impacto Direto em Receita

### 1. Retry Automático de Cartão com Falha
**Problema:** Hoje, se a cobrança automática de renovação falha (cartão vencido, limite pontual), o sistema notifica o usuário e aguarda ação manual. Uma fração significativa desses churns é involuntária.

**Solução:** Implementar tentativas escalonadas antes de mover para EXPIRED:
- D+0: tentativa inicial
- D+1: segunda tentativa
- D+3: terceira tentativa
- D+7: última tentativa → se falhar, EXPIRED + notificação final

**Onde implementar:** `subscription-monitor.service.ts` → `generateRenewalInvoices` + nova função `retryFailedCardCharges`.

---

### 2. Fluxo de Cancelamento com Retenção
**Problema:** Não existe fluxo de cancelamento explícito. O usuário simplesmente deixa de pagar ou entra em contato.

**Solução:** Tela/dialog de cancelamento com oferta de retenção antes de confirmar:
- Opção de pausar assinatura por 1 mês
- Ou desconto na próxima renovação (cupom)
- Coleta o motivo do cancelamento (pesquisa rápida: preço / não usa / outro serviço / etc.)

**Onde implementar:** Frontend — dialog no `SubscriptionPage`. Backend — endpoint de cancelamento com lógica de retenção e coleta de motivo.

---

## 🟡 Média Prioridade — Valor Percebido

### 3. Recibo/Comprovante de Pagamento em PDF
**Problema:** Motoristas que precisam prestar contas (contabilidade, declaração IR) não têm comprovante formal.

**Solução:** Gerar PDF simples do comprovante ao confirmar pagamento e enviar via WhatsApp. Deve conter: nome, CPF, plano, valor, data, número da fatura.

**Onde implementar:** `activateByFatura` no `subscription.service.ts` — após ativar, gerar PDF e disparar via `notificationService`. Biblioteca sugerida: `pdfkit` ou `puppeteer` (template HTML).

---

### 4. NPS Pós-Ativação
**Problema:** Não coletamos feedback sistemático de satisfação.

**Solução:** Mensagem automática via WhatsApp em D+30 após ativação da assinatura:
> "De 0 a 10, o quanto você recomendaria o Van360 para outro motorista? Responda com o número."

Respostas capturadas via webhook do Evolution/WhatsApp e salvas em tabela `nps_respostas`.

**Onde implementar:** Novo evento no `subscription-monitor.service.ts` — verificar assinaturas ativas com D+30 desde `data_inicio` e sem NPS registrado.

---

### 5. Changelog / "Novidades" In-App
**Problema:** Usuários não percebem novas funcionalidades, o que reduz o valor percebido do produto ao longo do tempo.

**Solução:** Badge discreto no menu ou tela inicial quando há atualizações novas. Um painel simples de "O que há de novo" com entradas manuais gerenciadas via tabela no Supabase (`changelogs`).

**Onde implementar:** Frontend — componente `ChangelogBadge` + drawer/modal. Backend — tabela `changelogs` com campos `titulo`, `descricao`, `data`, `ativo`.

---

## 🟢 Avançado — Escala

### 6. Dashboard Interno de Métricas SaaS (MRR/ARR/Churn)
**Problema:** Não há visibilidade sobre saúde financeira do SaaS: MRR, ARR, churn rate, LTV por plano, taxa de conversão trial → pago.

**Solução:** Página interna (admin) com métricas calculadas em tempo real ou via job diário:
- MRR atual e evolução mensal
- Churn rate (cancelamentos / base ativa)
- Conversão trial → pago
- LTV médio por plano
- Receita projetada (12 meses)

**Onde implementar:** Nova rota admin no backend + página `AdminMetricasPage` no frontend (acesso restrito por role).

---

### 7. Detecção de Inatividade como Sinal de Churn
**Problema:** Usuário com assinatura ativa mas inativo há semanas está em risco silencioso de não renovar.

**Solução:** Job diário verifica assinantes ativos sem login há N dias (configurável via `ConfigKey`) e dispara mensagem proativa via WhatsApp com dica de uso ou "sentimos sua falta".

**Onde implementar:** `subscription-monitor.service.ts` + campo `last_login_at` na tabela `usuarios` (atualizado no login via `auth.service.ts`).

---

### 8. Upgrade/Downgrade de Plano com Proration
**Problema:** Hoje só existe o fluxo de nova assinatura. Se futuramente houver múltiplos tiers (ex: plano básico / avançado / ilimitado), não há lógica de troca de plano no meio do ciclo.

**Solução:** Fluxo de mudança de plano com cálculo proporcional:
- Upgrade: cobra a diferença proporcional ao tempo restante do ciclo atual
- Downgrade: credita a diferença ou aplica na próxima renovação

**Onde implementar:** Novo método `changePlan` no `subscription.service.ts` + dialog de upgrade no frontend.
