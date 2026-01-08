# Mapa de Notificações do Sistema Van360

Este documento lista todas as mensagens automáticas enviadas via WhatsApp para Pais e Motoristas, incluindo seus gatilhos e modelos de conteúdo.

---

## 👨‍👩‍👦 1. PAIS / RESPONSÁVEIS

Mensagens destinadas aos clientes do transporte escolar.

| Evento | Gatilho Automatizado | Estrutura da Mensagem | Mídia Anexa |
| :--- | :--- | :--- | :--- |
| **Lembrete de Vencimento** | Job Diário (`daily-charge-monitor`). Envia X dias antes (Configurável, ex: 3 dias). | "Olá [Responsável], lembrete do Tio [Motorista]. Mensalidade de [Aluno] vence em [Data]. Segue Pix." | ❌ (Apenas Texto) |
| **Vence Hoje** | Job Diário. Envia no dia do vencimento. | "Olá [Responsável], lembrete de HOJE. Mensalidade [Aluno] vence hoje. Segue Pix." | ❌ |
| **Em Atraso** | Job Diário. Envia após vencimento (ex: 1 dia depois). | "Olá [Responsável], notamos atraso de X dias na mensalidade. Para regularizar, segue Pix." | ❌ |
| **Recibo de Pagamento** | Webhook Inter (`PAYMENT_RECEIVED`). Imediato após pagamento. | "Olá [Responsável], confirmamos o pagamento de [Valor]. Muito obrigado! ✅" | ❌ |

---

## 🚐 2. MOTORISTAS (ASSINANTES)

Mensagens destinadas aos parceiros motoristas sobre a assinatura do software.

| Evento | Gatilho Automatizado | Estrutura da Mensagem | Mídia Anexa |
| :--- | :--- | :--- | :--- |
| **Boas Vindas / Ativação** | Cadastro Inicial ou Upgrade de Plano (`usuario.service`). Imediato. | "Seja bem-vindo [Nome]! Para ativar seu plano [Plano], realize o pagamento inicial." | ✅ (Imagem QRCode PIX) |
| **Renovação Próxima** | Job Diário (`daily-subscription-monitor`). Envia 5 dias antes. | "Olá [Nome], sua fatura Van360 vence em 5 dias. Segue Pix." | ✅ |
| **Renovação Vence Hoje** | Job Diário. Envia no dia. | "Olá [Nome], sua fatura vence HOJE. Evite bloqueios. Segue Pix." | ✅ |
| **Renovação Atrasada** | Job Diário. Pós-vencimento. | "Olá [Nome], fatura em atraso. Regularize para evitar suspensão." | ✅ |
| **Fim do Teste Grátis** | Job Diário. Envia quando Trial está acabando. | "⏳ Seu Teste Grátis está acabando! Confirme sua assinatura para continuar usando." | ✅ |
| **Recibo de Pagamento** | Webhook Inter (`PAYMENT_RECEIVED`). Assinatura paga. | "Pagamento confirmado! ✅ Sua assinatura [Plano] está ativa até [Data]." | ❌ |
| **Alerta: Venda Realizada** | Webhook Inter. Quando um Pai paga o Motorista. | "💰 Oba! [Responsável] pagou a mensalidade de [Aluno] ([Valor])." | ❌ |
| **Alerta: Falha no Repasse** | Job de Monitoramento (`repasse-monitor`). Quando transferência falha. | "⚠️ Atenção: Falha no Repasse. Sua chave PIX foi invalidada por segurança. Cadastre novamente no App." | ❌ |

---

## ⚙️ Layout Visual (Exemplos)

### Exemplo 1: Envio com PIX (Padrão)
```text
(Imagem Opcional do QR Code Renderizada)

Olá Thiago, lembrete da Van 360:
A mensalidade vence em 10/01/2026.

Valor: R$ 150,00
Pix Copia e Cola 👇

[Código PIX Longo...]
```

### Exemplo 2: Recibo (Apenas Texto)
```text
Olá Maria, confirmamos o recebimento da mensalidade de Joãozinho valor de R$ 150,00. ✅

Muito obrigado! 🚐💨
```
