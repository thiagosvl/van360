# Especificação Funcional - Sistema de Rotas Flexíveis (Van360)

Este documento define os requisitos de negócio, fluxos de uso, validações de consistência logística e especificações lógicas da funcionalidade de Rotas Flexíveis. O objetivo principal é dar flexibilidade estruturada para o motorista criar trajetos diários inteligentes e livres de falhas logísticas (como alunos esquecidos na van ou embarques após o destino).

---

## 📌 1. Casos de Uso e Cenários Operacionais

A rota não possui mais um "sentido global" rígido (como antiga "só ida" ou "só volta"). Sob a ótica do sistema, **toda rota é uma sequência livre e ordenada de paradas**, na qual passageiros podem estar indo para a escola ou voltando para casa de forma misturada no mesmo veículo. Cada passageiro figura exatamente uma vez por rota no seu sentido cadastrado (`INDO` ou `VOLTANDO`).

### A. Coleta Residencial (Casas ➔ Escolas)
* **Fluxo:** O motorista inicia a rota vazio, recolhe os passageiros em suas residências (sentido `indo` / Ida) e realiza a entrega coletiva nas respectivas escolas.

### B. Coleta Escolar (Escolas ➔ Casas)
* **Fluxo:** O motorista recolhe os alunos nas escolas de origem (sentido `voltando` / Volta) e realiza as entregas nas suas respectivas residências.

### C. Corrida Mista (Circular / Meio-Dia / Ocorrências Múltiplas)
* **Fluxo:** O motorista recolhe alunos de manhã em uma escola para levar para casa (sentido `voltando`) e, concorrentemente no mesmo trajeto, recolhe alunos do turno da tarde em suas residências para levar para a escola (sentido `indo`). Uma mesma escola pode ser adicionada múltiplas vezes na timeline (ex: Parada 3 = Escola A, Parada 6 = Escola A).

---

## 📐 2. Modelo de Dados de Itinerário

O itinerário é mapeado como uma **sequência ordenada de Paradas Físicas (Nós do Trajeto)** configurada pelo motorista:

```
Itinerário = [ Parada 1, Parada 2, Parada 3, ..., Parada N ]
```

Cada parada física é de um dos tipos:
1. **Residência (Passageiro):** Nó individual para cada passageiro cadastrado na rota. Local de embarque (se o passageiro está `indo`) ou desembarque (se o passageiro está `voltando`).
2. **Escola:** Local de embarque coletivo (de quem está `voltando`) ou desembarque coletivo (de quem está `indo`). Pode figurar uma ou mais vezes no trajeto.

---

## 🧭 3. O Perfil de Deslocamento do Aluno (Sentido)

Cada passageiro em uma rota possui um **Sentido de Deslocamento** individual (`INDO` ou `VOLTANDO`) que determina suas ações em runtime:

### A. Passageiro no Sentido `INDO` (Casa ➔ Escola)
* **Embarque (Coleta):** Ocorre na parada de sua **Residência** (Ação: *Embarcou / Faltou*).
* **Desembarque (Entrega):** Ocorre na parada física de sua **Escola** vinculada (Ação: *Desembarcar*).

### B. Passageiro no Sentido `VOLTANDO` (Escola ➔ Casa)
* **Embarque (Coleta):** Ocorre na parada física de sua **Escola** vinculada (Ação: *Embarcar* coletivo).
* **Desembarque (Entrega):** Ocorre na parada de sua **Residência** (Ação: *Confirmar Entrega* na casa).

---

## 🛡️ 4. Regras de Consistência e Validações (Configuração de Rota)

Para garantir a viabilidade lógica do trajeto e evitar erros operacionais críticos de roteirização, a configuração de rotas (cadastro, edição e reordenação) valida as seguintes regras:

1. **Escola Obrigatória na Timeline:** Qualquer escola associada a um passageiro presente na rota **deve** estar inserida como parada no itinerário.
2. **Precedência Logística da Ida (Casa antes da Escola):** 
   - Se o aluno está no sentido `indo` (Ida), o nó de sua residência deve, obrigatoriamente, estar em uma posição da timeline **anterior** a pelo menos um nó da escola de destino dele.
3. **Precedência Logística da Volta (Escola antes da Casa):** 
   - Se o aluno está no sentido `voltando` (Volta), o nó de sua residência deve, obrigatoriamente, estar em uma posição da timeline **posterior** a pelo menos um nó da escola de origem dele.
4. **Alinhamento e Feedback de Erro:**
   - Caso alguma regra de precedência seja violada, o validador lógico gera mensagens orientativas impeditivas na tela impedindo a gravação ou movimentação inconsistente da rota.

---

## 🚗 5. Dinâmica de Execução e Visualização (Painel do Motorista & Preview)

### A. Associação Inteligente por Posição em Escolas Múltiplas
Quando uma escola figura em uma determinada parada física da timeline (posição `K`), a lista de alunos exibida para aquela parada é calculada com base no escopo posicional:
* **Desembarque (`INDO`):** Exibe apenas os alunos vinculados àquela escola cujo nó de residência está posicionado **antes** da parada `K` e para os quais a parada `K` é a **primeira** ocorrência da escola após a residência deles.
* **Embarque (`VOLTANDO`):** Exibe apenas os alunos vinculados àquela escola cujo nó de residência está posicionado **depois** da parada `K` e para os quais a parada `K` é a **última** ocorrência da escola antes da residência deles.

### B. Exibição da Timeline
* **Ícone da Escola nos Nós:** Todas as paradas físicas do tipo escola exibem o ícone da escola (`School`) no círculo da timeline (em substituição ao número da parada), tanto na configuração quanto no preview, execução e histórico.
* **Exibição Inteligente nos Cards de Configuração:** Na tela de configuração de rota, o card da escola substitui o texto genérico por chips dos alunos vinculados àquela parada física específica (`⬇️ Desembarque` e `⬆️ Embarque`), aplicando exatamente as mesmas regras posicionais da execução.
* **Nomes das Escolas sem Cortes:** A indicação de destino da escola não sofre truncamento.
* **Badges Inline de Sentido:** A indicação de sentido (**"➡️ Ida"** ou **"🏠 Volta"**) é exibida inline ao lado do nome de cada aluno na timeline.
* **Diálogo de Detalhe de Parada (`BaseDialog`):**
  - Utiliza o padrão premium do sistema (`BaseDialog.Header`, `BaseDialog.Body` e `BaseDialog.Footer`).
  - Apresenta metadados refinados (fluxo de destino e sentido do passageiro) e o endereço formatado em destaque.
  - Provê no rodapé (`Footer`) botões de GPS integrados de navegação rápida para Google Maps e Waze.

---

## ⏱️ 6. Tratamento de Ausências

A ausência do passageiro ativa comportamentos de atualização no itinerário:
* **Falta por Sentido na Rota:** Ao marcar falta para um aluno em seu nó ativo (residência ou escola), o nó é marcado como `AUSENTE`, salvando a data/hora do registro e finalizando a pendência daquele passageiro na corrida.
