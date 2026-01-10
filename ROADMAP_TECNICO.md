# ROADMAP: Futuro do Sistema Van360

Este documento mapeia o que *ainda falta implementar* para tornar o sistema robusto, escalável e comercializável em larga escala.
Analise baseada no estado atual (Janeiro 2026).

## 🚀 Fase 1: Estabilização do WhatsApp Multi-Instância (Prioridade Imediata)
*O recurso está implementado, mas precisa de "blindagem" para o mundo real.*

1.  **Webhook de Status de Conexão:**
    *   ✅ **Implementado:** O webhook (`/api/evolution/webhook`) já processa eventos `connection.update` e atualiza o status do motorista (`CONNECTED` / `DISCONNECTED`) em tempo real.
2.  **Tratamento de Erros Granular:**
    *   Melhorar feedback se a Evolution API estiver fora do ar.
    *   ✅ **Implementado:** Job de "Health Check" (`/jobs/whatsapp-health-check`) verifica periodicamente se os tokens de sessão ainda são válidos e atualiza o banco.
3.  **Filas de Envio (RabbitMQ/BullMQ) [Escala]:**
    *   ✅ **Implementado:** Arquitetura completa de filas (WhatsApp, Recibos, Webhooks, Geração em Lote, PIX, Repasses).
    *   Sistema "Blindado": IDs de Job Únicos (Idempotência), Retries Exponenciais e Fallbacks.

## 🛡️ Fase 2: Painel Administrativo (Super Admin)
*Atualmente, a gestão é via Banco de Dados.*

1.  **Dashboard Global:**
    *   Visualizar faturamento total da plataforma (SaaS + Taxas).
    *   Contagem de Assinantes ativos/cancelados/inadimplentes.
2.  **Gestão de Usuários:**
    *   Listar todos os motoristas.
    *   "Login como usuário" (Impersonate) para suporte.
    *   Bloquear/Desbloquear acesso manualmente.
3.  **Gestão de Planos:**
    *   Criar/Editar planos e preços via interface (sem SQL).
    *   Configurar taxas de intermediação.
4.  **Gestão da Instância Global (WhatsApp):**
    *   Interface para conectar/reconectar o "robô mestre" (Van360).
    *   Status em tempo real da conexão global.
5.  **Configurações do Sistema (Variáveis):**
    *   Interface para editar `TAXA_INTERMEDIACAO`, `PRO_RATA`, dias de vencimento e outras regras de negócio (hoje na tabela `configuracao_interna`).
    *   Evitar mexer no banco de dados para ajustes finos de operação.

## 📊 Fase 3: Relatórios e Inteligência (Valor para o Motorista)
*O motorista já tem o básico, mas pode ter mais insights.*

1.  **Relatório Financeiro Avançado:**
    *   Gráfico de Receita Prevista x Realizada.
    *   Exportação para PDF/Excel da lista de pagamentos (para contador).
    *   Lista de Inadimplentes com botão de cobrança rápida em lote.
2.  **Relatório de Operação:**
    *   Quilometragem por rota (se integrar GPS futuro).
    *   Custo por aluno (Combustível / Passageiros).

## 📱 Fase 4: Experiência Mobile & PWA (App)
*O sistema é web responsiva, mas pode parecer mais "nativo".*

1.  **Notificações Push (OneSignal/Firebase):**
    *   Enviar push para o motorista quando cair um PIX (além do Zap).
2.  **Modo Offline (Básico):**
    *   Permitir visualizar rotas e lista de alunos sem internet (Service Workers).
3.  **Integração Nativa:**
    *   Deep linking para abrir WhatsApp direto no app nativo (já funciona, mas melhorar UX).

## ⚖️ Fase 5: Jurídico e Compliance (LGPD)
*Essencial para lançamento público.*

1.  **Termos de Uso e Política de Privacidade:**
    *   Página pública + Checkbox obrigatório no cadastro.
    *   Registro de "Aceite" no banco de dados (data/versão).
2.  **Exclusão de Dados (Direito ao Esquecimento):**
    *   Botão para o usuário solicitar exclusão completa da conta.
    *   Job para anonimizar dados após exclusão.

## 🛠️ Dívida Técnica & Otimizações (Backend)
*Status: ✅ Concluído (Janeiro 2026)*

1.  **Refatoração Completa (Nível Expert):**
    *   ✅ **Padronização:** 100% da API segue o padrão Controller-Service-Repository e RESTful.
    *   ✅ **Clean Code:** Eliminação de "Magic Strings", uso de Enums, separação de responsabilidades.
    *   ✅ **Type Safety:** DTOs (Zod) e Interfaces estritas em **todos** os módulos (Financeiro, Passageiros, Gastos, Assinaturas).
    *   ✅ **Robustez:** Handler Global de Erros, Filas para tudo que é assíncrono (PIX, Recibos, Webhooks).

2.  **Próximo Foco: Segurança & Qualidade (Fase 5)**
    *   Mapeamento de riscos (OWASP).
    *   Testes de Carga e Segurança.
    *   Blindagem da API.

---

**Resumo da Próxima Ação Recomendada:**
Focar na **Fase 1 (Webhook WhatsApp)** para garantir que o recurso "carro-chefe" não quebre silenciosamente.
Em seguida, atacar a **Fase 5 (Termos de Uso)** para blindagem jurídica antes de escalar vendas.
