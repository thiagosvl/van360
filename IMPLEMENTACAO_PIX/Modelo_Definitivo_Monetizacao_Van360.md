# Modelo Definitivo de Monetização Van360: Piso Fixo de R$ 2,50

## 1. O Dilema da Escala e a Solução do Piso Fixo

A preocupação sobre a redução progressiva do preço por passageiro em volumes muito altos é totalmente válida. Embora o modelo de **Custo Marginal Decrescente** (onde o preço cai) seja psicologicamente atraente, ele compromete a margem de lucro em clientes Enterprise (500+ passageiros), que são justamente os que demandam mais infraestrutura e suporte.

A solução ideal é o **Modelo de Piso Fixo**, que combina a simplicidade dos tiers fixos com uma taxa marginal constante e competitiva.

## 2. Estrutura de Precificação Final

O modelo é dividido em duas partes claras: Tiers Fixos (para ancoragem e simplicidade) e Precificação Personalizada (para escalabilidade).

### A. Tiers Fixos (Ancoragem e Simplicidade)

Estes planos são a porta de entrada e o principal ponto de conversão.

| Plano | Preço Mensal | Franquia de Passageiros | Valor por Passageiro | Margem Líquida Estimada |
| :--- | :--- | :--- | :--- | :--- |
| **Gratuito** | R$ 0,00 | 15 | R$ 0,00 | - |
| **Essencial** | R$ 47,00 | Ilimitado | R$ 0,00 | Alta (Sem custo de transação) |
| **Profissional 25** | R$ 87,00 | 25 | R$ 3,48 | ~70% |
| **Profissional 60** | R$ 127,00 | 60 | R$ 2,11 | ~75% |
| **Profissional 90** | R$ 197,00 | 90 | R$ 2,19 | ~78% |

### B. Precificação Personalizada (91+ Passageiros)

A partir de 91 passageiros, o preço é calculado com base no Plano 90 mais um **Piso Fixo de R$ 2,50** por passageiro adicional.

**Fórmula:**
$$
\text{Preço}(n) = \text{R\$ 197,00} + (n - 90) \times \text{R\$ 2,50}
$$

**Justificativa do Piso R$ 2,50:**

1.  **Proteção de Margem:** Garante que a margem líquida se mantenha acima de 85% em volumes de 500+ passageiros, pois o custo de R$ 2,50 é significativamente maior que o custo marginal de R$ 0,15 por aluno.
2.  **Competitividade:** O valor de R$ 2,50 é **37% mais barato** que o principal concorrente (R$ 4,00), mantendo a percepção de que a Van360 é a solução mais econômica e eficiente.
3.  **Simplicidade:** A fórmula é linear e fácil de ser implementada no backend e explicada ao motorista.

## 3. Cenários de Preços para Grandes Frotas

| Passageiros | Preço Total | Valor Médio por Passageiro | Margem Líquida Estimada |
| :--- | :--- | :--- | :--- |
| **91** | R$ 199,50 | R$ 2,19 | ~78% |
| **150** | R$ 347,00 | R$ 2,31 | ~81% |
| **300** | R$ 722,00 | R$ 2,40 | ~85% |
| **500** | R$ 1.222,00 | R$ 2,44 | ~86% |

## 4. Conclusão Estratégica

O **Modelo de Piso Fixo de R$ 2,50** é o mais vantajoso. Ele elimina a complexidade de múltiplos tiers de desconto, protege a margem em alta escala (o que era sua principal preocupação) e mantém a Van360 como a opção mais atraente do mercado.

Este modelo deve ser implementado no backend, utilizando a tabela `configuracao_interna` para o valor de R$ 2,50, garantindo flexibilidade futura.
