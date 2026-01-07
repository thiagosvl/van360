## PROMPT TÉCNICO MESTRE: Implementação Van360 (Backend & Frontend)

Este prompt consolida todas as instruções para a implementação das funcionalidades de precificação dinâmica, cálculo pro-rata e validação de chave PIX no projeto Van360. O objetivo é garantir um sistema robusto, configurável e seguro.

### 1. Ajustes no Banco de Dados (Supabase)

**A. Executar SQL para Estrutura PIX:**

*   **Ação:** Executar o conteúdo do arquivo `sql_implementacao_pix.sql` diretamente no console do Supabase.
*   **Objetivo:** Criar a tabela `pix_validacao_pendente` e adicionar as colunas de validação PIX à tabela `public.usuarios`.

**B. Atualizar Tabela `configuracao_interna`:**

*   **Ação:** Inserir/Atualizar as seguintes chaves na tabela `public.configuracao_interna`:

| Chave | Valor | Justificativa |
| :--- | :--- | :--- |
| `PRO_RATA_VALOR_MINIMO` | `0.01` | Garante que o fluxo PIX seja sempre disparado, evitando requisições de R$ 0,00 que podem falhar na API do Inter. |
| `ENTERPRISE_INCREMENTO_PASSAGEIRO` | `2.50` | Custo fixo por passageiro adicional acima do limite base (90). |
| `PRO_RATA_DIAS_MES` | `30` | Valor padrão para o cálculo pro-rata. |

*   **Observação:** As chaves `ENTERPRISE_INCREMENTO_BLOCO` e `ENTERPRISE_TAMANHO_BLOCO` devem ser removidas se ainda existirem. A chave `ENTERPRISE_LIMITE_BASE` **não é necessária** como configuração separada, pois o limite base será buscado dinamicamente.

### 2. Implementação no Backend (Node.js/TypeScript)

**A. Lógica de Precificação Dinâmica (Função `calcularPrecoPlano` ou similar):**

*   **Ação:** Modificar a função que calcula o preço mensal do plano para incluir a lógica Enterprise.
*   **Detalhes:**
    *   Para planos pré-definidos (25, 60, 90 passageiros), buscar os preços diretamente da tabela `planos`.
    *   Para `n > 90` passageiros (plano personalizado):
        1.  **Buscar Dinamicamente:** Obter o preço (`preco_base`) e o limite de passageiros (`limite_base`) do maior plano pré-definido (atualmente 90 passageiros) diretamente da tabela `planos`.
        2.  **Obter Incremento:** Buscar o valor de `ENTERPRISE_INCREMENTO_PASSAGEIRO` da tabela `configuracao_interna`.
        3.  **Calcular:** `Preço(n) = preco_base + (n - limite_base) * ENTERPRISE_INCREMENTO_PASSAGEIRO`.

**B. Lógica de Cálculo Pro-Rata (Função `calcularProRata` ou similar):**

*   **Ação:** Implementar/Ajustar a função de cálculo pro-rata.
*   **Detalhes:**
    *   Receber `preco_atual`, `preco_novo`, `dias_restantes`.
    *   Buscar `PRO_RATA_DIAS_MES` e `PRO_RATA_VALOR_MINIMO` da tabela `configuracao_interna`.
    *   **Fórmula:** `pro_rata = (preco_novo / dias_no_mes - preco_atual / dias_no_mes) * dias_restantes`.
    *   **Regra de Negócio:**
        *   Se `pro_rata > 0` e `pro_rata < PRO_RATA_VALOR_MINIMO`, retornar `PRO_RATA_VALOR_MINIMO`.
        *   Se `pro_rata <= 0` (downgrade ou upgrade de franquia com mesmo preço), retornar `0.0`.

**C. Implementação do Fluxo de Validação PIX:**

*   **Ação:** Seguir o `guia_implementacao_pix.md` para implementar o fluxo de micro-pagamento e webhook para validação de chaves PIX.
*   **Tabelas Envolvidas:** `usuarios` (colunas PIX) e `pix_validacao_pendente`.

### 3. Implementação no Frontend (UI/UX)

**A. Dialog de Chave PIX Obrigatória:**

*   **Ação:** Implementar o dialog "infechável" e persistente para motoristas em planos que exigem chave PIX, até que ela seja validada.
*   **Detalhes:**
    *   Condição de exibição: `usuario.plano.exige_chave_pix_validada === true && usuario.status_chave_pix !== 'VALIDADA'`.
    *   Feedback de loading durante o micro-pagamento (instantâneo).

### 4. Testes

*   **Ação:** Realizar testes unitários e de integração para todas as funcionalidades implementadas.
*   **Cenários Críticos:**
    *   Upgrades em diferentes dias do mês (início, meio, fim).
    *   Upgrades para planos personalizados (91, 100, 150, 200 passageiros).
    *   Downgrades (garantir que não há cobrança).
    *   Validação de chave PIX (sucesso e falha).
    *   Comportamento do dialog de chave PIX.

---
