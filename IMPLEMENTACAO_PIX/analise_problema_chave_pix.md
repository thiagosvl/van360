# Análise do Problema de Validação de Chave PIX (Van360)

## 1. Entendimento do Cenário

O problema central reside na **confiança da chave PIX cadastrada pelo motorista**. Atualmente, o sistema salva a chave informada sem validação prévia. Isso gera dois riscos críticos:

1.  **PIX Inválido:** A chave digitada está incorreta e não corresponde a nenhuma chave existente no DICT (Diretório de Identificadores de Contas Transacionais). O PIX falha, gerando retrabalho manual e atraso no recebimento do motorista.
2.  **PIX para Terceiros:** A chave digitada, embora válida, pertence a outra pessoa. O PIX é efetuado para um terceiro, resultando em prejuízo financeiro para o motorista (que não recebeu) e para a Van360 (que terá que arcar com o estorno ou novo envio, além de um grave abalo na confiança).

## 2. Impacto no Negócio

-   **Financeiro:** Perdas diretas com estornos, novos envios e custos operacionais de correção.
-   **Operacional:** Aumento significativo do trabalho manual da equipe de suporte para resolver falhas de PIX.
-   **Confiança e Reputação:** O maior impacto. A falha no repasse de dinheiro, especialmente para um terceiro, pode destruir a confiança do motorista na plataforma, levando a churn e má reputação no mercado.

## 3. Requisitos para a Solução

Para resolver o problema, a solução deve garantir:

1.  **Validação da Existência:** A chave PIX informada é uma chave válida e ativa no DICT.
2.  **Validação da Titularidade:** O nome e/ou CPF/CNPJ associado à chave PIX no DICT corresponde aos dados do motorista cadastrado na plataforma Van360.

Sem essas duas validações, o sistema de repasse automático é um risco inaceitável para a saúde financeira e reputacional da Van360.
