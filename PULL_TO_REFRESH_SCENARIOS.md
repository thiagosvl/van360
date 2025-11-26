# Mapeamento de Cenários - Pull to Refresh

## Cenários e Comportamentos Esperados

### 1. **Scroll Normal (NÃO está no topo)**
   - **Condição**: `scrollTop > 0` (usuário já rolou a página para baixo)
   - **Ação do usuário**: Tenta rolar a página (mouse wheel, touch drag, scrollbar)
   - **Comportamento esperado**: 
     - ✅ Scroll funciona normalmente, sem interferência
     - ✅ Nenhum indicador de pull-to-refresh aparece
     - ✅ Pode rolar para cima e para baixo livremente

### 2. **No topo, scroll para BAIXO (não é pull-to-refresh)**
   - **Condição**: `scrollTop === 0` (está no topo)
   - **Ação do usuário**: Toca na tela e arrasta para BAIXO (movimento descendente)
   - **Comportamento esperado**: 
     - ✅ Scroll normal para baixo funciona
     - ✅ Página rola normalmente
     - ✅ Nenhum indicador de pull-to-refresh aparece
     - ❌ NÃO deve ativar pull-to-refresh

### 3. **No topo, puxando para CIMA (pull-to-refresh)**
   - **Condição**: `scrollTop === 0` (está no topo)
   - **Ação do usuário**: Toca na tela e arrasta para CIMA (movimento ascendente, como se estivesse "puxando" o conteúdo para baixo)
   - **Comportamento esperado**: 
     - ✅ Mostra indicador de pull-to-refresh
     - ✅ Conteúdo se move para baixo seguindo o dedo
     - ✅ Quando solta antes do threshold: volta suavemente ao topo
     - ✅ Quando solta após o threshold: executa refresh e mostra loading
     - ❌ NÃO deve fazer scroll normal durante o gesto

### 4. **No topo, gesto ambíguo (começa horizontal ou muito pequeno)**
   - **Condição**: `scrollTop === 0` (está no topo)
   - **Ação do usuário**: Toca na tela e arrasta horizontalmente ou movimento muito pequeno
   - **Comportamento esperado**: 
     - ✅ Se movimento for principalmente horizontal: scroll normal
     - ✅ Se movimento vertical for muito pequeno (< 10px): scroll normal
     - ✅ Só ativa pull-to-refresh se movimento vertical para cima for significativo

### 5. **Durante o refresh (isRefreshing === true)**
   - **Condição**: Refresh está em execução
   - **Ação do usuário**: Qualquer gesto
   - **Comportamento esperado**: 
     - ✅ Mostra indicador de loading
     - ✅ NÃO permite novo pull-to-refresh
     - ✅ Scroll normal pode funcionar (ou não, dependendo da preferência)

### 6. **Soltando após puxar (touchend)**
   - **Condição**: Usuário estava puxando para cima
   - **Ação do usuário**: Solta o dedo
   - **Comportamento esperado**: 
     - ✅ Se `pullDistance >= PULL_THRESHOLD`: Executa refresh
     - ✅ Se `pullDistance < PULL_THRESHOLD`: Volta suavemente ao topo
     - ✅ Reseta todos os estados
     - ✅ Volta para modo de scroll normal

### 7. **Scroll com mouse wheel no topo**
   - **Condição**: `scrollTop === 0` (está no topo)
   - **Ação do usuário**: Usa scroll do mouse para rolar para baixo
   - **Comportamento esperado**: 
     - ✅ Scroll normal funciona
     - ✅ Nenhum indicador de pull-to-refresh aparece
     - ❌ NÃO deve ativar pull-to-refresh (só funciona com touch)

### 8. **Scroll com scrollbar no topo**
   - **Condição**: `scrollTop === 0` (está no topo)
   - **Ação do usuário**: Usa scrollbar para rolar para baixo
   - **Comportamento esperado**: 
     - ✅ Scroll normal funciona
     - ✅ Nenhum indicador de pull-to-refresh aparece
     - ❌ NÃO deve ativar pull-to-refresh (só funciona com touch)

---

## Detalhes Técnicos Importantes

### Direção do movimento:
- **"Puxar para cima"** = dedo se move para CIMA na tela = `currentY < startY` = `distance < 0`
- **"Arrastar para baixo"** = dedo se move para BAIXO na tela = `currentY > startY` = `distance > 0`

### Threshold e limites:
- **PULL_THRESHOLD**: 100px (distância mínima para ativar refresh)
- **MAX_PULL_DISTANCE**: 150px (distância máxima do pull)

### Verificação de "no topo":
- Deve ser `scrollTop === 0` (exato) ou `scrollTop <= 1` (com tolerância para subpixels)?

---

## Perguntas para Confirmação:

1. **Cenário 2**: Quando está no topo e o usuário arrasta para BAIXO, deve fazer scroll normal ou não deve fazer nada (já está no topo)?

2. **Cenário 3**: A direção está correta? "Puxar para cima" significa arrastar o dedo para cima na tela?

3. **Cenário 4**: Deve haver uma tolerância para gestos horizontais ou muito pequenos?

4. **Cenário 5**: Durante o refresh, o scroll normal deve funcionar ou deve ser bloqueado?

5. **Verificação de topo**: Deve ser exato (`scrollTop === 0`) ou com tolerância (`scrollTop <= 1`)?

6. **Mouse/Scrollbar**: O pull-to-refresh deve funcionar apenas com touch ou também com mouse/scrollbar?

