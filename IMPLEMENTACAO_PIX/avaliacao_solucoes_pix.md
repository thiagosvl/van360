# Avaliação de Soluções Técnicas para Validação de Chave PIX

Para resolver o problema da Van360, avaliamos duas abordagens principais:

## 1. Solução via API de Terceiros (Consulta DICT)

Utilizar APIs de empresas como **Celcoin**, **OpenPix** ou **Bankly** que possuem acesso direto ao DICT do Banco Central.

### Prós:
-   **Validação em Tempo Real:** O motorista digita a chave e o sistema já mostra o nome e o banco dele.
-   **Segurança Máxima:** Garante que a chave existe e pertence ao motorista antes mesmo de salvar no banco.
-   **Experiência do Usuário (UX):** Sensação de profissionalismo e segurança.

### Contras:
-   **Custo:** Geralmente cobram por consulta (ex: R$ 0,10 a R$ 0,50 por consulta).
-   **Complexidade de Integração:** Mais uma API para gerenciar e manter.

---

## 2. Solução via Fluxo de Confirmação Interna (O "Pulo do Gato")

Como a API do Banco Inter não permite consulta direta sem pagamento, podemos usar um fluxo de **"Micro-Pagamento de Validação"**.

### Como funciona:
1.  O motorista cadastra a chave.
2.  O sistema envia um PIX de **R$ 0,01** para essa chave via API do Inter.
3.  A API do Inter retorna os dados do recebedor (Nome e CPF mascarado) no detalhe da transação efetuada.
4.  O sistema compara esses dados com o cadastro do motorista. Se bater, a chave é marcada como **"Validada"**.

### Prós:
-   **Custo Zero (ou quase):** Você gasta apenas R$ 0,01 (que vai para o próprio motorista).
-   **Sem APIs Extras:** Usa apenas a infraestrutura que você já tem (Banco Inter).
-   **Validação Real:** Se o PIX de R$ 0,01 caiu, a chave é 100% válida.

### Contras:
-   **Não é Instantâneo:** O motorista precisa esperar alguns segundos/minutos para a validação ser concluída.

---

## Recomendação Van360: Modelo Híbrido de Confirmação

Sugiro a **Solução 2 (Micro-Pagamento)** como padrão inicial, pois ela resolve o problema sem adicionar custos fixos de APIs de terceiros. Para o motorista, o fluxo seria: *"Cadastre sua chave e enviaremos R$ 0,01 para validar sua conta em instantes"*. Isso gera até uma percepção positiva de que o sistema "realmente funciona".
