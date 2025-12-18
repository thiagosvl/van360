# Lógica Comercial de Planos (Cadastro e Upgrade)

Este documento centraliza as regras de negócio para exibição, seleção e validação de planos em dois momentos chave: **Cadastro (Novo Usuário)** e **Upgrade (Usuário Ativo)**.

**Premissa Global:** Incentivar a contratação de **Planos de Prateleira (Tiers)**, oferecendo planos personalizados ("Sob Medida") apenas quando a demanda do usuário excede nossa capacidade padrão.

---

## 1. Cadastro de Novo Usuário (`/register`)

**Contexto:** O usuário está criando sua conta e ainda não possui passageiros cadastrados no sistema. Não sabemos o tamanho real da sua frota.

### Regras de Exibição
1.  **Exibir Todos os Tiers Oficiais:** Mostrar todas as opções de prateleira disponíveis (Ex: 25, 50, 90 vagas).
2.  **Opção Personalizada:**
    *   Exibir um botão/link "Preciso de mais vagas" ou "Personalizar".
    *   Ao ativar, permitir input manual da quantidade.

### Regras de Validação (Personalizado)
*   **Quantidade Mínima:** A quantidade personalizada **OBRIGATORIAMENTE** deve ser maior que o Maior Tier Oficial disponível.
    *   *Exemplo:* Se o maior plano é 90, o personalizado aceita apenas n >= 91.
*   **Motivo:** Se o usuário precisa de 60 vagas, ele deve contratar o plano de 90 (Folga). Não vendemos frações intermediárias no cadastro.

---

## 2. Upgrade de Usuário Ativo (`PlanUpgradeDialog`)

**Contexto:** O usuário já opera no sistema e sabemos exatamente quantos passageiros ativos ele possui (Ex: `passageirosAtivos = 40`).

### Estratégia: Upsell Simplificado
Focamos em vender a "Folga para Crescimento".

### Regras de Exibição (Tiers)
1.  **Filtro de Viabilidade:** Ocultar qualquer Tier cuja capacidade seja **menor** que os `passageirosAtivos`.
    *   *Exemplo (40 ativos):* Tier 25 é ocultado.
2.  **Exibir Todos os Superiores:** Mostrar **TODOS** os Tiers que atendem a demanda (Viáveis).
    *   *Exemplo (40 ativos):* Exibir 50, 90, 150...
3.  **Seleção Recomendada:** Pré-selecionar o **menor Tier viável** (o degrau mais próximo).
    *   *Exemplo (40 ativos):* Selecionar 50.

### Regras de Exibição (Sob Medida/Personalizado)
*   **Visibilidade:** A opção "Sob Medida" (Custom) é **OCULTA** por padrão.
*   **Gatilho de Exibição:** Ela só aparece automaticamente se os `passageirosAtivos` forem **maiores que o Maior Tier Oficial**.
    *   *Exemplo:* Usuário tem 100 ativos e o maior Tier é 90.
    *   Nesse caso, a única opção viável é o Custom 100 (ou mais).
*   **Cálculo de Preço:** Como a quantidade (100) é maior que o maior tier (90), ela naturalmente atende à regra de "Mínimo" do backend, dispensando flags especiais (`ignorarMinimo`).

---

## Resumo Comparativo

| Cenário | Tiers Exibidos (Ex: 25, 50, 90) | Opção Personalizada | Regra de Validação Custom |
| :--- | :--- | :--- | :--- |
| **Cadastro** | Todos (25, 50, 90) | Botão Ativável | Deve ser > 90 |
| **Upgrade (20 pass.)** | Todos (25, 50, 90) | Oculta | N/A |
| **Upgrade (40 pass.)** | 50, 90 (25 oculto) | Oculta | N/A (Forçado a pegar 50) |
| **Upgrade (100 pass.)**| Nenhhum | Única Opção | > 90 (Naturalmente atendido) |
