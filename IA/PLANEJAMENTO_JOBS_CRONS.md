# Planejamento de Automação e Jobs (Crons) - Status Atual 🤖

Este documento detalha o estado atual da automação do Van360, cruzando com as necessidades de negócio.

---

## 📅 1. Ciclo de Passageiros (Mensalidades Escolares)

### 1.1 Job: Geração de Mensalidades (`generate-monthly-charges`)
*   **Status:** ✅ **Implementado**
*   **Frequência:** Diária (Roda às 11:00 UTC), mas gatilho lógico apenas no **Dia 25**.
*   **Ação:** Varre todos os passageiros ativos e gera os registros na tabela `cobrancas` para o mês seguinte.
*   **Detalhes:**
    *   Já gera o PIX (CobV) imediatamente.
    *   Não envia notificação neste momento (apenas gera).
    *   **Resposta (2):** Sim, geramos antecipadamente no dia 25.

### 1.2 Job: Monitor de Cobranças (`passenger-monitor`)
*   **Status:** ✅ **Implementado**
*   **Frequência:** Diária (12:00 UTC).
*   **Ação:** Gerencia todo o ciclo de comunicação com o Pai/Responsável.
*   **Regras Cobertas:**
    *   **Antecedência:** Envia mensagem X dias antes (Configurável: `DIAS_ANTECEDENCIA_AVISO_VENCIMENTO`).
    *   **Hoje:** Envia mensagem "Vence Hoje".
    *   **Atraso:** Envia mensagem de cobrança nos dias +1, +3 e +5 pós-vencimento.
*   **Resposta (3):** Sim, já enviamos antecedência, dia e atraso.
*   **Resposta (1):** Enviamos mensagem de texto com código copia-e-cola. Recibo (imagem/PDF) ainda **não** é enviado (Gap de Recibo).
*   **Recibos:** Ao pagar, o sistema recebe o Webhook e marca como pago. **Gap (6/10):** Não enviamos mensagem de "Pagamento Confirmado" nem recibo automático para o Pai ainda.

---

## 💳 2. Assinaturas (SaaS Motoristas)

### 2.1 Job: Renovação de Assinatura (`charge-generator`)
*   **Status:** ✅ **Implementado e Blindado 🛡️**
*   **Frequência:** Diária (Roda após 00:00, gatilho dia 25).
*   **Ação:** Gera mensalidade do mês seguinte.
*   **Melhorias Recentes:**
    *   **Blindagem:** Ignora usuários com `cancelamento_manual` agendado. (Evita gerar cobrança para quem está de saída).
    *   **Gera PIX:** Imediatamente na criação.
    *   **Notificação:** Apenas cria. O monitor envia.

### 2.2 Job: Monitor de Motoristas (`monitoring-subscriptions`)
*   **Status:** ✅ **Implementado e Variado 🧟**
*   **Frequência:** Diária (08:00 UTC).
*   **Ação:** Gerencia ciclo de vida, notificações e *limpeza*.
*   **Novas Funcionalidades (Ciclo Completo):**
    *   **Sweeper (O Faxineiro):** Encerra assinaturas Zumbis (Cancelamento agendado vencido). Define `Status: CANCELADA`.
    *   **Notificações:** Vence em Breve, Hoje, Atraso.
    *   **Bloqueio:** Suspende inadimplentes após X dias.
*   **Resposta (6):** **Gap:** Recibo PDF ainda pendente. Mensagem de confirmação já existe via webhook.

### 2.3 Cadastro e Upgrades
*   **Cadastro:** 
    *   **Resposta (5):** Sim, ao escolher plano Profissional, o PIX é gerado e exibido na tela (QR Code). Se fechar a tela, o `driver-monitor` enviará no dia seguinte se ainda estiver pendente (mas ideal envio imediato via Zap - **Gap**).
    *   **Plano Essencial (Trial):** **Gap (9):** Precisamos da lógica para cobrar o Trial no 7º dia. Hoje ele cria a assinatura, mas o fluxo de "Cobrar Trial" precisa ser validado se o `subscription-generator` pega isso corretamente (pois vigência é curta). 
*   **Upgrade:**
    *   **Resposta (7):** Sim, upgrade gera PIX Pro-Rata na hora e exibe na tela.

---

## ⚙️ 3. Auditorias e Segurança

### 3.1 Job: Reconciliação PIX (Entrada)
*   **Status:** ✅ **Implementado (`reconciliacao-entrada.job.ts`)**
*   **Frequência:** Diária (ou Cron Específico).
*   **Ação:** Consulta últimos 2 dias na API Inter e processa pagamentos via Webhook Handler (Idempotente).
*   **Segurança:** Garante que se o webhook falhou, o sistema recupera o pagamento.

### 3.2 Job: Monitor de Conexão WhatsApp
*   **Status:** ❌ **Não Implementado (Gap 10)**
*   **Necessidade:** Garantir que o motorista (e admin) saibam se o Zap desconectou.
*   **Ação Necessária:** Job que consulta status da instância na Evolution API e notifica (por email ou aviso no painel) se estiver `disconnected`.

### 3.3 Integridade de Cancelamento (Eventos)
*   **Status:** ✅ **Implementado (Ghost Killer + Ressurreição)**
*   **Trigger (Não é Job):** Ação do Usuário no Frontend.
*   **Ao Cancelar:** Mata cobranças futuras e invalida PIX no Inter. (Ghost Killer).
*   **Ao Desistir:** Se for tarde (pós-dia 25), regenera a cobrança morta. (Ressurreição).

---

## 🚨 Resumo de Gaps e Pendências (Status Final)

Baseado nas últimas implementações e feedback:

1.  **Robustez de Cancelamento (Prioridade Alta):**
    *   [x] **Preventivo:** Bloquear geração de cobrança para quem agendou saída. (Feito)
    *   [x] **Ghost Killer:** Matar cobranças futuras ao cancelar. (Feito)
    *   [x] **Sweeper:** Encerrar assinatura zumbi pós-vigência. (Feito)
    *   [x] **Ressurreição:** Regenerar cobrança se desistir do cancelamento. (Feito)
    *   [ ] **Testes:** Criar scripts de simulação para validar tudo isso. (Futuro)

2.  **Recibos:**
    *   [x] Imagem/Texto no WhatsApp. (Ok)
    *   [ ] PDF por e-mail. (Futuro - Backlog)

3.  **Trial Conversion:**
    *   [x] Lógica de geração de cobrança inicial (Fim do Trial) existe. (Validado via análise de código).
    *   [ ] Teste prático de conversão. (Futuro)

4.  **Monitoramento Técnico:**
    *   [ ] Saúde do WhatsApp. (Futuro - Backlog)
    *   [x] Reconciliação PIX Entrada. (Feito - `reconciliacao-entrada.job.ts`)

---

##  Arquitetura de Pastas (Referência)
*   **Jobs:** `src/services/jobs/*.job.ts`
*   **Rotas:** `src/api/jobs.route.ts` (Protegidas por Cron Secret)
*   **Templates:** `src/services/notifications/templates/*.ts`
*   **Config:** `src/config/constants.ts` (Chaves e Flags)
