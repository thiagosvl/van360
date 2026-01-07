# Ajuste de Configuração do Banco de Dados (Modelo Piso Fixo R$ 2,50)

O modelo de Piso Fixo de R$ 2,50 por passageiro adicional é o mais seguro. Para implementá-lo, as chaves de configuração devem ser ajustadas.

## 1. Chaves Atuais e Correções Necessárias

| Chave | Valor Atual | Valor Correto | Ação | Justificativa |
| :--- | :--- | :--- | :--- | :--- |
| `PRO_RATA_VALOR_MINIMO` | `0.1` | `0.01` | **CORRIGIR** | O valor mínimo deve ser R$ 0,01 para garantir que o fluxo PIX seja sempre disparado, evitando requisições de R$ 0,00 que podem falhar na API do Inter. Em cenários de pro-rata com poucos dias restantes e pequena diferença de preço, o cálculo pode resultar em valores muito baixos ou zero, o que travaria o fluxo de pagamento. |
| `ENTERPRISE_INCREMENTO_BLOCO` | `70` | `2.50` | **RENOMEAR/CORRIGIR** | Esta chave deve ser renomeada para `ENTERPRISE_INCREMENTO_PASSAGEIRO` e seu valor deve ser o custo por passageiro adicional (R$ 2,50). |
| `PRO_RATA_DIAS_MES` | `30` | `30` | **MANTER** | Valor correto para o cálculo pro-rata. |

## 2. Estrutura do Banco de Dados para Validação PIX

Os comandos SQL para criar a nova tabela `pix_validacao_pendente` e adicionar as colunas de validação PIX à tabela `public.usuarios` foram fornecidos no arquivo `sql_implementacao_pix.sql`.

É crucial que os campos relacionados ao PIX na tabela `public.usuarios` (`chave_pix`, `status_chave_pix`, `chave_pix_validada_em`, `nome_titular_pix_validado`, `cpf_cnpj_titular_pix_validado`) sejam configurados como **opcionais (NULL)**. Isso se deve ao fato de que nem todos os planos exigirão a chave PIX do motorista, e a obrigatoriedade será controlada pela lógica de negócio no frontend e backend, conforme o plano do usuário.

## 3. Conclusão do Ajuste e Lógica de Precificação Dinâmica

O modelo de precificação para quantidades acima do maior plano pré-definido (90 passageiros) será baseado em um **custo fixo por passageiro adicional de R$ 2,50**.

**Atenção:** A chave `ENTERPRISE_LIMITE_BASE` **não é necessária** como uma configuração separada na tabela `configuracao_interna`. O backend deve **buscar dinamicamente** o preço e o limite de passageiros do maior plano pré-definido (atualmente 90 passageiros) diretamente da tabela `planos` do Supabase. Isso evita redundância, simplifica a manutenção e garante que a lógica esteja sempre alinhada com os planos cadastrados.

**Ação de Implementação:**

1.  Executar os comandos SQL do arquivo `sql_implementacao_pix.sql` no Supabase.
2.  Atualizar os valores das chaves existentes e renomear conforme a tabela acima (`PRO_RATA_VALOR_MINIMO`, `ENTERPRISE_INCREMENTO_PASSAGEIRO`).
3.  A função `calcularPrecoEnterprise` deve ser reescrita para:
    *   **Obter dinamicamente** o preço e o limite de passageiros do maior plano pré-definido (atualmente 90 passageiros) da tabela `planos`.
    *   Utilizar a chave `ENTERPRISE_INCREMENTO_PASSAGEIRO` (que virá da `configuracao_interna`) para o cálculo do valor adicional.
    *   A fórmula será:
    $$
    \text{Preço}(n) = \text{Preço do Maior Plano Pré-definido} + (n - \text{Limite do Maior Plano Pré-definido}) \times \text{ENTERPRISE_INCREMENTO_PASSAGEIRO}
    $$
