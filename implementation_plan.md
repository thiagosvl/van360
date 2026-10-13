# Plano de Implementação: Padronização do Componente Unificado de Abas (`AppTabNav`)

## 1. Visão Geral e Objetivo
Padronizar todas as ocorrências de abas de navegação (tabs) do motorista (`Passageiros`, `Carteirinha`, `Cobrancas` / Parcelas, `Contratos`, `MinhaEquipe`, `Assinatura`, `Rotas`, `Relatorios`, `Aniversariantes`, etc.) através da criação e adoção de um componente comum, reutilizável e fortemente tipado: **`<AppTabNav />`**.

O modelo de referência oficial e canônico é a **tela de Alunos** (`src/pages/Passageiros.tsx`).

---

## 2. Decisões de Arquitetura e Negócio (Premissas e Deduções Obrigatórias)

### 2.1 Dedução de Comportamento Mobile (Scroll Lateral vs Grid 50%)
- **2 Abas (ou menos):**
  - **Comportamento Mobile:** Renderiza como `grid grid-cols-2` (ou `grid-cols-1`), ocupando `w-full` uniformemente, sem corte lateral e sem necessidade de rolagem horizontal (ex: Alunos, Cobranças/Parcelas, Equipe, Rotas, Assinatura).
  - **Comportamento Desktop (`sm:`):** Transiciona para `sm:flex sm:w-auto` contido em `w-fit`.
- **Mais de 2 Abas:**
  - **Comportamento Mobile:** Permite rolagem horizontal suave (`overflow-x-auto`, `w-max flex`, `touch-pan-x`, `no-scrollbar`), evitando que palavras quebrem ou fiquem ilegíveis em telas compactas (como 320px no print da Carteirinha).
  - **Auto-scroll para a Aba Ativa:** O componente inclui um listener/scroll automático que centraliza a aba selecionada no viewport horizontal ao alternar ou montar a tela.

### 2.2 Estrutura Visual Canônica (Fiel à Tela de Alunos)
- **Container externo:**
  `bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5] overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x shrink-0`
- **TabsList:**
  `bg-transparent min-h-[38px] sm:min-h-[42px] p-0 gap-1 border-0`
- **TabsTrigger:**
  `rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5`
  - Estado ativo: `data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs`
  - Estado inativo: `data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50`
- **Badge / Quantidade / Contador:**
  `ml-2 px-2 py-0.5 rounded-[18px] text-[11px] font-medium transition-colors`
  - Ativo: `bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5]`
  - Inativo: `text-[#737373]`
  - Suporte a loading via skeleton (`w-5 h-4 rounded-[12px] bg-[#e5e5e5]`).
- **Ícones Opcionais:**
  Suporte nativo via `icon?: React.ReactNode` para telas que usam ícones (como Carteirinha e Aniversariantes).

---

## 3. Mapeamento de Telas e Ocorrências

| Tela / Arquivo | Quantidade de Abas | Presença de Contadores | Mobile: Scroll Lateral? | Ícones? |
| :--- | :---: | :---: | :---: | :---: |
| **Passageiros** (`src/pages/Passageiros.tsx`) | 2 (Alunos / Solicitações) | Sim (`countPassageiros`, `countPrePassageiros`) | Não (`grid grid-cols-2`) | Não |
| **Cobrancas** (`src/pages/Cobrancas.tsx`) | 2 (A Receber / Recebidas) | Sim (`countAReceber`, `countRecebidos`) | Não (`grid grid-cols-2`) | Não |
| **PassageiroCarteirinha** (`src/pages/PassageiroCarteirinha.tsx`) | 5 (Parcelas / Dados / Resp. / Contrato / Ausências) | Não | Sim (`w-max flex` com auto-scroll) | Sim |
| **ContratosToolbar** (`src/components/features/contrato/ContratosToolbar.tsx`) | 3 (Sem Contrato / Pendentes / Assinados) | Sim (`countSemContrato`, etc. com skeleton) | Sim (`w-max flex`) | Não |
| **MinhaEquipe** (`src/pages/MinhaEquipe.tsx`) | 2 (Motoristas / Monitores) | Sim (`motoristasAuxiliares.length`, etc.) | Não (`grid grid-cols-2`) | Não |
| **SubscriptionPlansShowcase** (`src/components/features/subscription/SubscriptionPlansShowcase.tsx`) | 2 (Plano Mensal / Plano Anual) | Não | Não (`grid grid-cols-2`) | Não |
| **RotasToolbar** (`src/components/features/rotas/RotasToolbar.tsx`) | 2 (Minhas Rotas / Histórico) | Sim (`countMinhasRotas`, `countHistorico`) | Não (`grid grid-cols-2`) | Não |
| **Relatorios** (`src/pages/Relatorios.tsx`) | 4 (Visão Geral / Entradas / Saídas / Operacional) | Não | Sim (`w-max flex` / `grid-cols-4` desktop) | Não |
| **Aniversariantes** (`src/pages/Aniversariantes.tsx`) | 2 (Por Van / Por Escola) | Não | Não (`grid grid-cols-2`) | Sim |
| **ConfigurarModeloContrato** (`src/pages/ConfigurarModeloContrato.tsx`) | 3 (Cláusulas / Multas / Identidade) | Sim (`secoes.length`) | Sim (`w-max flex` ou grid adaptável) | Sim |
| **CarteirinhaResponsaveis** (`src/components/features/passageiro/carteirinha/CarteirinhaResponsaveis.tsx`) | N (lista dinâmica) | Não | Sim (`w-max flex`) | Não |
| **ResponsavelCarteirinhaBase** (`src/pages/ResponsavelCarteirinhaBase.tsx`) | 6 (Geral / Parcelas / Ausências / ...) | Não | Sim (`w-max flex`) | Não |

---

## 4. Plano de Execução Passo a Passo

### Passo 1: Criação do Componente Central `<AppTabNav />`
- Criar `src/components/ui/AppTabNav.tsx`.
- Definir tipagem genérica `AppTabItem<T extends string = string>` com `value`, `label`, `badge`, `badgeLoading`, `icon`, `disabled`, `title`.
- Lógica de layout:
  - `"auto"`: Se `items.length <= 2` -> `grid grid-cols-2 sm:flex` (sem scroll lateral no mobile). Se `items.length > 2` -> `w-max sm:w-auto flex` (com scroll lateral).
  - `"scroll"`: Força scroll lateral mobile.
  - `"fixed"`: Força `grid grid-cols-N`.
- Implementar ref e scroll centralizador automático para a aba ativa no mobile.

### Passo 2: Refatoração das Telas Principais do Motorista
1. `src/pages/Passageiros.tsx`: Utilizar `<AppTabNav>` com as abas Alunos e Solicitações.
2. `src/pages/Cobrancas.tsx`: Utilizar `<AppTabNav>` com as abas A Receber e Recebidas.
3. `src/pages/PassageiroCarteirinha.tsx`: Substituir o bloco de abas mobile pelo `<AppTabNav>`, preservando ícones e a lista de abas permitidas.
4. `src/components/features/contrato/ContratosToolbar.tsx`: Substituir pelo `<AppTabNav>` com badges e skeletons.
5. `src/pages/MinhaEquipe.tsx`: Substituir pelo `<AppTabNav>`.
6. `src/components/features/subscription/SubscriptionPlansShowcase.tsx`: Substituir pelo `<AppTabNav>`.

### Passo 3: Refatoração das Demais Ocorrências
1. `src/components/features/rotas/RotasToolbar.tsx`
2. `src/pages/Relatorios.tsx`
3. `src/pages/Aniversariantes.tsx`
4. `src/pages/ConfigurarModeloContrato.tsx`
5. `src/components/features/passageiro/carteirinha/CarteirinhaResponsaveis.tsx`
6. `src/pages/ResponsavelCarteirinhaBase.tsx`

### Passo 4: Verificação de Tipagem e Build
- Executar checagem de tipos com `npx tsc --noEmit` para garantir zero erros de tipagem e integridade plena.
