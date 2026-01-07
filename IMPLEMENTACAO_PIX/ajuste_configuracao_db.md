# Ajuste de Configuração do Banco de Dados (Modelo Piso Fixo R$ 2,50)

O modelo de Piso Fixo de R$ 2,50 por passageiro adicional é o mais seguro. Para implementá-lo, as chaves de configuração devem ser ajustadas.

## 1. Chaves Atuais e Correções Necessárias

| Chave | Valor Atual | Valor Correto | Ação | Justificativa |
| :--- | :--- | :--- | :--- | :--- |
| `PRO_RATA_VALOR_MINIMO` | `0.1` | `0.01` | **CORRIGIR** | O valor mínimo deve ser R$ 0,01 para garantir o fluxo PIX. R$ 0,10 é aceitável, mas R$ 0,01 é o mínimo técnico. |
| `ENTERPRISE_INCREMENTO_BLOCO` | `70` | `2.50` | **CORRIGIR** | Este valor deve ser o custo por passageiro adicional (R$ 2,50), e não o custo por bloco. |
| `ENTERPRISE_TAMANHO_BLOCO` | `30` | `1` | **CORRIGIR** | O tamanho do bloco deve ser 1, pois o cálculo é por passageiro, e não por bloco de 30. |
| `PRO_RATA_DIAS_MES` | `30` | `30` | **MANTER** | Valor correto para o cálculo pro-rata. |

## 2. Chaves Faltantes (Críticas)

| Chave | Valor Sugerido | Ação | Justificativa |
| :--- | :--- | :--- | :--- |
| `ENTERPRISE_PLANO_BASE_ID` | `prof_90` | **ADICIONAR** | ID do plano que serve como base para o cálculo 91+. |
| `ENTERPRISE_LIMITE_BASE` | `90` | **ADICIONAR** | Limite de passageiros do plano base (90). |

## 3. Estrutura do Banco de Dados para Validação PIX

Os comandos SQL para criar a nova tabela `pix_validacao_pendente` e adicionar as colunas de validação PIX à tabela `public.usuarios` foram fornecidos no arquivo `sql_implementacao_pix.sql`.

É crucial que os campos relacionados ao PIX na tabela `public.usuarios` (`chave_pix`, `status_chave_pix`, `chave_pix_validada_em`, `nome_titular_pix_validado`, `cpf_cnpj_titular_pix_validado`) sejam configurados como **opcionais (NULL)**. Isso se deve ao fato de que nem todos os planos exigirão a chave PIX do motorista, e a obrigatoriedade será controlada pela lógica de negócio no frontend e backend, conforme o plano do usuário.

## 4. Conclusão do Ajuste

O modelo anterior de "blocos" (R$ 70 por 30) deve ser totalmente substituído pelo modelo de "piso fixo por passageiro" (R$ 2,50 por 1).

**Ação de Implementação:**

1.  Executar os comandos SQL do arquivo `sql_implementacao_pix.sql` no Supabase.
2.  Atualizar os valores das chaves existentes (`PRO_RATA_VALOR_MINIMO`, `ENTERPRISE_INCREMENTO_BLOCO`, `ENTERPRISE_TAMANHO_BLOCO`).
3.  Adicionar as chaves `ENTERPRISE_PLANO_BASE_ID` e `ENTERPRISE_LIMITE_BASE`.
4.  A função `calcularPrecoEnterprise` deve ser reescrita para usar a fórmula:
    $$
    \text{Preço}(n) = \text{Preço Base 90} + (n - 90) \times \text{R\$ 2,50}
    $$
