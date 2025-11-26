# 📋 Mapeamento Completo de Funcionalidades do Sistema Van360

Este documento mapeia **TODAS** as funcionalidades existentes no sistema Van360, literalmente tudo que o sistema faz, organizadas por área de gestão.

---

## 🎯 VISÃO GERAL DO SISTEMA

O Van360 é um sistema de gestão completo para motoristas escolares, oferecendo controle total sobre veículos, escolas, passageiros, cobranças e finanças.

---

## 📦 1. GESTÃO DE VEÍCULOS

### Funcionalidades Disponíveis em Todos os Planos

#### **Cadastro e Edição**
- ✅ Cadastrar novo veículo (placa, marca, modelo, ano)
- ✅ Editar informações do veículo
- ✅ Visualizar lista de veículos cadastrados
- ✅ Buscar veículo por placa (busca em tempo real)
- ✅ Filtrar veículos por status (ativos/inativos/todos)

#### **Ativação/Desativação**
- ✅ Ativar veículo
- ✅ Desativar veículo
- ✅ Visualizar status do veículo (ativo/inativo)
- ⚠️ **Validação:** Não permite desativar veículo com passageiros ativos vinculados

#### **Vinculação e Relacionamentos**
- ✅ Visualizar quantidade de passageiros ativos vinculados a cada veículo
- ✅ Navegar para lista de passageiros filtrada por veículo específico
- ⚠️ **Validação:** Não permite excluir veículo com passageiros vinculados

#### **Exclusão**
- ✅ Excluir veículo (após validação de passageiros vinculados)
- ✅ Confirmação antes de excluir

---

## 🏫 2. GESTÃO DE ESCOLAS

### Funcionalidades Disponíveis em Todos os Planos

#### **Cadastro e Edição**
- ✅ Cadastrar nova escola (nome)
- ✅ Editar informações da escola
- ✅ Visualizar lista de escolas cadastradas
- ✅ Buscar escola por nome (busca em tempo real)
- ✅ Filtrar escolas por status (ativas/inativas/todas)

#### **Ativação/Desativação**
- ✅ Ativar escola
- ✅ Desativar escola
- ✅ Visualizar status da escola (ativa/inativa)
- ⚠️ **Validação:** Não permite desativar escola com passageiros ativos vinculados

#### **Vinculação e Relacionamentos**
- ✅ Visualizar quantidade de passageiros ativos vinculados a cada escola
- ✅ Navegar para lista de passageiros filtrada por escola específica
- ⚠️ **Validação:** Não permite excluir escola com passageiros vinculados

#### **Exclusão**
- ✅ Excluir escola (após validação de passageiros vinculados)
- ✅ Confirmação antes de excluir

---

## 👥 3. GESTÃO DE PASSAGEIROS

### Funcionalidades Disponíveis em Todos os Planos

#### **Cadastro e Edição**
- ✅ Cadastrar novo passageiro (informações pessoais, responsável, veículo, escola)
- ✅ Editar informações do passageiro
- ✅ Visualizar lista completa de passageiros
- ✅ Buscar passageiros por nome (busca com debounce de 400ms)
- ✅ Filtrar passageiros por:
  - Escola (dropdown)
  - Veículo (dropdown)
  - Status (ativos/inativos/todos)
  - Período (todos/mês atual/últimos 3 meses/últimos 6 meses/ano atual)

#### **Ativação/Desativação**
- ✅ Ativar passageiro
- ✅ Desativar passageiro
- ✅ Visualizar status do passageiro (ativo/inativo)
- ✅ Confirmação antes de ativar/desativar

#### **Carteirinha Digital**
- ✅ Visualizar carteirinha completa do passageiro
- ✅ Ver informações pessoais (nome, foto, responsável, telefone, escola, veículo)
- ✅ Ver todas as cobranças do passageiro (histórico completo)
- ✅ Ver resumo financeiro do passageiro
- ✅ Adicionar/editar observações do passageiro
- ✅ Navegar para detalhes de uma cobrança específica

#### **Link de Cadastro Rápido (Pré-Cadastros)**
- ✅ Gerar link único para cadastro rápido
- ✅ Copiar link para compartilhar com responsáveis
- ✅ Visualizar pré-cadastros pendentes
- ✅ Finalizar pré-cadastro (converter em passageiro completo)
- ✅ Buscar pré-cadastros por nome
- ✅ Excluir pré-cadastro não finalizado
- ✅ Criar novo pré-cadastro manualmente
- ⚠️ **Restrição:** Disponível apenas para planos pagos (Essencial e Completo)

#### **Limite de Passageiros**
- ✅ **Plano Gratuito:** Limite configurável (ex: 20 passageiros)
- ✅ **Plano Essencial:** Ilimitado (trial e ativo)
- ✅ **Plano Completo:** Ilimitado
- ✅ Alerta visual quando próximo do limite
- ✅ Bloqueio de cadastro ao atingir limite (apenas Gratuito)

#### **Exclusão**
- ✅ Excluir passageiro (após confirmação)
- ✅ Validação de franquia antes de excluir (para plano Completo)

#### **Criação Rápida Durante Cadastro**
- ✅ Criar nova escola diretamente do formulário de passageiro
- ✅ Criar novo veículo diretamente do formulário de passageiro
- ✅ Seleção automática após criação

---

## 💰 4. GESTÃO DE COBRANÇAS

### Funcionalidades Disponíveis em Todos os Planos

#### **Criação e Edição**
- ✅ Criar nova cobrança manualmente
- ✅ Editar cobrança existente (valor, data de vencimento, descrição)
- ✅ Excluir cobrança (com validações)
- ✅ Duplicar cobrança existente

#### **Visualização e Organização**
- ✅ Visualizar todas as cobranças
- ✅ Separar cobranças em abas (Pendentes / Pagas)
- ✅ Filtrar cobranças por mês e ano
- ✅ Buscar cobranças por nome do passageiro ou responsável
- ✅ Visualizar status de cada cobrança (pago, pendente, atrasado)
- ✅ Contador de cobranças pendentes e pagas em cada aba

#### **Registro de Pagamento**
- ✅ Registrar pagamento manualmente
- ✅ Selecionar tipo de pagamento (PIX, Cartão de Crédito, Cartão de Débito, Dinheiro, Transferência, Boleto)
- ✅ Adicionar data do pagamento
- ✅ Adicionar observações sobre o pagamento
- ✅ Desfazer pagamento (com validações)

#### **Notificações e Comunicação**
- ✅ Enviar notificação de cobrança via WhatsApp
- ✅ Ativar/desativar lembretes automáticos por cobrança
- ✅ Visualizar histórico de notificações enviadas
- ✅ Botão de envio de notificação (quando permitido pelo plano)

#### **Detalhes da Cobrança**
- ✅ Visualizar página detalhada de uma cobrança específica
- ✅ Ver todas as informações da cobrança (valor, vencimento, status, tipo de pagamento)
- ✅ Ver informações do passageiro e responsável
- ✅ Ver histórico completo de notificações enviadas
- ✅ Editar cobrança a partir da página de detalhes
- ✅ Registrar pagamento a partir da página de detalhes

#### **Cobrança Automática (Apenas Plano Completo)**
- ✅ Ativar cobrança automática para passageiro específico
- ✅ Desativar cobrança automática para passageiro específico
- ✅ Controle de franquia de cobranças automáticas
- ✅ Validação de limite de franquia antes de ativar
- ✅ Dialog informando excesso de franquia
- ✅ Seleção manual de quais passageiros terão cobrança automática (quando necessário)

#### **Baixa Automática de Pagamentos (Apenas Plano Completo)**
- ✅ Baixa automática de pagamentos PIX recebidos
- ✅ Reconhecimento automático de pagamentos
- ✅ Atualização automática do status das cobranças após pagamento PIX

---

## 📊 5. CONTROLE DE GASTOS (Gestão Financeira de Veículos)

### Funcionalidades Disponíveis Apenas no Plano Essencial e Completo

#### **Cadastro e Edição**
- ✅ Cadastrar novo gasto (valor, data, categoria, descrição opcional, veículo)
- ✅ Editar gasto existente
- ✅ Excluir gasto
- ✅ Visualizar lista de gastos

#### **Categorização**
- ✅ Categorizar gastos por tipo:
  - Salário
  - Combustível
  - Manutenção
  - Vistorias
  - Documentação
  - Outros

#### **Filtros e Busca**
- ✅ Filtrar gastos por mês e ano
- ✅ Filtrar gastos por categoria (todas ou categoria específica)
- ✅ Filtrar gastos por veículo (quando aplicável)
- ✅ Calendário para seleção de data

#### **Visualizações e Relatórios**
- ✅ Gráfico de pizza por categoria (visualização de proporção)
- ✅ Totalizador de gastos no período selecionado
- ✅ Identificação da categoria com maior gasto
- ✅ Visualização mobile e desktop otimizada

---

## 📈 6. RELATÓRIOS FINANCEIROS

### Funcionalidades Disponíveis Apenas no Plano Essencial e Completo

#### **Relatórios de Cobranças**
- ✅ Relatório de faturamento mensal
- ✅ Total previsto (valor total das cobranças do período)
- ✅ Total recebido (valor das cobranças pagas)
- ✅ Total a receber (diferença entre previsto e recebido)
- ✅ Percentual de recebimento
- ✅ Quantidade de cobranças pagas, pendentes e atrasadas

#### **Estatísticas de Pagamentos por Tipo**
- ✅ Estatísticas de pagamentos PIX (quantidade e valor total)
- ✅ Estatísticas de pagamentos Cartão (quantidade e valor total)
- ✅ Estatísticas de pagamentos Dinheiro (quantidade e valor total)
- ✅ Estatísticas de pagamentos Transferência (quantidade e valor total)
- ✅ Estatísticas de pagamentos Boleto (quantidade e valor total)
- ✅ Visualização gráfica das estatísticas por tipo de pagamento

#### **Filtros**
- ✅ Filtrar relatórios por mês
- ✅ Filtrar relatórios por ano
- ✅ Seleção via dropdowns

#### **Alertas**
- ✅ Alerta de cobranças atrasadas no período
- ✅ Lista de cobranças atrasadas com detalhes

---

## 🏠 7. DASHBOARD (Página Inicial)

### Funcionalidades Disponíveis em Todos os Planos

#### **Visão Geral**
- ✅ Saudação personalizada com apelido do usuário
- ✅ Acesso rápido a todas as funcionalidades (cards clicáveis)

#### **Quick Start**
- ✅ Guia de início rápido para novos usuários
- ✅ Checklist de tarefas iniciais

#### **Cobranças Pendentes**
- ✅ Alerta de cobranças atrasadas do mês atual
- ✅ Visualização compacta no mobile
- ✅ Visualização completa no desktop
- ✅ Mensagem positiva quando não há cobranças pendentes

#### **Link de Cadastro Rápido**
- ✅ Card com link de cadastro rápido
- ✅ Botão para copiar link
- ✅ Indicação visual quando limite é atingido (apenas Gratuito)

#### **Plan Upgrade Prompt**
- ✅ Sugestão de upgrade para planos Gratuito e Essencial
- ✅ Visualização compacta no mobile
- ✅ Visualização completa no desktop

#### **Acessos Rápidos**
- ✅ Cards clicáveis para todas as páginas principais
- ✅ Ícones visuais para cada funcionalidade
- ✅ Navegação direta

---

## 🔐 8. GESTÃO DE ASSINATURA

### Funcionalidades Disponíveis em Todos os Planos

#### **Visualização de Plano Atual**
- ✅ Visualizar plano atual (Gratuito, Essencial ou Completo)
- ✅ Ver status da assinatura (ativa, trial, pendente, suspensa, cancelada)
- ✅ Ver data de vigência
- ✅ Ver data de término do trial (quando aplicável)

#### **Detalhes da Assinatura**
- ✅ Ver preço aplicado
- ✅ Ver limite de passageiros (quando aplicável)
- ✅ Ver franquia de cobranças automáticas (apenas Completo)
- ✅ Ver quantidade de passageiros ativos
- ✅ Ver quantidade de cobranças automáticas em uso (apenas Completo)
- ✅ Barra de progresso visual

#### **Gestão de Plano**
- ✅ Trocar de plano (upgrade ou downgrade)
- ✅ Cancelar assinatura
- ✅ Desistir de cancelamento (se cancelamento solicitado)
- ✅ Seleção de passageiros para manter cobrança automática (durante downgrade)

#### **Pagamento**
- ✅ Visualizar faturamento mensal
- ✅ Ver histórico de cobranças da assinatura
- ✅ Pagar assinatura pendente
- ✅ Dialog de confirmação de cancelamento

---

## 💳 9. PAGAMENTO PIX

### Funcionalidades Disponíveis Durante Cadastro/Upgrade

#### **Geração de QR Code**
- ✅ Gerar QR Code PIX automaticamente
- ✅ Visualizar QR Code na tela
- ✅ Copiar código PIX (copia e cola)
- ✅ Botão de cópia com feedback visual (check quando copiado)

#### **Instruções**
- ✅ Instruções claras de pagamento
- ✅ Passos numerados
- ✅ Link para revelar código completo (oculto por padrão)

#### **Acompanhamento**
- ✅ Timer com tempo restante para pagamento
- ✅ Mensagem amigável de aguardo
- ✅ Atualização automática do status após pagamento
- ✅ Realtime + Polling para detecção rápida

#### **Feedback**
- ✅ Toast de sucesso quando pagamento é confirmado
- ✅ Redirecionamento automático após pagamento

---

## 👤 10. GESTÃO DE PERFIL E CONTA

### Funcionalidades Disponíveis em Todos os Planos

#### **Dados Pessoais**
- ✅ Visualizar informações do perfil
- ✅ Editar cadastro (nome, apelido, CPF, telefone)
- ✅ Alterar senha

#### **Autenticação**
- ✅ Login com email e senha
- ✅ Recuperação de senha
- ✅ Registro de nova conta

---

## 🔍 11. BUSCA E FILTROS

### Funcionalidades Disponíveis em Todas as Áreas

#### **Busca em Tempo Real**
- ✅ Busca por nome de passageiro (com debounce)
- ✅ Busca por placa de veículo
- ✅ Busca por nome de escola
- ✅ Busca por nome de responsável (nas cobranças)

#### **Filtros Avançados**
- ✅ Filtros por status (ativo/inativo)
- ✅ Filtros por data/período
- ✅ Filtros por categoria (gastos)
- ✅ Filtros por veículo
- ✅ Filtros por escola
- ✅ Filtros por mês/ano (cobranças e relatórios)

#### **Interface**
- ✅ Toggle de filtros mobile (colapsável)
- ✅ Filtros sempre visíveis no desktop
- ✅ Reset de filtros

---

## 📱 12. RESPONSIVIDADE E MOBILE

### Funcionalidades Disponíveis em Todos os Planos

#### **Interface Responsiva**
- ✅ Layout adaptável para mobile e desktop
- ✅ Cards compactos no mobile
- ✅ Tabelas expansivas no desktop
- ✅ Navegação otimizada para touch

#### **Pull to Refresh**
- ✅ Atualizar dados arrastando para baixo (em todas as páginas principais)

#### **Acessos Rápidos Mobile**
- ✅ Menu lateral (sidebar)
- ✅ Cards de acesso rápido na home
- ✅ Filtros colapsáveis

---

## 🚀 13. COBRANÇA AUTOMÁTICA (Apenas Plano Completo)

### Funcionalidades Exclusivas do Plano Completo

#### **Automação Total**
- ✅ Envio automático de cobranças via WhatsApp (sem intervenção manual)
- ✅ Escolha quantos passageiros terão cobrança automática (franquia personalizada)
- ✅ Ativação/desativação individual de cobrança automática por passageiro
- ✅ Gestão de franquia contratada (10, 20, 50+ passageiros)

#### **Comunicação Automática**
- ✅ Envio automático de recibos após pagamento
- ✅ Envio automático de lembretes de vencimento
- ✅ Notificações automáticas para pais e responsáveis
- ✅ Sistema cuida de toda a comunicação

#### **Gestão de Franquia**
- ✅ Visualização de cobranças automáticas em uso vs contratadas
- ✅ Validação de limite antes de ativar nova cobrança automática
- ✅ Dialog informando quando limite será excedido
- ✅ Seleção manual de quais passageiros manter ao fazer downgrade

#### **Redução de Trabalho Manual**
- ✅ Elimina necessidade de enviar cobranças manualmente
- ✅ Elimina necessidade de baixar pagamentos manualmente (PIX)
- ✅ Redução drástica de inadimplência através de lembretes automáticos

---

## ❌ FUNCIONALIDADES QUE NÃO EXISTEM NO SISTEMA

- ❌ **Gestão de Rotas:** Não há cadastro ou gestão de rotas de transporte
- ❌ **Histórico de Viagens:** Não há registro de viagens realizadas
- ❌ **Lista de Presença:** Não há sistema de controle de presença de passageiros em viagens
- ❌ **Rastreamento GPS:** Não há rastreamento de veículos em tempo real
- ❌ **Chat/Conversação:** Não há chat integrado (apenas envio de mensagens via WhatsApp)
- ❌ **Multi-Usuário/Colaboradores:** Não há sistema de permissões ou múltiplos usuários por conta
- ❌ **Gestão de Frota:** Não há gestão avançada de frotas (apenas cadastro básico de veículos)

---

## 📋 RESUMO POR PLANO

### ✅ PLANO GRATUITO
- Gestão de Veículos (cadastro, edição, exclusão, ativação/desativação)
- Gestão de Escolas (cadastro, edição, exclusão, ativação/desativação)
- Gestão de Passageiros (limitado, cadastro, edição, exclusão, ativação/desativação)
- Carteirinhas Digitais
- Cobranças Manuais (criar, editar, registrar pagamento, enviar notificação)
- Dashboard Home
- Busca e Filtros básicos
- **NÃO tem:** Gastos, Relatórios, Cobrança Automática, Link de Cadastro Rápido

### ✅ PLANO ESSENCIAL
- **Tudo do Gratuito +**
- Passageiros Ilimitados (trial e ativo)
- Link de Cadastro Rápido
- Gestão de Gastos (controle financeiro completo)
- Relatórios Financeiros (faturamento, estatísticas, gráficos)
- **NÃO tem:** Cobrança Automática, Baixa Automática PIX

### ✅ PLANO COMPLETO
- **Tudo do Essencial +**
- Cobrança Automática 100% (via WhatsApp)
- Baixa Automática de Pagamentos PIX
- Envio Automático de Recibos e Lembretes
- Gestão de Franquia de Cobranças Automáticas
- Seleção de Passageiros para Cobrança Automática

---

**Última atualização:** 2025-01-21  
**Total de funcionalidades mapeadas:** 200+ ações e recursos

