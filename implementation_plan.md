# Plano de Implementação - Assistente Guiado de Configuração de Cobrança (Setup Wizard)

Este plano descreve a arquitetura, estrutura de etapas e implementação do assistente guiado (`ConfigurarCobrancaWizardDialog`) para ativação de **"Apenas Lembretes"** e **"Cobrança & Baixa Automática"**, substituindo atritos de formulários soltos por uma experiência passo a passo fluida, didática e focada no mobile e desktop.

---

## 1. Premissas e Deduções de Arquitetura e Negócio (Obrigatório)

1. **Iniciação do Wizard:**
   - Ao clicar nos cards seletores na página `Conta -> tab=cobrancas`:
     - Se o motorista selecionar **"Apenas Lembretes"**: abre o assistente em modo `LEMBRETES` (2 etapas).
     - Se o motorista selecionar **"Cobrança & Baixa Automática"**: verifica whitelist (se fora da whitelist, mantém toast informativo com suporte). Se elegível, abre o assistente em modo `AUTOMATICA` (3 etapas).
     - Se o motorista selecionar **"Desativado"**: desativa diretamente na página com confirmação rápida (sem necessidade de wizard).
   - Se o motorista já estiver em um modo e quiser alterar detalhes, ele pode continuar usando os cards na tela normalmente, e terá também a opção de abrir o assistente guiado clicando em *"Assistente de configuração"*.

2. **Fluxo Modo "Apenas Lembretes" (2 Etapas):**
   - **Etapa 1: Chave Pix (Opcional):**
     - O motorista escolhe o Tipo de Chave (CPF, CNPJ, E-mail, Telefone, Chave Aleatória) e digita o valor.
     - Botão Secundário: *"Pular e enviar sem Pix"* -> Avança para Etapa 2 sem cadastrar Pix.
     - Botão Primário: *"Avançar com Pix"* -> Se preenchido, valida o formato Pix e avança para a Etapa 2.
   - **Etapa 2: Réguas de Notificação no WhatsApp:**
     - Configurações dos 3 avisos: antecedência (com stepper de 1 a 5 dias), no dia do vencimento, 3 dias após.
     - Botão para abrir prévia de demonstração do WhatsApp.
     - Botão Primário: *"Concluir e Ativar Lembretes"*.

3. **Fluxo Modo "Cobrança & Baixa Automática" (3 Etapas):**
   - **Etapa 1: Chave Pix para Repasse (Obrigatória):**
     - Explica que é a conta onde os repasses automáticos do Pix dinâmico cairão.
     - Campos obrigatórios e estritamente validados.
     - Botão Primário: *"Avançar"*.
   - **Etapa 2: Taxa e Comprovantes:**
     - Apresentação da taxa de liquidação (ex: R$ 1,49).
     - Switch de repasse da taxa aos responsáveis (com card comparativo simulado).
     - Switch de envio automático de recibo no WhatsApp.
     - Botões: *"Voltar"* / *"Avançar"*.
   - **Etapa 3: Réguas de Envio e Demonstração:**
     - Réguas de envio no WhatsApp com link/QR Code Pix.
     - Botão de demonstração da cobrança com QR Code Pix.
     - Botões: *"Voltar"* / *"Ativar Cobrança Automática"*.

4. **Persistência dos Dados:**
   - Os dados são consolidados e salvos no backend (`updateConfiguracoes` e `updateFinanceiro`) ao concluir a última etapa, garantindo atomicidade na experiência do usuário. Caso o usuário feche o wizard no meio, nada é alterado indevidamente.

---

## 2. Componentes e Estrutura de Arquivos

1. **ViewModel (`src/hooks/ui/useConfigurarCobrancaWizardViewModel.ts`):**
   - Hook da camada UI responsável pelo estado da etapa atual, validação das etapas, formulário de chave Pix, switches e chamada aos hooks de transporte (`useConfiguracoes` e `useMotoristaFinanceiroApi`).
2. **Dialog (`src/components/dialogs/ConfigurarCobrancaWizardDialog.tsx`):**
   - Utiliza `BaseDialog` com `showSteps`, `currentStep`, `totalSteps`, cabeçalho semântico e rodapé com botões de navegação.
3. **Registro no Contexto (`LayoutContext.tsx` e `LayoutProvider.tsx`):**
   - `openConfigurarCobrancaWizardDialog(props: OpenConfigurarCobrancaWizardProps)`
   - `closeConfigurarCobrancaWizardDialog()`
4. **Integração na Página (`PagamentosTab.tsx`):**
   - Conectar o clique dos seletores para abrir o wizard correspondente.
   - Manter a tela principal sincronizada e limpa.

---

## 3. Checklist de Verificação
- [ ] Compilação limpa com `tsc --noEmit`.
- [ ] Zero comentários explicativos no código.
- [ ] Baseado em `BaseDialog` e gerenciado via `LayoutContext`.
- [ ] Fechamento sempre encapsulado com `safeCloseDialog`.
- [ ] Padrão de cores e tokens do `design.md` (zero preto nos ícones/badges).
