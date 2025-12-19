# Regras Financeiras e de Pagamentos (PIX)

Este documento centraliza as regras técnicas e de negócio referentes ao processamento de pagamentos via PIX, definindo as estratégias para diferentes tipos de cobrança, tratamento de webhooks e estornos.

## 1. Estratégia Híbrida de Cobrança

O sistema utiliza estrategicamente dois endpoints da API PIX do Banco Inter para atender a diferentes casos de uso, resolvendo limitações de validade de QR Codes.

### 1.1. Cobrança Imediata (`cob`)
**Endpoint Inter:** `PUT /pix/v2/cob/:txid`

*   **Definição:** Gera um QR Code dinâmico com tempo de vida curto.
*   **Cenário de Uso:**
    *   **Upgrades de Plano:** O usuário está logado e navegando na tela de planos. A intenção de compra é imediata.
    *   **Contratação Inicial (Churn Zero):** Durante o onboarding, para ativação imediata.
    *   **Compra de Créditos Avulsos:** Transações pontuais.
*   **Regras de Vencimento:**
    *   **Expiração (TTL):** Definido fixo em **3600 segundos (1 hora)**.
    *   **Comportamento:** O QR Code expira e não pode ser pago após esse perido.
*   **Estratégia de Regeneração (Frontend/Backend):**
    *   O sistema NÃO deve tentar "renovar" o mesmo TXID.
    *   Se o usuário retornar à tela após 1h, o backend detecta a expiração (`created_at > 1h`) e gera transparentemente uma **NOVA cobrança** (novo `txid`) ao clicar em "Pagar".
    *   O usuário vê um novo QR Code válido.

### 1.2. Cobrança com Vencimento (`cobv`)
**Endpoint Inter:** `PUT /pix/v2/cobv/:txid`

*   **Definição:** Gera um QR Code associado a um boleto híbrido/cobrança com data de vencimento explícita, que pode ser pago mesmo dias após a geração.
*   **Cenário de Uso:**
    *   **Renovação Automática (Billing Recorrente):** Assinaturas mensais geradas X dias antes do vencimento.
    *   **Mensalidades Escolares (Pais):** Cobranças enviadas pelo motorista aos pais, que precisam de prazo para pagamento.
*   **Regras de Vencimento:**
    *   **`dataDeVencimento`:** Data calendário YYYY-MM-DD.
    *   **`validadeAposVencimento`:** Período de tolerância (ex: 30 dias) onde o pagamento ainda é aceito (com cálculo automático de multa/juros se configurado no Inter).
*   **Estratégia de Regeneração:**
    *   O QR Code é **estático/durável**. O mesmo link/imagem gerado no dia 15 é válido até o dia 20 (vencimento) + tolerância.
    *   Não há necessidade de regeneração por tempo de tela.

## 2. Matriz de Decisão por Tipo de Billing

O campo `billing_type` na tabela `assinaturas_cobrancas` determina a estratégia técnica adotada:

| Billing Type | Caso de Uso | Estratégia Técnica | Vencimento | Expiração Ténica |
| :--- | :--- | :--- | :--- | :--- |
| `upgrade` | Mudança de plano, contratação | Imediata (`cob`) | D+0 (1h) | 1 Hora |
| `subscription` | Renovação mensal automática | Com Vencimento (`cobv`) | `vigencia_fim` do ciclo atual ou `data_vencimento` configurada | Data Venc. + Validade |
| `school_fee` | Cobrança pai -> motorista | Com Vencimento (`cobv`) | Definida pelo motorista | Definida pelo motorista |
| `credits` | Compra de créditos SMS/Zap | Imediata (`cob`) | D+0 (1h) | 1 Hora |

## 3. Webhooks e Conciliação

O sistema depende de webhooks para confirmar pagamentos e ativar serviços.

### 3.1. Processamento de `pix.recebido`
Ao receber um callback do Inter:
1.  **Idempotência:** O `endToEndId` do PIX é a chave única. Pagamentos duplicados para o mesmo TXID (raro, mas possível em falhas sistêmicas bancárias) devem ser logados e tratados manualmente.
2.  **Mapping:** O `txid` do Inter é mapeado para o `inter_txid` na tabela `assinaturas_cobrancas`.
3.  **Ativação:**
    *   Confirma o valor pago (`valor` recebido == `valor` esperado).
    *   Altera status da cobrança para `pago`.
    *   Dispara lógica de negócio (ativar assinatura, liberar créditos).

### 3.2. Falha de Webhook (Boleto/Pix não compensado)
*   Se o webhook falhar, o sistema mantém a cobrança como `pendente_pagamento`.
*   **Ação Manual:** O admin pode consultar o status via API ("Consultar Pix") para forçar a conciliação.
*   **Polling:** (Futuro) Job cron para varrer cobranças pendentes próximas do vencimento e consultar status final no Inter.

## 4. Estorno e Reembolso (Refunds)

Atualmente, o processo de estorno é **Manual Controlado**.

*   **Cenário:** Usuário pagou duplicado (upgrade + renovação concorrentes) ou desistiu dentro de 7 dias.
*   **Procedimento:**
    1.  Atendimento solicita estorno no Portal Inter Empresas.
    2.  Admin ajusta manualmente o status no banco de dados se necessário (ou cancela os créditos concedidos).
*   **Regra de Ouro:** O sistema **nunca** faz estornos automáticos via API para evitar fraudes ou loops financeiros. Todo estorno financeiro exige aprovação humana.

## 5. Falhas e Indisponibilidade (Inter Offline)

Se a API do Inter estiver fora do ar (`5XX` ou `timeout`) durante a geração do PIX:
1.  **Frontend:** Exibe mensagem de "Sistema Bancário Indisponível, tente em instantes".
2.  **Backend:** Não cria registros "fantasmas" no Inter.
3.  **Retentativa:** O usuário pode clicar em "Pagar" novamente. Se for `upgrade` (sem `cobv` gerado), uma nova tentativa completa é feita. Se for `subscription` (onde o `cobv` já deveria existir), a consulta de status falhará, impedindo a visualização até que o serviço retorne.

## 6. Fluxo de Vida do PIX (Detalhado)

1.  **Geração:** O Backend gera um `txid` alfanumérico único.
2.  **Persistência Prévia:** A cobrança é criada no banco `pendente_pagamento` *antes* de chamar o banco.
3.  **Chamada Bancária:**
    *   Sucesso -> Salva `qr_code_payload` e `location`.
    *   Falha -> Retorna erro ao front, cobrança permanece sem QR Code.
4.  **Apresentação:** Frontend renderiza o QR Code (Copia e Cola + Imagem).
5.  **Exibição Tardia (Cache):**
    *   Ao reabrir o modal, o backend verifica:
        *   Já tem QR Code?
        *   É `upgrade`? Passou de 1h? -> **Regenera** (Novo TXID, Novo Request Inter).
        *   É `subscription`? -> **Mantém** (Mesmo TXID).
