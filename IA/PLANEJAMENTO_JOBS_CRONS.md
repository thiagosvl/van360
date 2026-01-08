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

### 2.1 Job: Renovação de Assinatura (`subscription-generator`)
*   **Status:** ✅ **Implementado (Ajustado)**
*   **Frequência:** Diária (11:00 UTC).
*   **Ação:** Verifica quem vai vencer daqui a `DIAS_ANTECEDENCIA_RENOVACAO` (Padrão: 5 dias).
*   **Processo:**
    *   Gera nova cobrança (`billing_type: renewal`).
    *   Gera PIX imediatamente.
    *   **Resposta (2/5):** Sim, geramos antecipadamente e enviamos o PIX.
    *   **Resposta (4):** A notificação de envio do PIX é feita pelo Monitor abaixo.

### 2.2 Job: Monitor de Motoristas (`driver-monitor`)
*   **Status:** ✅ **Implementado**
*   **Frequência:** Diária (09:00 UTC).
*   **Ação:** Gerencia acesso e notificações do motorista.
*   **Regras Cobertas:**
    *   **Vence em Breve:** Avisa que a fatura foi gerada (manda PIX).
    *   **Vence Hoje:** Avisa urgência.
    *   **Venceu (Atraso):** Avisa bloqueio.
    *   **Bloqueio:** Se passou do vencimento, altera status da assinatura para `SUSPENSA` e bloqueia acesso.
*   **Resposta (4):** Sim, deixamos claro o bloqueio.
*   **Resposta (6):** **Gap:** Não enviamos recibo de pagamento confirmado para o motorista.

### 2.3 Cadastro e Upgrades
*   **Cadastro:** 
    *   **Resposta (5):** Sim, ao escolher plano Profissional, o PIX é gerado e exibido na tela (QR Code). Se fechar a tela, o `driver-monitor` enviará no dia seguinte se ainda estiver pendente (mas ideal envio imediato via Zap - **Gap**).
    *   **Plano Essencial (Trial):** **Gap (9):** Precisamos da lógica para cobrar o Trial no 7º dia. Hoje ele cria a assinatura, mas o fluxo de "Cobrar Trial" precisa ser validado se o `subscription-generator` pega isso corretamente (pois vigência é curta). 
*   **Upgrade:**
    *   **Resposta (7):** Sim, upgrade gera PIX Pro-Rata na hora e exibe na tela.

---

## ⚙️ 3. Auditorias e Segurança

### 3.1 Job: Reconciliação PIX
*   **Status:** ❌ **Não Implementado (Gap 8)**
*   **Necessidade:** Se o webhook falhar, o cliente paga e o sistema não libera.
*   **Ação Necessária:** Criar job que varre cobranças `pendente` vencidas ou próximas e consulta API Inter para ver status real.

### 3.2 Job: Monitor de Conexão WhatsApp
*   **Status:** ❌ **Não Implementado (Gap 10)**
*   **Necessidade:** Garantir que o motorista (e admin) saibam se o Zap desconectou.
*   **Ação Necessária:** Job que consulta status da instância na Evolution API e notifica (por email ou aviso no painel) se estiver `disconnected`.

---

## 🚨 Resumo de Gaps e Falhas (To-Do List)

Aqui está o que **FALTA** para fechar 100% de acordo com suas perguntas:

1.  **Recibos:** (Pais e Motoristas)
    *   [x] Implementar envio de mensagem "Pagamento Confirmado" pós-webhook. (Implementado via `DRIVER_EVENT_PAYMENT_CONFIRMED` e `PASSENGER_EVENT_PAYMENT_RECEIVED`)
    *   [ ] Gerar PDF/Imagem do recibo (Futuro).
2.  **Trial Conversion:**
    *   [x] Validar se o `subscription-generator` vai gerar o boleto do Plano Essencial (Já é gerado na criação).
    *   [x] Implementar mensagem específica "Fim de Trial" para não pegar de surpresa. (Implementado via `DRIVER_EVENT_TRIAL_ENDING`)
3.  **Envio Imediato Cadastro:**
    *   [x] Ao cadastrar, além de mostrar na tela, já disparar o Zap com o PIX (garantia de entrega). (Implementado em `upgradePlano`)
4.  **Reconciliação PIX (Pagamentos Recebidos e Enviados):**
    *   [x] Monitoramento de Repasses Enviados (Segurança para garantir que o motorista recebeu). (Implementado via `repasse-monitor`)
    *   [x] Retry de Repasses Acumulados (Fila para pagar motoristas que corrigiram a chave). (Implementado via `repasse-retry`)
    *   [ ] Reconciliação de Entrada (Prioridade Baixa - Inter Webhook é confiável).
5.  **Monitor de Instância WhatsApp:**
    *   [ ] Criar Job de verificação de saúde da conexão.
6.  **Validação Chave PIX (Recebimento):**
    *   [x] Envio de 1 centavo para validar chave.
    *   [x] Job de monitoramento de status da validação. (Implementado: `pix-validation-monitor`)

---

## � Arquitetura de Pastas (Referência)
*   **Jobs:** `src/services/jobs/*.job.ts`
*   **Rotas:** `src/api/jobs.route.ts` (Protegidas por Cron Secret)
*   **Templates:** `src/services/notifications/templates/*.ts`
*   **Config:** `src/config/constants.ts` (Chaves e Flags)
