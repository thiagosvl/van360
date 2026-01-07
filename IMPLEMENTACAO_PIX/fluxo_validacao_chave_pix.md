# Fluxo de Validação de Chave PIX (Van360): Micro-Pagamento

Este documento detalha o fluxo técnico para validar a chave PIX do motorista utilizando um micro-pagamento de R$ 0,01 via API do Banco Inter. Este método garante a existência e titularidade da chave, protegendo o sistema contra erros de digitação e fraudes.

## 1. Visão Geral do Fluxo

O motorista informa sua chave PIX. O sistema envia R$ 0,01 para essa chave. Ao receber a confirmação do pagamento e os dados do recebedor via webhook do Inter, o sistema compara esses dados com o cadastro do motorista. Se houver correspondência, a chave é validada.

## 2. Passo a Passo Técnico Detalhado

### A. Frontend (UI - Tela de Cadastro/Edição de Chave PIX)

1.  **Input da Chave:** Motorista insere sua chave PIX (CPF, CNPJ, E-mail, Telefone, Aleatória).
2.  **Mensagem:** Exibir uma mensagem clara:
    > "Para validar sua chave PIX, enviaremos R$ 0,01 para esta conta. Ao confirmar, o nome do titular será exibido para sua conferência. Este valor será seu e não será cobrado."
3.  **Botão de Confirmação:** "Validar Chave PIX".

### B. Backend (API - `usuarios.service.ts` ou similar)

#### 1. Endpoint de Cadastro/Atualização de Chave PIX

*   **Recebe:** `chave_pix` (do motorista) e `usuario_id`.
*   **Validação Inicial:** Verificar formato da chave (regex para CPF, CNPJ, e-mail, telefone).
*   **Status Inicial:** Salvar a `chave_pix` na tabela `usuarios` com `status_chave_pix = 'PENDENTE_VALIDACAO'`.
*   **Chamada à API do Inter (Micro-Pagamento):**
    *   **Endpoint:** `POST /pix` (API Banking - Incluir Pagamento Pix).
    *   **Payload:**
        *   `valor`: `0.01`
        *   `destinatario.tipo`: Determinar se é `CHAVE_PIX` ou `DADOS_BANCARIOS` (se a chave for aleatória, por exemplo, pode ser necessário usar dados bancários).
        *   `destinatario.chave`: A chave PIX informada pelo motorista.
        *   `descricao`: "Validacao Chave PIX Van360 - [usuario_id]"
        *   `x-id-idempotente`: Gerar um ID único para garantir que o pagamento não seja duplicado.
*   **Armazenamento Temporário:** Salvar o `x-id-idempotente` e o `usuario_id` em uma tabela temporária (`pix_validacao_pendente`) para correlacionar com o webhook.
*   **Resposta ao Frontend:** Informar que a validação está em andamento.

#### 2. Endpoint de Webhook do Banco Inter

*   **Recebe:** Notificação de pagamento efetuado (PIX de R$ 0,01).
*   **Processamento:**
    1.  **Extrair `x-id-idempotente`:** Identificar qual transação de validação foi concluída.
    2.  **Consultar `pix_validacao_pendente`:** Recuperar o `usuario_id` associado.
    3.  **Consultar Detalhes do Pagamento (API Inter):**
        *   **Endpoint:** `GET /pix/{e2eId}` (API Pix - Consultar pix).
        *   **Parâmetro:** `e2eId` (EndToEndId da transação recebida no webhook).
        *   **Retorno:** Contém os dados do recebedor (`infoPagador.nome`, `infoPagador.cpfCnpj`).
    4.  **Validação de Titularidade:**
        *   Comparar `infoPagador.nome` com `nome_motorista` da tabela `usuarios`.
        *   Comparar `infoPagador.cpfCnpj` com `cpf_motorista` da tabela `usuarios`.
        *   **Tolerância:** Implementar lógica de tolerância para nomes (ex: remover acentos, espaços, comparar apenas sobrenomes, ou usar um algoritmo de similaridade de strings).
    5.  **Atualização do Status da Chave:**
        *   **Sucesso:** Se os dados correspondem, atualizar `status_chave_pix = 'VALIDADA'` e `chave_pix_validada_em = NOW()` na tabela `usuarios`.
        *   **Falha:** Se não correspondem, atualizar `status_chave_pix = 'FALHA_VALIDACAO'` e notificar o motorista (via WhatsApp/App) para corrigir a chave.

### C. Banco de Dados (`usuarios`)

Adicionar os seguintes campos à tabela `usuarios`:

*   `chave_pix`: `TEXT` (chave PIX do motorista)
*   `status_chave_pix`: `VARCHAR(50)` (Ex: 'PENDENTE_VALIDACAO', 'VALIDADA', 'FALHA_VALIDACAO', 'NAO_CADASTRADA')
*   `chave_pix_validada_em`: `TIMESTAMP` (data e hora da validação)
*   `nome_titular_pix_validado`: `TEXT` (Nome do titular retornado pelo Inter na validação)
*   `cpf_cnpj_titular_pix_validado`: `TEXT` (CPF/CNPJ do titular retornado pelo Inter na validação)

### D. Banco de Dados (Tabela Temporária `pix_validacao_pendente`)

*   `id`: `UUID` (PK)
*   `usuario_id`: `UUID` (FK para `usuarios`)
*   `x_id_idempotente`: `TEXT` (ID da transação de micro-pagamento)
*   `chave_pix_enviada`: `TEXT` (chave que foi enviada para validação)
*   `created_at`: `TIMESTAMP`

## 3. Tratamento de Erros e Segurança

*   **Falha no Micro-Pagamento:** Se o PIX de R$ 0,01 falhar (chave inválida, conta inexistente), o webhook do Inter não será disparado. O sistema deve ter um mecanismo de *timeout* para chaves `PENDENTE_VALIDACAO` e notificar o motorista para tentar novamente.
*   **Divergência de Dados:** Se o nome/CPF não bater, a chave não é validada. O motorista deve ser instruído a corrigir ou entrar em contato com o suporte.
*   **Idempotência:** O `x-id-idempotente` é crucial para evitar pagamentos duplicados de R$ 0,01.
*   **Segurança do Webhook:** Validar a assinatura do webhook do Inter para garantir que a notificação é legítima.

Este fluxo, embora um pouco mais complexo, garante a segurança e a confiabilidade do seu sistema de repasse PIX, eliminando o risco de enviar dinheiro para a chave errada. É um investimento essencial para a confiança do motorista e a saúde do seu negócio.
