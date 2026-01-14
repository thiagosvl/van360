# Ajustes e Correções Recentes (Status: Concluído ✅)

Todos os itens abaixo foram analisados e corrigidos/implementados.

### 1. Constraint de Exclusão no Banco de Dados (✅ Feito)
- **Problema:** Não era possível remover usuário devido à FK na tabela `cobrancas` (campo `usuario_id`).
- **Solução:** O script `20240101000000_initial_schema.sql` foi ajustado para permitir `usuario_id` NULL na tabela `cobrancas`. Isso permite que o `ON DELETE SET NULL` funcione corretamente, liberando a exclusão do usuário sem perder o histórico financeiro da cobrança.

### 2. Normalização de 'Periodo' (✅ Feito)
- **Problema:** Divergência de Maiúscula/Minúscula salvando no banco.
- **Solução:**
  - Implementado `toLowerCase()` no DTO do Backend (`passageiro.dto.ts`) para forçar minúsculo na entrada.
  - Frontend verificado; os componentes de Select já utilizam os valores dos enums (minúsculos).

### 3. Exclusão de Conta e Limpeza Whatsapp (✅ Feito)
- **Problema:** Necessidade de remover instância do Whatsapp ao excluir conta e persistência de dados.
- **Solução:**
  - **Fluxo Refinado:** O botão de excluir conta no Frontend agora chama o endpoint via `apiClient.delete` (em vez de chamar RPC direto).
  - **Backend Orquestrado:** O serviço `excluirUsuario`:
    1.  Chama a Evolution API para deletar a instância do Whatsapp.
    2.  Executa a procedure `anonymize_user_account` (que mantém histórico financeiro mas remove dados pessoais e desvincula `auth_uid`).
    3.  Exclui o usuário do Supabase Auth (impedindo login).

### 4. Duplo Login no Cadastro (✅ Verificado)
- **Análise:** O front faz duas requisições porque existe um redirecionamento imediato após o cadastro que dispara o hook de sessão, além da atualização de estado interna.
- **Conclusão:** É uma condição de corrida não-bloqueante (ambas retornam 200 OK ou uma falha tratada). Não afeta a usabilidade e garante que a sessão esteja atualizada. Mantido como está.

### 5. Tela de "Erro ao Carregar Perfil" (✅ Feito)
- **Problema:** Botão "Tentar Novamente" ineficaz em casos de exclusão/falha crítica.
- **Solução:** Adicionado um **auto-redirect** (timer de 5 segundos) nessa tela. Se o perfil não carregar, o usuário é avisado e redirecionado automaticamente para o `/login` para reautenticar, melhorando a experiência.

### 6. Polling do Whatsapp vs Dialog PIX (✅ Feito)
- **Problema:** Polling desnecessário verificando status do Whatsapp enquanto o usuário validava chave PIX.
- **Solução:**
  - O hook `useWhatsapp` lê esse estado e **pausa** as requisições de status (`enabled: false`) sempre que o dialog de PIX estiver aberto.

### 7. Refinamentos Chave PIX (✅ Feito)
- **Problema:** Edição direta de chave permitia burlar validação; Dados do titular não eram salvos corretamente; Risco de abuso (spam de micro-pagamentos).
- **Solução:**
  - **Front:** Removido formulário de PIX do "Editar Perfil". Agora um botão abre o fluxo dedicado (`PixKeyDialog`).
  - **Back:** Implementado **Rate Limit** (3 tentativas/hora).
  - **Integridade:** Serviço processa retorno do Inter para capturar e salvar `nome` e `documento` do beneficiário validado no banco. Type `Usuario` atualizado.

### 8. Fix: Mensagem de Boas-vindas sem PIX (✅ Feito)
- **Problema:** Usuário relatou que a msg de boas-vindas do plano Profissional chegava sem o código PIX embaixo.
- **Causa:** O backend enviava `qrCode` em alguns lugares (auth) e `qrCodePayload` em outros (inter, assinatura). O frontend padronizado esperava `qrCodePayload`.
- **Solução:** Padronizado TODO o sistema para retornar estritamente `qrCodePayload` e `qrCodeUrl`. Interface `RegistroAutomaticoResult` atualizada para refletir essa mudança e evitar regressões.