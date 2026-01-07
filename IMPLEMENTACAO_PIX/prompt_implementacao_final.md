# PLANO MESTRE: Implementação de Precificação, Pro-Rata e Validação PIX

Este documento consolida TODAS as instruções técnicas para a implementação.

## 1. Banco de Dados (Supabase)
**Status**: ✅ O usuário já executou o SQL.
**Verificação**:
- Tabela `pix_validacao_pendente` existe.
- Colunas `chave_pix`, `status_chave_pix`, etc., existem em `public.usuarios`.

**Configuração Obrigatória (`public.configuracao_interna`)**:
Garanta que estas chaves existam:
- `PRO_RATA_VALOR_MINIMO`: `0.01`
- `VALOR_INCREMENTO_PASSAGEIRO_EXCESSO`: `2.50` (Custo por passageiro extra > 90)
- `PRO_RATA_DIAS_MES`: `30`

> **Nota**: `ENTERPRISE_LIMITE_BASE` e `ENTERPRISE_TAMANHO_BLOCO` são obsoletos e não devem ser usados. O sistema deve buscar o limite base (90) dinamicamente na tabela `planos`.

---

## 2. Backend (Node.js/TypeScript)

### A. Precificação Dinâmica (Enterprise)
**Arquivo Alvo**: `src/services/planos.service.ts` (ou onde for calculado o preço).

**Lógica**:
1. Se `passageiros <= 90` (ou maior plano fixo): Busca preço direto na tabela `planos`.
2. Se `passageiros > 90`:
   - Buscar o maior plano fixo (Ex: 90 pax, R$ 197,00).
   - `Preço = PreçoBase + ((Passageiros - 90) * VALOR_INCREMENTO_PASSAGEIRO_EXCESSO)`.

### B. Cálculo Pro-Rata (Mudança de Plano)
**Arquivo Alvo**: `src/services/assinatura.service.ts`.

**Fórmula**:
```typescript
diasNoMes = 30; // Config
diferencaMensal = (novoPreco - precoAtual);
valorDia = diferencaMensal / diasNoMes;
proRata = valorDia * diasRestantes;
```

**Regras de Ouro**:
1. **Downgrade ou Troca Equivalente**: Se `proRata <= 0`, o valor a cobrar é **R$ 0,00**. Não existe crédito/estorno.
2. **Valor Mínimo**: Se `proRata > 0` mas `proRata < 0.01`, cobrar **R$ 0,01** (para garantir fluxo transacional).

### C. Validação de Chave PIX (Micro-Pagamento)
**Arquivo Alvo**: `src/services/usuario.service.ts` e `webhook.controller.ts`.

**Fluxo de Validação**:
1. **Início (`cadastrarChavePix`)**:
   - Valide formato (Regex).
   - Salve `status_chave_pix = 'PENDENTE_VALIDACAO'`.
   - Gere UUID `x-id-idempotente`.
   - Salve em `pix_validacao_pendente`.
   - Chame API Inter (`POST /pix`) enviando **R$ 0,01** para a chave.

2. **Webhook (`receberWebhookPix`)**:
   - Recebe notificação do Inter.
   - Busca detalhes (`GET /pix/{e2eId}`).
   - Extrai `nome` e `cpf` do titular da conta destino.
   - **Compara** com os dados do motorista no sistema.
     - *Nome*: Use similaridade (leve tolerância).
     - *CPF*: Exato.
   - **Resultado**:
     - *Sucesso*: `status_chave_pix = 'VALIDADA'`.
     - *Falha*: `status_chave_pix = 'FALHA_VALIDACAO'`.

---

## 3. Frontend (React)

### A. Dialog de Bloqueio (Obrigatoriedade)
**Componente**: `PixKeyDialog.tsx` / `LayoutContext.tsx`

**Lógica de Exibição ("Trava")**:
O Dialog deve abrir e **não permitir fechar** (remover botão X, cobrir backdrop) SE:
1. `user.plano.exige_pix === true` (Geralmente Profissional).
2. `user.status_chave_pix !== 'VALIDADA'`.

**Estados da Interface**:
- **Padrão**: Input de chave.
- **Validando**: Spinner com texto "Validando sua chave com o banco... (pode levar alguns segundos)".
- **Sucesso**: Check verde, fecha dialog.
- **Erro**: "Esta chave não pertence ao titular X. Tente outra."

---

## 4. Checklist de Entrega

- [ ] Backend: Cálculo Enterprise correto (simular 100 pax).
- [ ] Backend: Pro-Rata correto (simular upgrade faltando 1 dia e 15 dias).
- [ ] Backend: Fluxo PIX enviando R$ 0,01.
- [ ] Backend: Webhook validando titularidade.
- [ ] Frontend: Dialog bloqueante funcionando para Profissional sem chave.
