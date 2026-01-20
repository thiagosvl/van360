# Mapa de Refatoração e Auditoria do Frontend

Este documento mapeia o progresso da refatoração e novos pontos de melhoria identificados na auditoria pós-migração.

## 1. Status das Refatorações Prioritárias (Concluídas)

### ✅ Arquitetura e Camada de Dados
- **Remoção do Supabase Client**: Completamente removido do frontend. Toda a comunicação agora é feita via `apiClient` e serviços dedicados.
- **Autenticação**: Refatorada para usar `sessionManager` e endpoints do backend.
- **Rotas**: Centralizadas em `src/constants/routes.ts`. Hardcoding removido.

### ✅ Organização de Componentes ("God Classes")
- **`Cobrancas.tsx`**: Refatorado. Lógica de UI separada em `CobrancasList` e `CobrancaMobileCard`. Responsabilidades de dados mantidas no hook `useCobrancas`.
- **`PassageiroExternalForm.tsx`**: Otimizado. Lógica de estado e submissão extraída para `usePassageiroExternalForm`.

---

## 2. Novos Pontos de Atenção (Auditoria Recente)

### ⚠️ Padronização de Hooks
- **Status**: [Resolvido]
- **Ação Realizada**:
    - Hooks de formulário (ex: `usePassageiroExternalForm`) movidos para `src/hooks/form`.
    - Hooks de UI/Ações (ex: `useCobrancaActions`, `usePassageiroActions`) movidos para `src/hooks/ui`.
    - Renomeados arquivos `.tsx` para `.ts` em `src/hooks/business`, `src/hooks/form`, e `src/hooks/ui` (quando não há JSX).
    - Padronizado nome do arquivo `use-mobile.tsx` para `useIsMobile.ts`.
    - Pasta `src/hooks/business` agora contém apenas regras de negócio puras ou genéricas.

### ⚠️ Performance
- **Status**: [Monitoramento / Otimizado]
- **Observação**: **Lazy Loading de Rotas já está implementado** em `App.tsx`.
- **Ação Futura**: Apenas se o app ficar lento, configurar `manualChunks` no Vite ou usar `lazy` em componentes internos pesados (ex: gráficos, editores). Por hora, não é urgente. app crescer.

---

## 3. Próximos Passos Sugeridos

1.  **Testes Automatizados**:
    - Com a lógica extraída para hooks (ex: `usePassageiroExternalForm`), torna-se mais fácil escrever testes unitários.
2.  **Documentação**:
    - Atualizar documentação de API no frontend se houver discrepâncias com o backend (Swagger).

---
*Última atualização: 19/01/2026*
