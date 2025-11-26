# Fluxos de Teste Completos - Sistema de Planos e Cobranças Automáticas

## 📋 Índice
1. [Fluxo 1: Cadastro Gratuito → Upgrade Essencial → Upgrade Completo](#fluxo-1)
2. [Fluxo 2: Cadastro Essencial → Upgrade Completo](#fluxo-2)
3. [Fluxo 3: Cadastro Completo Direto](#fluxo-3)
4. [Fluxo 4: Downgrade Completo → Essencial → Gratuito](#fluxo-4)
5. [Fluxo 5: Mudanças Dentro do Completo (Sub-planos)](#fluxo-5)
6. [Fluxo 6: Plano Personalizado - Aumento e Redução](#fluxo-6)
7. [Fluxo 7: Cenários de Seleção Manual de Passageiros](#fluxo-7)
8. [Fluxo 8: Reativação de Passageiros e Validações](#fluxo-8)

---

## 🔵 Fluxo 1: Cadastro Gratuito → Upgrade Essencial → Upgrade Completo {#fluxo-1}

### Pré-requisitos
- Banco de dados limpo
- Planos configurados:
  - Gratuito: 5 passageiros (sempre limitado)
  - Essencial: 
    - Trial: limite de passageiros (ex: 5)
    - Ativo: passageiros ilimitados
  - Completo: Sub-planos (ex: 25, 50, 90) + Personalizado (mínimo 91) - passageiros sempre ilimitados

### Passo 1: Cadastro no Plano Gratuito
**Ações:**
1. Acessar `/cadastro`
2. Preencher dados pessoais (nome, CPF, email, telefone, senha)
3. Selecionar "Plano Gratuito"
4. Finalizar cadastro

**Resultado Esperado:**
- ✅ Usuário criado com sucesso
- ✅ Assinatura ativa no plano Gratuito
- ✅ Limite de 5 passageiros
- ✅ Redirecionado para `/inicio`
- ✅ Não há opção de cobranças automáticas

**Verificações no Banco:**
```sql
-- Verificar assinatura
SELECT * FROM assinaturas_usuarios WHERE usuario_id = '...' AND ativo = true;
-- Deve ter: plano_id = Gratuito, limite_passageiros = 5

-- Verificar usuário
SELECT * FROM usuarios WHERE email = '...';
-- Deve ter: ativo = true
```

---

### Passo 2: Cadastrar Passageiros (Gratuito)
**Ações:**
1. Acessar `/passageiros`
2. Cadastrar 3 passageiros
3. Verificar limite

**Resultado Esperado:**
- ✅ 3 passageiros cadastrados com sucesso
- ✅ Contador mostra "3/5 passageiros"
- ✅ Campo "Enviar cobranças automáticas" **NÃO** aparece (apenas no Completo)
- ✅ Pode cadastrar mais 2 passageiros

**Verificações:**
- Lista de passageiros mostra 3 itens
- Banner de upgrade pode aparecer quando próximo do limite

---

### Passo 3: Upgrade para Essencial
**Ações:**
1. Acessar `/planos`
2. Selecionar "Plano Essencial"
3. Confirmar upgrade
4. Gerar e pagar PIX

**Resultado Esperado:**
- ✅ Dialog de pagamento PIX aparece
- ✅ QR Code e código PIX disponíveis
- ✅ Contador de 10 minutos inicia
- ✅ Mensagem: "Estamos aguardando a confirmação do seu pagamento..."
- ✅ Após pagamento confirmado (webhook):
  - Assinatura atualizada para Essencial
  - Status muda para 'ativa' (não mais 'trial')
  - **Passageiros agora são ilimitados** (sem limite)
  - Redirecionado para `/assinatura`
  - Toast de sucesso

**Verificações no Banco:**
```sql
-- Antes do pagamento
SELECT * FROM assinaturas_usuarios WHERE usuario_id = '...' AND ativo = false;
-- Deve ter: plano_id = Essencial, status = 'pendente_pagamento'

-- Após pagamento (webhook)
SELECT * FROM assinaturas_usuarios WHERE usuario_id = '...' AND ativo = true;
-- Deve ter: plano_id = Essencial, status = 'ativa' (não 'trial')
-- Nota: limite_passageiros pode estar no plano, mas não é aplicado quando status = 'ativa'
```

---

### Passo 4: Usar Benefícios do Essencial
**Ações:**
1. Cadastrar mais passageiros (sem limite)
2. Verificar funcionalidades disponíveis
3. Tentar usar funcionalidades do Completo (se houver)

**Resultado Esperado:**
- ✅ **Pode cadastrar passageiros ilimitados** (sem limite)
- ✅ ProgressBar mostra "Ilimitado" (não mostra contador X/Y)
- ✅ Funcionalidades do Essencial disponíveis
- ✅ Campo "Enviar cobranças automáticas" **NÃO** aparece
- ✅ Alertas de upgrade para Completo podem aparecer

---

### Passo 5: Upgrade para Completo (Sub-plano 25)
**Ações:**
1. Acessar `/planos`
2. Selecionar "Plano Completo"
3. Selecionar sub-plano "Até 25 passageiros"
4. Confirmar upgrade
5. Gerar e pagar PIX

**Cenário A: Usuário tem ≤ 25 passageiros ativos**
**Resultado Esperado:**
- ✅ Dialog de pagamento PIX aparece **IMEDIATAMENTE** (não precisa seleção manual)
- ✅ QR Code e código PIX disponíveis
- ✅ Após pagamento confirmado (webhook):
  - Assinatura atualizada para Completo (sub-plano 25)
  - **Passageiros ativos são ativados automaticamente** para cobranças automáticas
  - `enviar_cobranca_automatica = true` para todos os passageiros ativos
  - `motivo_desativacao = NULL` para os ativados
  - Redirecionado para `/assinatura`
  - Toast de sucesso

**Cenário B: Usuário tem > 25 passageiros ativos (ex: 30)**
**Resultado Esperado:**
- ✅ **Dialog de seleção de passageiros aparece PRIMEIRO** (ANTES de gerar PIX)
- ✅ Lista mostra todos os passageiros ativos (30)
- ✅ Passageiros já com `enviar_cobranca_automatica = true` vêm pré-marcados
- ✅ Contador: "X selecionados / 25 permitidos"
- ✅ Usuário seleciona 25 passageiros
- ✅ Ao confirmar seleção:
  - **PIX é gerado e dialog de pagamento aparece**
  - 25 passageiros ficam com `enviar_cobranca_automatica = true`
  - 5 passageiros ficam com `enviar_cobranca_automatica = false` e `motivo_desativacao = 'automatico'`
  - Toast: "X passageiros ativados, Y desativados"
- ✅ Após pagamento confirmado (webhook):
  - Assinatura atualizada para Completo (sub-plano 25)
  - Passageiros já foram atualizados na confirmação da seleção

**Verificações no Banco:**
```sql
-- Após pagamento e seleção
SELECT 
  COUNT(*) FILTER (WHERE enviar_cobranca_automatica = true) as ativos,
  COUNT(*) FILTER (WHERE enviar_cobranca_automatica = false AND motivo_desativacao = 'automatico') as desativados_auto
FROM passageiros 
WHERE usuario_id = '...' AND ativo = true;
-- Ativos deve ser ≤ 25
```

---

## 🟢 Fluxo 2: Cadastro Essencial → Upgrade Completo {#fluxo-2}

### Pré-requisitos
- Banco de dados limpo

### Passo 1: Cadastro no Plano Essencial
**Ações:**
1. Acessar `/cadastro`
2. Preencher dados pessoais
3. Selecionar "Plano Essencial"
4. Gerar e pagar PIX
5. Finalizar cadastro

**Resultado Esperado:**
- ✅ Usuário criado
- ✅ Assinatura pendente criada
- ✅ Após pagamento: assinatura ativa no Essencial (status = 'ativa')
- ✅ **Passageiros ilimitados** (sem limite quando status = 'ativa')

---

### Passo 2: Cadastrar Passageiros e Upgrade para Completo
**Ações:**
1. Cadastrar 15 passageiros
2. Acessar `/planos`
3. Selecionar "Plano Completo" → Sub-plano "Até 50 passageiros"
4. Confirmar upgrade
5. Pagar PIX

**Resultado Esperado:**
- ✅ Dialog de pagamento PIX aparece **IMEDIATAMENTE** (não precisa seleção manual)
- ✅ Como 15 < 50, **ativação automática** de todos os 15 passageiros após pagamento
- ✅ Não aparece dialog de seleção
- ✅ Após pagamento confirmado (webhook): todos os passageiros com `enviar_cobranca_automatica = true`

---

## 🟣 Fluxo 3: Cadastro Completo Direto {#fluxo-3}

### Passo 1: Cadastro no Plano Completo
**Ações:**
1. Acessar `/cadastro`
2. Preencher dados pessoais
3. Selecionar "Plano Completo"
4. Escolher sub-plano ou quantidade personalizada
5. Gerar e pagar PIX

**Cenário A: Sub-plano predefinido**
**Resultado Esperado:**
- ✅ Assinatura criada
- ✅ Após pagamento: assinatura ativa
- ✅ Como não há passageiros ainda, não há ativação automática

**Cenário B: Quantidade personalizada (ex: 100)**
**Resultado Esperado:**
- ✅ Slider mostra mínimo (ex: 91) até 1000
- ✅ Input permite valor exato
- ✅ Preço calculado dinamicamente
- ✅ Após pagamento: assinatura ativa com franquia = 100

---

## 🔴 Fluxo 4: Downgrade Completo → Essencial → Gratuito {#fluxo-4}

### Pré-requisitos
- Usuário no Plano Completo (sub-plano 50)
- 30 passageiros cadastrados
- 30 passageiros com `enviar_cobranca_automatica = true`

### Passo 1: Downgrade para Essencial
**Ações:**
1. Acessar `/planos`
2. Selecionar "Plano Essencial"
3. Confirmar downgrade no dialog

**Resultado Esperado:**
- ✅ Dialog de confirmação aparece com mensagem apropriada
- ✅ Ao confirmar:
  - Assinatura atualizada para Essencial **IMEDIATAMENTE** (sem pagamento)
  - **Flags dos passageiros NÃO são alteradas**
  - `enviar_cobranca_automatica` permanece `true` para os 30 passageiros
  - `motivo_desativacao` permanece como estava
  - Redirecionado para `/assinatura`
  - Toast: "Assinatura atualizada com sucesso"

**Verificações:**
- Campo "Enviar cobranças automáticas" **NÃO** aparece mais (apenas no Completo)
- Passageiros continuam com a flag, mas o sistema não processa cobranças automáticas (verificação de plano)

---

### Passo 2: Downgrade para Gratuito
**Ações:**
1. Acessar `/planos`
2. Selecionar "Plano Gratuito"
3. Confirmar downgrade

**Resultado Esperado:**
- ✅ Mesmo comportamento: flags não são alteradas
- ✅ Limite reduz para 5 passageiros
- ✅ Se tiver mais de 5 passageiros, pode continuar usando, mas não pode cadastrar mais

---

## 🟡 Fluxo 5: Mudanças Dentro do Completo (Sub-planos) {#fluxo-5}

### Pré-requisitos
- Usuário no Plano Completo (sub-plano 25)
- 20 passageiros cadastrados
- 20 passageiros com `enviar_cobranca_automatica = true`

### Passo 1: Upgrade para Sub-plano 50
**Ações:**
1. Acessar `/planos`
2. Selecionar "Plano Completo" → Sub-plano "Até 50 passageiros"
3. Confirmar upgrade
4. Pagar PIX

**Resultado Esperado:**
- ✅ Dialog de pagamento PIX aparece **IMEDIATAMENTE** (não precisa seleção manual)
- ✅ Como 20 < 50, **ativação automática** de todos os 20 passageiros após pagamento
- ✅ Não precisa de seleção manual
- ✅ Após pagamento confirmado (webhook): todos continuam com `enviar_cobranca_automatica = true`

---

### Passo 2: Cadastrar Mais Passageiros e Downgrade
**Ações:**
1. Cadastrar mais 20 passageiros (total = 40)
2. Ativar cobranças automáticas para todos (40 passageiros)
3. Fazer downgrade para sub-plano 25

**Resultado Esperado:**
- ✅ Dialog de confirmação de downgrade aparece
- ✅ Ao confirmar:
  - **Dialog de seleção de passageiros aparece ANTES de fazer downgrade**
  - Lista mostra os 40 passageiros com `enviar_cobranca_automatica = true`
  - Todos vêm pré-marcados
  - Contador: "40 selecionados / 25 permitidos"
  - Usuário desmarca 15 passageiros (deixa 25 selecionados)
  - Ao confirmar seleção:
    - **Downgrade é feito E passageiros são atualizados de uma vez**
    - 25 passageiros ficam com `enviar_cobranca_automatica = true`
    - 15 passageiros ficam com `enviar_cobranca_automatica = false` e `motivo_desativacao = 'automatico'`
    - Redirecionado para `/assinatura`
    - Toast: "X passageiros ativados, Y desativados"

**Verificações no Banco:**
```sql
-- Verificar que downgrade foi feito
SELECT * FROM assinaturas_usuarios WHERE usuario_id = '...' AND ativo = true;
-- Deve ter: franquia_contratada_cobrancas = 25

-- Verificar passageiros
SELECT 
  COUNT(*) FILTER (WHERE enviar_cobranca_automatica = true) as ativos,
  COUNT(*) FILTER (WHERE enviar_cobranca_automatica = false AND motivo_desativacao = 'automatico') as desativados
FROM passageiros 
WHERE usuario_id = '...' AND ativo = true;
-- Ativos = 25, Desativados = 15
```

---

### Passo 3: Upgrade Novamente para Sub-plano 50
**Ações:**
1. Acessar `/planos`
2. Selecionar sub-plano 50
3. Confirmar upgrade
4. Pagar PIX

**Resultado Esperado:**
- ✅ **Dialog de seleção aparece PRIMEIRO** (ANTES de gerar PIX)
- ✅ 40 passageiros disponíveis (25 ativos + 15 desativados automaticamente)
- ✅ Passageiros já ativos (25) vêm pré-marcados
- ✅ Passageiros desativados automaticamente (15) aparecem disponíveis para seleção
- ✅ Usuário pode selecionar até 50
- ✅ Ao confirmar seleção:
  - **PIX é gerado e dialog de pagamento aparece**
  - Passageiros selecionados são ativados
- ✅ Após pagamento confirmado (webhook):
  - Assinatura atualizada para sub-plano 50
  - Passageiros já foram atualizados na confirmação da seleção

---

## 🟠 Fluxo 6: Plano Personalizado - Aumento e Redução {#fluxo-6}

### Pré-requisitos
- Usuário no Plano Completo Personalizado (100 passageiros)
- 80 passageiros cadastrados
- 80 passageiros com `enviar_cobranca_automatica = true`

### Passo 1: Aumentar Quantidade Personalizada (100 → 150)
**Ações:**
1. Acessar `/planos`
2. Selecionar "Plano Completo" → "Personalizar"
3. Ajustar slider para 150
4. Confirmar
5. Pagar PIX

**Resultado Esperado:**
- ✅ Dialog de pagamento PIX aparece **IMEDIATAMENTE** (não precisa seleção manual)
- ✅ Como 80 < 150, **ativação automática** de todos os 80 passageiros após pagamento confirmado (webhook)
- ✅ Não precisa de seleção manual
- ✅ Após pagamento confirmado (webhook): todos continuam ativos

---

### Passo 2: Reduzir Quantidade Personalizada (150 → 60)
**Ações:**
1. Acessar `/planos`
2. Selecionar "Personalizar"
3. Ajustar slider para 60
4. Confirmar

**Resultado Esperado:**
- ✅ Dialog de confirmação de downgrade aparece
- ✅ Ao confirmar:
  - **Dialog de seleção aparece ANTES de fazer downgrade**
  - Lista mostra os 80 passageiros ativos
  - Todos vêm pré-marcados
  - Contador: "80 selecionados / 60 permitidos"
  - Usuário desmarca 20 passageiros
  - Ao confirmar:
    - **Downgrade é feito E passageiros são atualizados de uma vez**
    - 60 passageiros ficam ativos
    - 20 passageiros ficam desativados (`motivo_desativacao = 'automatico'`)
    - **NÃO gera PIX** (downgrade é imediato)
    - Redirecionado para `/assinatura`

---

### Passo 3: Tentar Contratar Mesma Quantidade
**Ações:**
1. Acessar `/planos`
2. Selecionar "Personalizar"
3. Ajustar slider para 60 (quantidade atual)
4. Confirmar

**Resultado Esperado:**
- ✅ Toast informativo: "Você já possui 60 passageiros contratados. Esta é a quantidade atual do seu plano."
- ✅ Nenhuma ação é executada
- ✅ Não gera PIX
- ✅ Não faz downgrade

---

## 🔵 Fluxo 7: Cenários de Seleção Manual de Passageiros {#fluxo-7}

### Cenário A: Upgrade com Passageiros Manualmente Desativados
**Pré-requisitos:**
- Usuário no Plano Essencial
- 30 passageiros cadastrados
- Upgrade para Completo (sub-plano 25)

**Ações:**
1. Fazer upgrade para Completo (sub-plano 25)
2. **Dialog de seleção aparece PRIMEIRO** (ANTES de gerar PIX)
3. Selecionar passageiros
4. Confirmar seleção
5. PIX é gerado e pagar

**Resultado Esperado:**
- ✅ **Dialog de seleção aparece PRIMEIRO** (ANTES de gerar PIX)
- ✅ Lista mostra 30 passageiros (todos os ativos, independente de `motivo_desativacao`)
- ✅ Passageiros com `enviar_cobranca_automatica = true` vêm pré-marcados
- ✅ Passageiros com `motivo_desativacao = 'manual'` **NÃO** vêm marcados (não aparecem na lista de upgrade)
- ✅ Usuário pode selecionar até 25
- ✅ Se selecionar passageiros que estavam desativados, eles são reativados
- ✅ Ao confirmar seleção:
  - **PIX é gerado e dialog de pagamento aparece**
  - Passageiros selecionados são ativados
- ✅ Após pagamento confirmado (webhook):
  - Assinatura atualizada para Completo (sub-plano 25)
  - Passageiros já foram atualizados na confirmação da seleção

---

### Cenário B: Downgrade com Seleção Parcial
**Pré-requisitos:**
- Usuário no Plano Completo (sub-plano 50)
- 45 passageiros com `enviar_cobranca_automatica = true`

**Ações:**
1. Fazer downgrade para sub-plano 25
2. **Dialog de seleção aparece ANTES de fazer downgrade**
3. Selecionar apenas 20 passageiros (menos que o limite)
4. Confirmar seleção

**Resultado Esperado:**
- ✅ **Dialog de seleção aparece ANTES de fazer downgrade**
- ✅ Lista mostra os 45 passageiros com `enviar_cobranca_automatica = true`
- ✅ Todos vêm pré-marcados
- ✅ Contador: "45 selecionados / 25 permitidos"
- ✅ Usuário desmarca 25 passageiros (deixa 20 selecionados)
- ✅ Ao confirmar seleção:
  - **Downgrade é feito E passageiros são atualizados de uma vez**
  - 20 passageiros ficam ativos
  - 25 passageiros ficam desativados (`motivo_desativacao = 'automatico'`)
  - Redirecionado para `/assinatura`
  - Toast: "X passageiros ativados, Y desativados"
- ✅ Usuário pode ativar mais 5 depois se quiser

---

## 🟣 Fluxo 8: Reativação de Passageiros e Validações {#fluxo-8}

### Cenário A: Reativar Passageiro que Excede Franquia
**Pré-requisitos:**
- Usuário no Plano Completo (sub-plano 25)
- 25 passageiros com `enviar_cobranca_automatica = true`
- 5 passageiros com `enviar_cobranca_automatica = false` e `motivo_desativacao = 'automatico'`

**Ações:**
1. Acessar `/passageiros`
2. Tentar reativar cobranças automáticas de um passageiro desativado

**Resultado Esperado:**
- ✅ **Dialog de aviso aparece**: "Excederá o limite de franquia"
- ✅ Mostra: "Limite atual: 25 passageiros"
- ✅ Mostra: "Após esta ação: 26 passageiros"
- ✅ Botões: "Ver Planos" (navega para `/planos`) e "Reativar Sem Cobranças" (ativa o passageiro mas não ativa cobranças automáticas)
- ✅ Se escolher "Reativar Sem Cobranças":
  - Passageiro fica ativo
  - `enviar_cobranca_automatica = false`
  - `motivo_desativacao = 'manual'` (ou permanece como estava)

---

### Cenário B: Cadastrar Novo Passageiro que Excede Franquia
**Pré-requisitos:**
- Usuário no Plano Completo (sub-plano 25)
- 25 passageiros com `enviar_cobranca_automatica = true`

**Ações:**
1. Acessar `/passageiros`
2. Cadastrar novo passageiro
3. Marcar checkbox "Enviar cobranças automáticas"

**Resultado Esperado:**
- ✅ **Aviso inline aparece** ao lado do checkbox
- ✅ Mostra: "Limite atual: 25 passageiros"
- ✅ Botão "Ver Planos" disponível
- ✅ Checkbox **NÃO** é marcado automaticamente
- ✅ Se usuário marcar mesmo assim, o aviso permanece visível
- ✅ Ao salvar sem marcar: passageiro é cadastrado sem cobranças automáticas
- ✅ Ao salvar marcado: **Backend valida e impede** - erro: "Ativar este passageiro excederia a franquia contratada de X passageiros. Você já tem Y passageiros com cobranças automáticas ativas."

---

### Cenário C: Tentar Ativar Cobranças Automáticas em Plano Não-Completo
**Pré-requisitos:**
- Usuário no Plano Essencial

**Ações:**
1. Tentar ativar `enviar_cobranca_automatica` via API ou interface

**Resultado Esperado:**
- ✅ Campo **NÃO** aparece na interface
- ✅ Se tentar via API: erro 400 "Cobranças automáticas estão disponíveis apenas no plano Completo"

---

## ✅ Checklist de Validações Gerais

### Validações de Integridade
- [ ] Nenhuma alteração no banco é feita antes da confirmação do usuário
- [ ] Downgrade + atualização de passageiros acontecem de uma vez (atomicidade)
- [ ] Upgrade gera PIX **APÓS** confirmação da seleção manual (se necessário)
- [ ] PIX só é gerado após usuário confirmar seleção manual (quando necessário)
- [ ] Passageiros são ativados apenas após confirmação do pagamento (webhook)
- [ ] Flags de passageiros não são alteradas em downgrade para Gratuito/Essencial
- [ ] Backend valida franquia ao ativar cobranças automáticas individualmente

### Validações de UI/UX
- [ ] Dialog de pagamento não fecha ao clicar fora ou pressionar ESC
- [ ] Dialog de seleção de passageiros tem busca e contador
- [ ] Avisos inline aparecem corretamente
- [ ] Toasts informativos aparecem nos momentos certos
- [ ] Redirecionamentos acontecem após delays apropriados

### Validações de Dados
- [ ] `motivo_desativacao` é setado corretamente em cada cenário
- [ ] `enviar_cobranca_automatica` reflete o estado correto
- [ ] `franquia_contratada_cobrancas` está sempre atualizado
- [ ] Assinaturas pendentes são limpas corretamente

---

## 📝 Notas para Testes

1. **Ajustar Limites**: Antes de testar, ajustar as franquias dos planos para valores menores (ex: Gratuito: 3, Essencial Trial: 5, Completo: 10, 15, 20)
   - **Nota**: Essencial com status 'ativa' não tem limite de passageiros (ilimitado)
   - **Nota**: Completo sempre tem passageiros ilimitados (limite é apenas para cobranças automáticas)

2. **Webhook de Pagamento**: Para testar pagamentos, usar o endpoint de mock ou configurar webhook real

3. **Tempo de Espera**: Alguns fluxos têm delays (1.5s) antes de redirecionar - aguardar

4. **Realtime**: Verificar se atualizações em tempo real funcionam corretamente

5. **Race Conditions**: Testar seleções rápidas e mudanças de plano para garantir que não há race conditions

---

## 🐛 Problemas Encontrados

_Use esta seção para marcar problemas encontrados durante os testes:_

### Problema 1: [Título]
- **Fluxo**: [Qual fluxo]
- **Passo**: [Qual passo]
- **Descrição**: [O que aconteceu vs o que deveria acontecer]
- **Status**: ⏳ Pendente / ✅ Corrigido

---

**Última atualização**: [Data]
**Versão**: 1.0

