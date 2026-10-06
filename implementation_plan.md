# Plano de Implementação - Preferências do Aplicativo e Formato de Exibição do Responsável

## 1. Visão Geral
Implementar o **Menu de Preferências do Aplicativo** na tela de **Conta** (`/conta?tab=preferencias`), persistindo na tabela **`usuario_configuracoes`** a preferência:
- `formato_nome_responsavel`: `'primeiro_nome' | 'completo'` (Padrão: `'primeiro_nome'`).

O endpoint `/me/profile` passa a trazer as configurações do usuário via `JOIN` nativo 1:1 com `usuario_configuracoes`, garantindo carregamento imediato no boot com zero requisições adicionais e sincronização entre celular e computador.

---

## 2. Decisões de Arquitetura e Negócio (Premissas e Deduções)

1. **Local de Persistência no Banco:**
   - *Dedução:* Coluna `formato_nome_responsavel TEXT NOT NULL DEFAULT 'primeiro_nome'` na tabela `usuario_configuracoes`.
   - *Constraint:* `CHECK (formato_nome_responsavel IN ('primeiro_nome', 'completo'))`.
2. **Carregamento Otimizado (JOIN no `/me/profile`):**
   - *Dedução:* `getUserProfile` e `userRepository` trazem `usuario_configuracoes` em conjunto com `usuarios`.
   - *Performance:* Relação 1:1 indexada por Primary Key em ambas as tabelas (`usuario_id = usuarios.id`). Custo sub-milissegundo (< 0.5ms).
3. **Padrão Mantido (Retrocompatibilidade):**
   - *Dedução:* Valor padrão continua sendo `'primeiro_nome'`. Quem não alterar permanece com a visualização atual.
4. **Segurança de Layout (Truncate):**
   - *Dedução:* Quando a preferência for `'completo'`, aplicar a classe `truncate` nos cards e listas para evitar estouro de tela em aparelhos compactos.
5. **Mapeamento de Ocorrências:**
   - Contratos (`ContratosList.tsx`, `ContratoSummary.tsx`)
   - Cobranças/Parcelas (`CobrancasList.tsx`, `CobrancaSummary.tsx`)
   - Baixa Manual de Pagamento (`ManualPaymentDialog.tsx`)
   - Pré-Cadastro de Passageiros (`PrePassageiros.tsx`)
   - Passageiros Desktop (`PassageirosList.tsx`)
   - Ausências (`ProximasAusenciasDialog.tsx`)
   *(A Carteirinha do Aluno mantém seus dados cadastrais completos intactos).*

---

## 3. Etapas de Execução

### Etapa 1: Backend - Banco de Dados e Migrations
1. Criar migration `van360-backend/supabase/migrations/20261006121500_add_formato_nome_responsavel_usuario_configuracoes.sql`.
2. Aplicar migration no banco Supabase via MCP tool `execute_sql` ou migration runner.
3. Atualizar `van360-backend/src/types/database.types.ts`.

### Etapa 2: Backend - API, Schemas e Services
1. Atualizar `src/schemas/configuracoes.schema.ts` para validar `formato_nome_responsavel`.
2. Atualizar `src/types/dtos/configuracoes.dto.ts`.
3. Atualizar `src/services/configuracoes.service.ts` para incluir `formato_nome_responsavel` em `obterConfiguracoesUsuario`.
4. Atualizar `src/services/profile.service.ts` / `src/repositories/user.repository.ts` para trazer `configuracoes:usuario_configuracoes(formato_nome_responsavel)` em `/me/profile`.

### Etapa 3: Frontend - Tipos e Integração
1. Atualizar `van360/src/integrations/supabase/types.ts` com a nova coluna.
2. Atualizar interface `Usuario` e `ConfiguracoesUsuario` no frontend.
3. Atualizar `src/hooks/business/useProfile.ts` ou criar helper selector para obter `formatoNomeResponsavel` direto do perfil/configurações com fallback para `'primeiro_nome'`.
4. Atualizar formatador central `formatNomeResponsavelExibicao` em `src/utils/formatters/name.ts`.

### Etapa 4: Frontend - UI da Nova Aba de Preferências
1. Criar `src/components/features/configuracoes/PreferenciasTab.tsx` com design de radio cards e previews visuais.
2. Adicionar o item "Preferências do Aplicativo" no menu de `src/pages/Conta.tsx`.
3. Configurar rota/subpágina `Conta.tsx?tab=preferencias` e suporte ao botão voltar.

### Etapa 5: Frontend - Aplicação nas Telas e Proteção com Truncate
1. Atualizar os 6 arquivos mapeados para respeitar a preferência e aplicar `truncate` no container de texto quando for nome completo.
2. Validar compilação TypeScript no backend e no frontend (`tsc --noEmit`).
