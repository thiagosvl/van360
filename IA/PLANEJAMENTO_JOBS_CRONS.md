# Planejamento de Automação e Jobs (Crons) 🤖

Este documento centraliza todas as rotinas automáticas (Jobs) necessárias para o funcionamento do Van360.
Objetivo: Mapear gatilhos, frequências e regras antes da implementação técnica.

---

## 📅 1. Ciclo Financeiro (Mensalidades Escolares)

### 1.1 Job: Geração de Mensalidades (`generate-monthly-charges`)
*   **Frequência:** Mensal (Sugestão: Dia 25 do mês anterior) (data configurada no banco de dados).
*   **Ação:** Varre todos os passageiros ativos e gera os registros na tabela `cobrancas` para o mês seguinte.
*   **Detalhes:**
    *   Já gera o PIX (CobV) imediatamente.
    *   Não envia notificação ainda.
    *   Valor da cobrança será o que está no registro DB do passageiro, assim como o vencimento.

### 1.2 Job: Lembrete de Vencimento (`notify-due-soon`)
*   **Frequência:** Diária (Sugestão: 08:00 AM).
*   **Ação:** Busca cobranças em aberto que vencem em **X dias** (Configurável, iremos implementar na tabela de configuração do sistema).
*   **Regra:**
    *   `DataHoje >= (Vencimento - DiasAntecedencia)`
    *   E `data_envio_notificacao IS NULL` (para não repetir).
    * Haverão outras regras, como exigir que o motorista esteja no plano profissional, plano ativo etc.Discutiremos melhor.
*   **Canal:** WhatsApp ().

### 1.3 Job: Cobrança de Atraso (`notify-overdue`)
*   **Frequência:** Diária (Sugestão: 09:00 AM).
*   **Ação:** Busca cobranças vencidas há **Y dias** (Configurável, iremos implementar na tabela de configuração do sistema). e ainda não pagas.
*   **Regra:** Envia mensagem de cobrança amigável ou incisiva dependendo dos dias de atraso.
    * Haverão outras regras, como exigir que o motorista esteja no plano profissional, plano ativo etc. Discutiremos melhor.
    * Tambem deverá verificar o maximo de dias que será enviada notificação de cobrança atrasa. Por ex, se for configurado com 3 dias, então não deve enviar por mais do que 3 dias após vencimento, mesmo que continuea atrasada.

---

## 💳 2. Assinaturas (SaaS Motoristas)

<!-- ### 2.1 Job: Renovação de Planos (`renew-subscriptions`)
*   **Frequência:** Diária.
*   **Ação:** Identifica assinaturas de motoristas vencendo hoje.
*   **Processo:**
    *   Gera nova cobrança de renovação.
    *   Tenta cobrança automática (se cartão) ou gera PIX e envia por email. -->

<!-- ### 2.2 Job: Bloqueio por Falta de Pagamento (`block-unpaid-drivers`)
*   **Frequência:** Diária.
*   **Ação:** Se assinatura do motorista está vencida há Z dias, bloqueia acesso ao painel admin. -->

---

## ⚙️ 3. Manutenção e Auditoria

<!-- ### 3.1 Job: Reconciliação PIX (`reconcile-pix-status`)
*   **Frequência:** Hora em hora (ou a cada 4h).
*   **Objetivo:** "Rede de Segurança" para falhas de Webhook.
*   **Ação:**
    *   Busca cobranças `PENDENTES` mas cujo PIX expirou ou deveria ter sido pago.
    *   Consulta API do Inter (`consultarCobranca`) para ver se foi paga e o webhook falhou.
    *   Se paga, atualiza status e dispara repasse. -->

<!-- ### 3.2 Job: Limpeza de Logs/Temporários (`cleanup-logs`)
*   **Frequência:** Semanal.
*   **Ação:** Remove logs de auditoria muito antigos ou arquivos temporários para salvar espaço. -->

---

## 📝 Espaço para Complementos do Usuário

Use esta seção para adicionar novos jobs ou alterar as regras acima.

*   [ ] Job: ...
*   [ ] Regra Especial: ...



