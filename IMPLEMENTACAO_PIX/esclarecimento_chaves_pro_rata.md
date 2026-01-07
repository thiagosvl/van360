## Esclarecimento: Chaves de Configuração e Cenários de Pro-Rata

### 1. Chave `ENTERPRISE_LIMITE_BASE`

**A necessidade da chave `ENTERPRISE_LIMITE_BASE` foi reavaliada e concluímos que ela não é necessária como uma configuração separada na tabela `configuracao_interna`.**

**Justificativa:**

*   **Busca Dinâmica:** O backend já possui a capacidade de buscar o maior plano pré-definido (atualmente 90 passageiros) diretamente da tabela `planos`. Isso significa que o limite base para o cálculo de planos personalizados (91+ passageiros) pode ser obtido em tempo real do plano com o maior `limite_passageiros` e `preco` na tabela `planos`.
*   **Redundância:** Manter uma chave `ENTERPRISE_LIMITE_BASE` na `configuracao_interna` criaria uma redundância e um ponto de falha potencial. Se o limite do maior plano fosse alterado na tabela `planos`, seria necessário lembrar de atualizar também essa chave, o que aumenta o risco de inconsistências.
*   **Simplificação:** A remoção dessa chave simplifica a gestão das configurações e torna o sistema mais robusto, pois ele sempre se baseará na fonte primária de verdade: a tabela `planos`.

**Ação:** A chave `ENTERPRISE_LIMITE_BASE` foi removida das recomendações de configuração na `configuracao_interna`.

### 2. Cenários de Pro-Rata

O cálculo pro-rata é fundamental para garantir que o motorista pague apenas pelo período de uso do novo plano e que a Van360 receba o valor justo. Abaixo, apresentamos uma simulação detalhada de diversos cenários, considerando um mês de 30 dias e um `PRO_RATA_VALOR_MINIMO` de R$ 0,01.

**Tabela de Preços de Referência:**

| Passageiros | Preço Mensal (R$) |
| :---------- | :---------------- |
| 25 | R$ 87.00 |
| 60 | R$ 127.00 |
| 90 | R$ 197.00 |
| 100 | R$ 222.00 |
| 150 | R$ 347.00 |
| 200 | R$ 472.00 |
| 300 | R$ 722.00 |
| 500 | R$ 1222.00 |

**Simulação de Cenários de Pro-Rata:**

| Cenário | Plano Atual (Passageiros) | Preço Atual (R$) | Plano Novo (Passageiros) | Preço Novo (R$) | Dias Restantes | Pro-Rata (R$) |
| :------ | :------------------------ | :--------------- | :----------------------- | :-------------- | :------------- | :------------ |
| 1 | 25 | R$ 87.00 | 60 | R$ 127.00 | 29 | R$ 38.67 |
| 2 | 25 | R$ 87.00 | 60 | R$ 127.00 | 15 | R$ 20.00 |
| 3 | 25 | R$ 87.00 | 60 | R$ 127.00 | 1 | R$ 1.33 |
| 4 | 60 | R$ 127.00 | 90 | R$ 197.00 | 29 | R$ 67.67 |
| 5 | 60 | R$ 127.00 | 90 | R$ 197.00 | 15 | R$ 35.00 |
| 6 | 60 | R$ 127.00 | 90 | R$ 197.00 | 1 | R$ 2.33 |
| 7 | 90 | R$ 197.00 | 100 | R$ 222.00 | 29 | R$ 24.17 |
| 8 | 90 | R$ 197.00 | 100 | R$ 222.00 | 15 | R$ 12.50 |
| 9 | 90 | R$ 197.00 | 100 | R$ 222.00 | 1 | R$ 0.83 |
| 10 | 100 | R$ 222.00 | 102 | R$ 227.00 | 29 | R$ 4.83 |
| 11 | 100 | R$ 222.00 | 102 | R$ 227.00 | 15 | R$ 2.50 |
| 12 | 100 | R$ 222.00 | 102 | R$ 227.00 | 1 | R$ 0.17 |
| 13 | 90 | R$ 197.00 | 150 | R$ 347.00 | 29 | R$ 145.00 |
| 14 | 90 | R$ 197.00 | 150 | R$ 347.00 | 15 | R$ 75.00 |
| 15 | 90 | R$ 197.00 | 150 | R$ 347.00 | 1 | R$ 5.00 |
| 16 | 90 | R$ 197.00 | 91 | R$ 199.50 | 1 | R$ 0.08 |
| 17 | 90 | R$ 197.00 | 91 | R$ 199.50 | 2 | R$ 0.17 |
| 18 | 60 | R$ 127.00 | 25 | R$ 87.00 | 15 | R$ 0.00 |
| 19 | 90 | R$ 197.00 | 60 | R$ 127.00 | 1 | R$ 0.00 |
| 20 | 100 | R$ 222.00 | 90 | R$ 197.00 | 29 | R$ 0.00 |

**Observações:**

*   **Valor Mínimo (R$ 0,01):** Cenários como o 16 e 17 mostram que, mesmo com uma diferença de preço pequena e poucos dias restantes, o valor pro-rata é sempre maior ou igual a R$ 0,01, garantindo que o fluxo de pagamento não seja interrompido por um valor zero.
*   **Downgrade (R$ 0,00):** Cenários 18, 19 e 20 demonstram que downgrades não geram cobrança pro-rata, alinhado com a regra de negócio de não cobrar por redução de plano ou por upgrade de franquia com mesmo preço.
*   **Upgrade Suave:** A transição para planos personalizados (91+ passageiros) é suave, com o motorista pagando apenas o valor proporcional ao aumento de capacidade, sem saltos abruptos.

Este modelo garante transparência, justiça para o motorista e proteção da receita para a Van360.
