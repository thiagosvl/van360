# Refatoração Necessária para Automação de Cobrança e Repasse PIX (Van360)

Com base na arquitetura proposta para a automação de cobrança e repasse PIX, esta seção detalha as refatorações e novas implementações necessárias tanto no backend quanto no frontend da Van360. O objetivo é integrar a nova funcionalidade de forma eficiente, segura e escalável.

## 1. Refatoração no Backend (Node.js/TypeScript)

### A. Módulos/Serviços Dedicados

É crucial organizar a lógica em módulos bem definidos para facilitar a manutenção e a escalabilidade.

*   **`inter.service.ts` (Novo ou Refatorado):**
    *   **Responsabilidade:** Centralizar toda a comunicação com a API do Banco Inter.
    *   **Métodos:**
        *   `gerarPixCobranca(valor: number, destinatario: any, descricao: string): Promise<PixData>`: Para gerar o PIX para os pais.
        *   `consultarPix(e2eId: string): Promise<PixDetails>`: Para consultar detalhes de um PIX recebido via webhook.
        *   `realizarPixRepasse(valor: number, destinatario: any, descricao: string): Promise<RepasseStatus>`: Para efetuar o repasse PIX para o motorista.
        *   `validarWebhook(payload: any, signature: string): boolean`: Para validar a assinatura dos webhooks do Inter.

*   **`cobranca.service.ts` (Refatorado):**
    *   **Responsabilidade:** Gerenciar a lógica de negócio das cobranças dos pais.
    *   **Métodos:**
        *   `criarCobranca(dados: CobrancaInput): Promise<Cobranca>`: Modificar para incluir a chamada a `inter.service.ts.gerarPixCobranca` e salvar os dados do PIX na tabela `cobrancas`.
        *   `atualizarStatusCobranca(cobrancaId: UUID, status: CobrancaStatus, dadosPagamento?: any): Promise<Cobranca>`: Método para atualizar o status da cobrança para `PAGA` e registrar os detalhes do pagamento.
        *   `iniciarRepasse(cobrancaId: UUID): Promise<RepasseStatus>`: Orquestrar o processo de repasse, chamando `inter.service.ts.realizarPixRepasse` e atualizando o status de repasse na tabela `cobrancas`.

*   **`webhook.controller.ts` (Refatorado):**
    *   **Responsabilidade:** Receber e rotear os webhooks do Banco Inter.
    *   **Endpoints:**
        *   `POST /webhook/inter/pix-cobranca`: Para receber notificações de pagamentos de cobranças dos pais.
        *   `POST /webhook/inter/pix-repasse`: (Opcional, se o Inter notificar o status do repasse) Para receber notificações sobre o status do PIX de repasse.
    *   **Lógica:**
        1.  Validar a assinatura do webhook usando `inter.service.ts.validarWebhook`.
        2.  Extrair `txid_pix` do payload.
        3.  Chamar `cobranca.service.ts.atualizarStatusCobranca` para marcar a cobrança como `PAGA`.
        4.  Chamar `cobranca.service.ts.iniciarRepasse` para iniciar o fluxo de repasse.

### B. Modelos de Dados (Tipagem)

*   **`cobranca.model.ts` (Atualização):**
    *   Adicionar os campos propostos na arquitetura (`txid_pix`, `qr_code_payload`, `url_qr_code`, `valor_pago`, `taxa_intermediacao_banco`, `valor_a_repassar`, `status_repasse`, `data_repasse`, `id_transacao_repasse`).

*   **`usuario.model.ts` (Atualização):**
    *   Confirmar a existência e tipagem correta dos campos de chave PIX do motorista (`chave_pix`, `status_chave_pix`, `chave_pix_validada_em`, `nome_titular_pix_validado`, `cpf_cnpj_titular_pix_validado`).

*   **`transacaoRepasse.model.ts` (Novo):**
    *   Criar um modelo para a tabela `transacoes_repasse` (se implementada) com os campos propostos.

### C. Lógica de Agendamento (Cron Jobs)

*   **`cron.service.ts` (Novo ou Refatorado):**
    *   **Job 1: Geração e Envio de Cobranças:** Agendar a geração e o envio automático de cobranças para os pais (ex: 5 dias antes do vencimento, no dia do vencimento, e 3 dias após o vencimento).
    *   **Job 2: Monitoramento de Repasses:** Agendar a verificação de repasses com `status_repasse = PROCESSANDO` que excederam um tempo limite, para identificar falhas e notificar a equipe de suporte.

## 2. Refatoração no Frontend (React/Next.js)

### A. Telas e Componentes Existentes

*   **`CobrancasScreen.tsx` (ou similar):**
    *   **Exibição de Status:** Atualizar a interface para exibir o status de pagamento (`PAGA`, `PENDENTE`, `ATRASADA`) e o status de repasse (`REPASSADO`, `PENDENTE`, `FALHA`) para cada cobrança.
    *   **Detalhes da Cobrança:** Adicionar a exibição do `valor_pago`, `taxa_intermediacao_banco` e `valor_a_repassar` quando a cobrança for paga.
    *   **Ações:** Adicionar botões/ícones para reenviar cobrança, visualizar comprovante, etc.

*   **`PerfilMotoristaScreen.tsx` (ou similar):**
    *   **Status da Chave PIX:** Exibir claramente o `status_chave_pix` do motorista e a data de validação.
    *   **Ação de Revalidação:** Permitir que o motorista inicie uma revalidação da chave PIX se o status for `FALHA_VALIDACAO`.

### B. Novos Componentes/Telas

*   **`RelatorioFinanceiroMotorista.tsx` (Novo):**
    *   **Visão Geral:** Uma tela dedicada para o motorista visualizar um extrato financeiro completo, incluindo:
        *   Total de cobranças geradas.
        *   Total de pagamentos recebidos.
        *   Total de taxas de intermediação.
        *   Total repassado.
        *   Lista de repasses com status e detalhes.

*   **`NotificacoesComponent.tsx` (Refatorado/Novo):**
    *   **Exibição:** Exibir notificações em tempo real sobre pagamentos recebidos dos pais e status dos repasses.

### C. Integração com Notificações (WhatsApp/App)

*   **Serviço de Notificação (Frontend):** Implementar a lógica para receber e exibir notificações push no aplicativo ou via WhatsApp (se houver integração direta com o frontend).

## 3. Considerações Adicionais

*   **Testes:** Implementar testes unitários e de integração abrangentes para todas as novas funcionalidades e refatorações.
*   **Segurança:** Garantir que todas as APIs e endpoints estejam protegidos contra acessos não autorizados e ataques comuns (ex: XSS, CSRF).
*   **Performance:** Monitorar o desempenho do backend e do banco de dados, especialmente com o aumento do volume de transações e webhooks.

Esta refatoração garantirá que a Van360 possa entregar sua proposta de valor de automação de cobrança e repasse PIX de forma completa e confiável.
