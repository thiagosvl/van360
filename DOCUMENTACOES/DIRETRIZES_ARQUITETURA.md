# Diretrizes de Arquitetura e Desenvolvimento - Van Control

## 🎯 Objetivo
Este documento serve como referência única de verdade para a arquitetura do projeto Van360 (pasta van-control). Deve ser consultado por IAs e desenvolvedores antes de iniciar qualquer modificação no código.

---

## 1. Princípios Gerais
- **Não Reinventar a Roda:** Reutilize componentes, hooks e utilitários existentes antes de criar novos.
- **Constantes > Magic Strings:** **PROIBIDO** usar strings ou números soltos para definir status, tipos ou regras de negócio. Use os `ENUMS` definidos em `src/types/enums.ts` ou constantes em `src/constants`.
- **Mensagens Centralizadas:** Para feedback ao usuário (Toasts, Erros de Validação), **NUNCA** use strings hardcoded. Use sempre as mensagens centralizadas em `src/constants/messages.ts` (ex: `toast.error("veiculo.erro.criar")`). O helper do toast já traduz a chave automaticamente.
- **Separação de Responsabilidades:** Mantenha a lógica separada da UI. Componentes devem ser focados em apresentação.

---

## 2. Organização de Pastas e Hooks

A organização da pasta `src/hooks` é estrita e deve ser seguida rigorosamente:

### 📂 `src/hooks`
- **`api/`**: Apenas hooks que envelopam chamadas do React Query (`useQuery`, `useMutation`).
    - *Não deve conter* regras de negócio complexas ou lógica de UI.
- **`business/`**: Regras de negócio puras (ex: validação de limites de plano, lógica de assinatura, gerenciamento de sessão).
    - **Extensão:** `.ts` (TypeScript puro).
    - *Não deve conter* JSX.
- **`ui/`**: "View Models", lógica de interface (modais, filtros) e ações de componentes.
    - **Extensão:** `.ts` (se retornar apenas dados/funções) ou `.tsx` (se retornar JSX).
- **`form/`**: Hooks que encapsulam lógica de formulário (`react-hook-form`, `zod`).
    - Ex: `usePassageiroExternalForm.ts`.

### 📂 `src/components`
- **`ui/`**: Componentes atômicos e genéricos (ex: Button, Input, Card). Seguem o padrão Shadcn/UI.
- **`features/`**: Componentes compostos específicos de uma funcionalidade (ex: `PassageirosList`, `CobrancaCard`).
- **`forms/`**: Inputs controlados com lógica específica de formulário.
- **`dialogs/`**: Modais de negócio reutilizáveis.

---

## 3. Padrões de Código

### Tipagem (TypeScript)
- **Zero `any`:** O uso de `any` é desencorajado. Sempre tipe as props, returns e variáveis. Atualmente existem casos (legados) que fazem uso de any, mas o objetivo é evitar novos.
- **Tipos Centralizados:** Interfaces de domínio (Usuario, Passageiro, Cobranca) devem estar em `src/types`.

### Banco de Dados (Supabase)
- **Schema Referência:** A estrutura inicial do banco consta em `../van360-backend/supabase/migrations/20240101000000_initial_schema.sql`.
    - Consulte este arquivo para entender relacionamentos e tipos base.
    - Novas alterações devem seguir o padrão de migrations do Supabase.
- **Valores e Colunas:** Ao lidar com status ou tipos:
    - **Correto:** `if (status === CobrancaStatus.PAGO)`
    - **Errado:** `if (status === 'pago')`
    - **Errado:** `if (status === 1)`

### Estilização
- **Tailwind CSS:** Framework padrão único.
- Evite criar classes CSS manuais ou módulos, a menos que seja uma animação muito específica.
- Padrão **Mobile First** é encorajado.

---

## 4. Stack Tecnológico
- **Frontend:** React 18+ (Vite)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + Shadcn/UI (Radix Primitives)
- **Gerenciamento de Estado Server-Side:** TanStack Query (React Query)
- **Formulários:** React Hook Form + Zod
- **Build/Bundle:** Vite (Native ES Modules)

---
*Documento criado em: 19/01/2026*
