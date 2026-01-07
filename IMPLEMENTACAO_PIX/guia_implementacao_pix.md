# Guia de Implementação: Validação de Chave PIX (Backend Van360)

Este guia detalha os passos para implementar o fluxo de validação de chave PIX do motorista no backend da Van360, utilizando a API do Banco Inter e o método de micro-pagamento de R$ 0,01. O objetivo é garantir a segurança e a correta titularidade das chaves PIX para o repasse de valores.

## 1. Pré-requisitos

*   Credenciais de acesso à API do Banco Inter (Client ID, Client Secret, Certificado).
*   Configuração de Webhook no Banco Inter para notificações de PIX recebidos.
*   Acesso ao código-fonte do backend (Node.js/TypeScript) e ao banco de dados (Supabase).

## 2. Ajustes no Banco de Dados (Supabase)

### A. Tabela `usuarios`

As colunas para armazenar a chave PIX do motorista e seu status de validação foram detalhadas no arquivo `sql_implementacao_pix.sql`. É crucial que esses campos sejam configurados como **opcionais (NULL)**, pois nem todos os planos exigirão a chave PIX do motorista. A obrigatoriedade será controlada pela lógica de negócio no frontend e backend, conforme o plano do usuário.

| Campo | Tipo | Descrição | Opcionalidade |
| :--- | :--- | :--- | :--- |
| `chave_pix` | `TEXT` | Chave PIX informada pelo motorista. |
| `status_chave_pix` | `VARCHAR(50)` | Status da chave: `NAO_CADASTRADA`, `PENDENTE_VALIDACAO`, `VALIDADA`, `FALHA_VALIDACAO`. |
| `chave_pix_validada_em` | `TIMESTAMP` | Data e hora da última validação bem-sucedida. | **OPCIONAL** |
| `nome_titular_pix_validado` | `TEXT` | Nome do titular retornado pelo Inter durante a validação. | **OPCIONAL** |
| `cpf_cnpj_titular_pix_validado` | `TEXT` | CPF/CNPJ do titular retornado pelo Inter durante a validação. | **OPCIONAL** |

### B. Nova Tabela `pix_validacao_pendente`

A criação desta tabela temporária para correlacionar as requisições de micro-pagamento com as respostas do webhook foi detalhada no arquivo `sql_implementacao_pix.sql`.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | ID único da transação de validação. |
| `usuario_id` | `UUID` (FK) | ID do motorista que está validando a chave. |
| `x_id_idempotente` | `TEXT` | ID de idempotência enviado ao Inter. |
| `chave_pix_enviada` | `TEXT` | Chave PIX que foi enviada para validação. |
| `created_at` | `TIMESTAMP` | Data e hora da criação do registro. |

## 3. Implementação no Backend (Node.js/TypeScript)

### A. Serviço de Usuário (Ex: `usuario.service.ts`)

#### 1. Função `cadastrarOuAtualizarChavePix(usuarioId: string, chavePix: string)`

*   **Validação de Formato:** Implementar regex para validar o formato da `chavePix` (CPF, CNPJ, E-mail, Telefone, Aleatória).
*   **Salvar Chave e Status:** Atualizar a tabela `usuarios` com `chave_pix = chavePix` e `status_chave_pix = 'PENDENTE_VALIDACAO'`.
*   **Chamar Micro-Pagamento:** Invocar uma nova função `iniciarValidacaoPix(usuarioId, chavePix)`.

#### 2. Nova Função `iniciarValidacaoPix(usuarioId: string, chavePix: string)`

*   **Gerar `x-id-idempotente`:** Criar um UUID único para cada transação de validação.
*   **Registrar Validação Pendente:** Inserir um registro na tabela `pix_validacao_pendente` com `usuario_id`, `x_id_idempotente` e `chave_pix_enviada`.
*   **Chamar API do Inter (POST /pix):**
    *   **URL:** `https://cdpj.partners.bancointer.com.br/banking/v2/pix` (ou sandbox).
    *   **Headers:** `Authorization: Bearer <token_oauth>`, `x-id-idempotente: <uuid_gerado>`.
    *   **Body (JSON):**
        ```json
        {
          "valor": 0.01,
          "destinatario": {
            "chave": "<chavePix>",
            "tipo": "CHAVE_PIX" // Ou DADOS_BANCARIOS se for o caso
          },
          "descricao": "Validacao Chave PIX Van360 - " + usuarioId
        }
        ```
    *   **Tratamento de Erro:** Se a chamada à API do Inter falhar (ex: chave inválida), atualizar `status_chave_pix = 'FALHA_VALIDACAO'` e notificar o motorista.

### B. Controller/Endpoint de Webhook (Ex: `webhook.controller.ts`)

#### 1. Função `receberWebhookPix(payload: any)`

*   **Validação de Assinatura:** Implementar a validação da assinatura do webhook do Inter para garantir a autenticidade da notificação.
*   **Extrair `e2eId`:** Obter o `e2eId` do payload do webhook (identificador único da transação PIX).
*   **Consultar Detalhes do PIX (GET /pix/{e2eId}):**
    *   **URL:** `https://cdpj.partners.bancointer.com.br/pix/v2/pix/{e2eId}` (ou sandbox).
    *   **Headers:** `Authorization: Bearer <token_oauth>`.
    *   **Retorno:** O objeto de resposta conterá `infoPagador.nome` e `infoPagador.cpfCnpj`.
*   **Correlacionar com `pix_validacao_pendente`:** Buscar o registro na tabela `pix_validacao_pendente` usando o `x_id_idempotente` (que pode ser extraído da `descricao` do PIX ou de um campo customizado se a API do Inter permitir).
*   **Validação de Titularidade:**
    *   Comparar `infoPagador.nome` com `usuarios.nome`.
    *   Comparar `infoPagador.cpfCnpj` com `usuarios.cpf_cnpj`.
    *   **Lógica de Tolerância:** Implementar uma lógica flexível para comparação de nomes (ex: remover espaços, acentos, converter para maiúsculas, comparar apenas sobrenomes). O CPF/CNPJ deve ser uma correspondência exata.
*   **Atualizar `usuarios`:**
    *   **Sucesso:** Se a validação de titularidade for positiva, atualizar `status_chave_pix = 'VALIDADA'`, `chave_pix_validada_em = NOW()`, `nome_titular_pix_validado` e `cpf_cnpj_titular_pix_validado`.
    *   **Falha:** Se a validação de titularidade falhar, atualizar `status_chave_pix = 'FALHA_VALIDACAO'` e notificar o motorista para corrigir a chave.
*   **Limpar `pix_validacao_pendente`:** Remover o registro após o processamento.

## 4. Tratamento de Erros e Notificações

*   **Timeout:** Implementar um mecanismo de *job* agendado para verificar chaves `PENDENTE_VALIDACAO` que não foram processadas pelo webhook após um tempo razoável (ex: 10 minutos). Notificar o motorista sobre a falha na validação.
*   **Notificações ao Motorista:** Enviar notificações claras (via WhatsApp/App) sobre o status da validação da chave PIX (sucesso ou falha).

Este fluxo garante que a chave PIX do motorista seja validada de forma segura e eficiente, protegendo a Van360 e seus usuários de erros e fraudes no repasse de valores. É um investimento essencial para a confiança do motorista e a saúde do seu negócio.
