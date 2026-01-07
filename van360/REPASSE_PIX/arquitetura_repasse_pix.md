# Arquitetura de Automação de Cobrança e Repasse PIX (Van360)

Este documento detalha a arquitetura proposta para a funcionalidade central da Van360: a automação da cobrança dos pais e o repasse instantâneo via PIX para os motoristas. O objetivo é criar um fluxo robusto, seguro e escalável.

## 1. Visão Geral do Fluxo

O fluxo de automação de cobrança e repasse PIX pode ser dividido em três fases principais:

1.  **Geração e Envio da Cobrança:** O sistema gera uma cobrança para o pai e envia via WhatsApp (com QR Code e PIX Copia e Cola).
2.  **Recebimento e Notificação do Pagamento:** O pai paga o PIX, o Banco Inter notifica o sistema via Webhook.
3.  **Processamento e Repasse:** O sistema processa o webhook, dá baixa na cobrança e inicia o repasse PIX para o motorista.

## 2. Estrutura do Banco de Dados (Supabase)

Para suportar este fluxo, a tabela `cobrancas` (referente às cobranças dos pais) precisará de campos adicionais, e pode ser útil ter uma tabela de `transacoes_repasse` para auditoria.

### A. Tabela `cobrancas` (Atualização)

Esta tabela já existe e armazena as cobranças geradas para os pais. Precisará ser enriquecida com informações da transação PIX.

| Campo | Tipo | Descrição | Opcionalidade |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` (PK) | ID único da cobrança. |
| `passageiro_id` | `UUID` (FK) | Passageiro ao qual a cobrança se refere. |
| `escola_id` | `UUID` (FK) | Escola do passageiro. |
| `usuario_id` | `UUID` (FK) | Motorista responsável pela cobrança. |
| `mes` | `INT` | Mês de referência da cobrança. |
| `ano` | `INT` | Ano de referência da cobrança. |
| `valor` | `NUMERIC(10,2)` | Valor total da cobrança. |
| `status` | `VARCHAR(50)` | Status da cobrança: `PENDENTE`, `PAGA`, `ATRASADA`, `CANCELADA`, `REPASSADA`. |
| `data_vencimento` | `DATE` | Data de vencimento da cobrança. |
| `data_pagamento` | `TIMESTAMP` | Data e hora em que o pagamento foi recebido. | **OPCIONAL** |
| `txid_pix` | `TEXT` | ID da transação PIX gerado pelo Banco Inter. | **OPCIONAL** |
| `qr_code_payload` | `TEXT` | Payload do QR Code PIX (PIX Copia e Cola). | **OPCIONAL** |
| `url_qr_code` | `TEXT` | URL da imagem do QR Code. | **OPCIONAL** |
| `valor_pago` | `NUMERIC(10,2)` | Valor efetivamente pago pelo pai (pode ser diferente do `valor` original). | **OPCIONAL** |
| `taxa_intermediacao_banco` | `NUMERIC(10,2)` | Taxa cobrada pelo Banco Inter pela transação. | **OPCIONAL** |
| `valor_a_repassar` | `NUMERIC(10,2)` | Valor líquido a ser repassado ao motorista. | **OPCIONAL** |
| `status_repasse` | `VARCHAR(50)` | Status do repasse: `PENDENTE`, `PROCESSANDO`, `REPASSADO`, `FALHA_REPASSE`. | **OPCIONAL** |
| `data_repasse` | `TIMESTAMP` | Data e hora em que o repasse foi efetuado. | **OPCIONAL** |
| `id_transacao_repasse` | `UUID` (FK) | Referência à tabela `transacoes_repasse`. | **OPCIONAL** |

### B. Nova Tabela `transacoes_repasse` (Sugestão)

Esta tabela é opcional, mas altamente recomendada para fins de auditoria e rastreabilidade de cada repasse individual para o motorista.

| Campo | Tipo | Descrição | Opcionalidade |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` (PK) | ID único da transação de repasse. |
| `usuario_id` | `UUID` (FK) | Motorista que recebeu o repasse. |
| `cobranca_id` | `UUID` (FK) | Cobrança de origem do repasse. |
| `valor_repassado` | `NUMERIC(10,2)` | Valor efetivamente repassado ao motorista. |
| `txid_pix_repasse` | `TEXT` | ID da transação PIX do repasse (gerado pelo Inter). | **OPCIONAL** |
| `status` | `VARCHAR(50)` | Status do repasse: `PROCESSANDO`, `SUCESSO`, `FALHA`. |
| `data_criacao` | `TIMESTAMP` | Data e hora da criação do registro de repasse. |
| `data_conclusao` | `TIMESTAMP` | Data e hora da conclusão (sucesso/falha) do repasse. | **OPCIONAL** |
| `mensagem_erro` | `TEXT` | Mensagem de erro em caso de falha no repasse. | **OPCIONAL** |

## 3. Lógica de Backend (Node.js/TypeScript)

### A. Geração da Cobrança (API de Cobrança)

*   **Endpoint:** `POST /cobrancas`
*   **Fluxo:**
    1.  Receber dados da cobrança (passageiro, valor, vencimento, etc.).
    2.  Chamar API do Inter para gerar PIX (com `txid_pix`, `qr_code_payload`, `url_qr_code`).
    3.  Salvar a cobrança na tabela `cobrancas` com `status = PENDENTE` e os dados do PIX.
    4.  Enviar notificação de cobrança para o pai via WhatsApp (com QR Code e PIX Copia e Cola).

### B. Webhook de Pagamento do Banco Inter

Este é o coração do sistema de repasse. O Banco Inter notificará este endpoint quando um PIX for pago.

*   **Endpoint:** `POST /webhook/inter/pix-recebido`
*   **Fluxo:**
    1.  **Validação:** Validar a assinatura do webhook do Inter para garantir a autenticidade.
    2.  **Extração:** Extrair o `txid_pix` do payload do webhook.
    3.  **Consulta:** Buscar a cobrança correspondente na tabela `cobrancas` usando o `txid_pix`.
    4.  **Atualização da Cobrança:**
        *   Atualizar `status = PAGA`, `data_pagamento = NOW()`, `valor_pago`.
        *   Calcular `taxa_intermediacao_banco` (se aplicável) e `valor_a_repassar`.
    5.  **Início do Repasse:** Chamar uma nova função `iniciarRepassePix(cobrancaId)`.

### C. Função `iniciarRepassePix(cobrancaId: UUID)`

Esta função orquestra o repasse para o motorista.

*   **Fluxo:**
    1.  **Busca de Dados:** Obter detalhes da cobrança (`cobrancaId`) e do motorista (`usuario_id`) associado, incluindo a `chave_pix` validada do motorista (da tabela `usuarios`).
    2.  **Verificação de Chave:** Confirmar que a `chave_pix` do motorista está `VALIDADA`.
        *   Se não estiver validada, registrar `status_repasse = FALHA_REPASSE` na `cobrancas` e notificar o motorista para validar a chave.
    3.  **Chamar API do Inter para Repasse (POST /pix):**
        *   **URL:** `https://cdpj.partners.bancointer.com.br/banking/v2/pix` (ou sandbox).
        *   **Headers:** `Authorization: Bearer <token_oauth>`, `x-id-idempotente: <uuid_gerado_para_repasse>`.
        *   **Body (JSON):**
            ```json
            {
              "valor": <valor_a_repassar>,
              "destinatario": {
                "chave": "<chave_pix_motorista>",
                "tipo": "CHAVE_PIX"
              },
              "descricao": "Repasse Cobranca Van360 - " + cobrancaId
            }
            ```
    4.  **Registro da Transação de Repasse:**
        *   Se a tabela `transacoes_repasse` for usada, criar um novo registro com `status = PROCESSANDO`.
        *   Atualizar `status_repasse = PROCESSANDO` na tabela `cobrancas`.
    5.  **Tratamento de Resposta:**
        *   **Sucesso:** Atualizar `status_repasse = REPASSADO`, `data_repasse = NOW()` na `cobrancas` (e `status = SUCESSO` na `transacoes_repasse`). Notificar motorista.
        *   **Falha:** Atualizar `status_repasse = FALHA_REPASSE` na `cobrancas` (e `status = FALHA` na `transacoes_repasse` com `mensagem_erro`). Notificar motorista e equipe de suporte.

## 4. Tratamento de Erros e Notificações

*   **Webhooks:** Implementar retentativas para webhooks que falharem no processamento.
*   **Repasses Falhos:** Criar um painel de monitoramento para repasses com `status_repasse = FALHA_REPASSE` e um processo manual/automático de reconciliação.
*   **Notificações:** Enviar notificações claras para motoristas (repasse efetuado, repasse falho) e pais (confirmação de pagamento).
*   **Idempotência:** Garantir que todas as chamadas à API do Inter sejam idempotentes para evitar duplicação de pagamentos/repasses.

## 5. Refatoração Necessária

### A. Backend

*   **Módulos de Pagamento:** Criar um módulo/serviço dedicado para interagir com a API do Banco Inter (geração de PIX, consulta de PIX, repasse de PIX).
*   **Serviço de Cobranças:** Refatorar o serviço de cobranças para incluir a lógica de geração de PIX e o controle de status de repasse.
*   **Serviço de Webhooks:** Criar um serviço para processar os webhooks do Inter de forma genérica e rotear para as funções específicas (pagamento de mensalidade, pagamento de cobrança de pai).

### B. Frontend

*   **Tela de Cobranças:** Atualizar a tela de cobranças para pais, mostrando o status do pagamento e do repasse.
*   **Notificações:** Implementar a exibição de notificações de pagamento e repasse para o motorista no aplicativo.
*   **Relatórios:** Criar relatórios financeiros para o motorista, detalhando cobranças, taxas e repasses.

Esta arquitetura fornece um caminho claro para a implementação da funcionalidade de repasse PIX, garantindo que a Van360 entregue sua proposta de valor mais importante de forma eficiente e segura.
