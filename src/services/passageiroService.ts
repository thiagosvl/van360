import { supabase } from "@/integrations/supabase/client";
import { asaasService } from "@/services/asaasService";
import { moneyToNumber } from "@/utils/masks";

const asaasApiKey = localStorage.getItem("asaas_api_key");
console.log(localStorage);

export const passageiroService = {
  async getNumeroCobrancas(passageiroId: string): Promise<number> {
    const { count, error } = await supabase
      .from("cobrancas")
      .select("id", { count: "exact", head: true })
      .eq("passageiro_id", passageiroId);

    if (error) {
      console.error("Erro ao contar cobranças:", error);
      throw new Error("Não foi possível verificar as cobranças do passageiro.");
    }

    return count || 0;
  },

  async excluirPassageiro(passageiroId: string): Promise<void> {
    const { data: passageiro, error: passageiroError } = await supabase
      .from("passageiros")
      .select("asaas_customer_id")
      .eq("id", passageiroId)
      .single();

    if (passageiroError) {
      throw new Error("Não foi possível localizar o passageiro para exclusão.");
    }

    if (passageiro?.asaas_customer_id && asaasApiKey) {
      try {
        await asaasService.deleteCustomer(passageiro.asaas_customer_id, asaasApiKey);
      } catch (asaasErr) {
        console.error("Erro ao excluir cliente no Asaas. A operação foi abortada.", asaasErr);
        throw new Error("Falha ao excluir o cliente no provedor de pagamento.");
      }
    }

    const { error } = await supabase
      .from("passageiros")
      .delete()
      .eq("id", passageiroId);

    if (error) {
      throw new Error("Falha ao excluir o passageiro do banco de dados.");
    }
  },

  async createPassageiroComTransacao(
    data: any // Use o tipo PassageiroFormData ou 'any' temporariamente
  ): Promise<void> {

    // As chaves de rollback que precisamos rastrear
    let asaasCustomer: any = null;
    let newPassageiro: any = null;
    let payment: any = null;

    // Adaptação dos dados (retirada do Dialog)
    const { emitir_cobranca_mes_atual, ...pureData } = data;
    const passageiroData = {
      ...pureData,
      valor_mensalidade: moneyToNumber(pureData.valor_mensalidade),
      dia_vencimento: Number(pureData.dia_vencimento),
      escola_id: pureData.escola_id || null,
      ativo: pureData.ativo ?? true,
      usuario_id: localStorage.getItem("app_user_id"),
      // Garante que o CPF/Telefone estejam limpos, se a máscara estiver fora do service
      cpf_responsavel: pureData.cpf_responsavel.replace(/\D/g, ""),
      telefone_responsavel: pureData.telefone_responsavel.replace(/\D/g, ""),
    };

    
      console.log('key', asaasApiKey);

    try {
      // --- 1. Criar Cliente ASAAS ---
      asaasCustomer = await asaasService.createCustomer(
        {
          name: passageiroData.nome_responsavel, // Use o nome do responsável para o ASAAS
          cpfCnpj: passageiroData.cpf_responsavel,
          mobilePhone: passageiroData.telefone_responsavel,
          notificationDisabled: true,
        },
        asaasApiKey
      );

      passageiroData.asaas_customer_id = asaasCustomer.id;

      // --- 2. Inserir Passageiro no Supabase ---
      const { data: insertedPassageiro, error: insertPassageiroError } =
        await supabase
          .from("passageiros")
          .insert([passageiroData])
          .select()
          .single();

      if (insertPassageiroError) throw insertPassageiroError;
      newPassageiro = insertedPassageiro;

      // --- 3. Criar Cobrança ASAAS e Supabase ---
      if (emitir_cobranca_mes_atual) {
        // Toda a lógica de cálculo de data e vencimento do seu Dialog
        const currentDate = new Date();
        const mes = currentDate.getMonth() + 1;
        const ano = currentDate.getFullYear();
        const diaInformado = passageiroData.dia_vencimento;
        const hoje = currentDate.getDate();
        // Lógica de vencimento: se o dia já passou, vence hoje, senão, no dia informado
        const vencimentoAjustado = diaInformado < hoje ? hoje : diaInformado;
        const dataVencimento = new Date(ano, mes - 1, vencimentoAjustado);

        payment = await asaasService.createPayment(
          {
            customer: newPassageiro.asaas_customer_id,
            billingType: "UNDEFINED",
            value: passageiroData.valor_mensalidade, // Já é number
            dueDate: dataVencimento.toISOString().split("T")[0],
            description: `Mensalidade ${mes}/${ano}`,
            externalReference: newPassageiro.id,
          },
          asaasApiKey
        );

        const { error: cobrancaError } = await supabase
          .from("cobrancas")
          .insert([
            {
              passageiro_id: newPassageiro.id,
              mes,
              ano,
              valor: passageiroData.valor_mensalidade,
              data_vencimento: dataVencimento.toISOString().split("T")[0],
              status: "pendente",
              usuario_id: localStorage.getItem("app_user_id"),
              origem: "automatica",
              asaas_payment_id: payment.id,
              asaas_invoice_url: payment.invoiceUrl,
              asaas_bankslip_url: payment.bankSlipUrl,
            },
          ]);

        if (cobrancaError) throw cobrancaError;
      }

      // Se chegou até aqui, é sucesso.
    } catch (err: any) {
      // --- ROLLBACK EM CASO DE FALHA ---
      console.error("Falha na criação do passageiro. Iniciando Rollback:", err);

      try {
        // Deleta o Payment se foi criado
        if (payment?.id) await asaasService.deletePayment(payment.id, asaasApiKey);
        // Deleta o Passageiro se foi inserido
        if (newPassageiro?.id) await supabase.from("passageiros").delete().eq("id", newPassageiro.id);
        // Deleta o Customer se foi criado
        if (asaasCustomer?.id) await asaasService.deleteCustomer(asaasCustomer.id, asaasApiKey);
      } catch (rollbackErr) {
        console.error("Erro no processo de Rollback:", rollbackErr);
      }

      // Relança o erro para o componente tratar a mensagem de notificação
      throw new Error(err.message || "Erro desconhecido ao cadastrar passageiro.");
    }
  },


  // =================================================================
  // NOVO MÉTODO: Atualização Completa (Substitui o bloco 'if' do handleSubmit)
  // =================================================================
  async updatePassageiroComTransacao(
    id: string,
    data: any, // Use o tipo PassageiroFormData ou 'any' temporariamente
    editingPassageiro: any // Precisamos do objeto antigo para o rollback
  ): Promise<void> {

    // Adaptação dos dados (retirada do Dialog)
    const { emitir_cobranca_mes_atual, ...pureData } = data;
    const passageiroData = {
      ...pureData,
      valor_mensalidade: moneyToNumber(pureData.valor_mensalidade),
      dia_vencimento: Number(pureData.dia_vencimento),
      escola_id: pureData.escola_id || null,
      ativo: pureData.ativo ?? true,
    };

    let rollbackNeeded = false;
    let snapshotPassageiro: any = null; // Snapshot para o rollback

    try {
      // 1. Snapshot antes da primeira atualização (Supabase Passageiro)
      const { data: oldPassageiro, error: fetchError } = await supabase
        .from("passageiros")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      snapshotPassageiro = { ...oldPassageiro };

      // 2. Atualizar o Passageiro
      const { error: updateError } = await supabase
        .from("passageiros")
        .update(passageiroData) // Use a interface correta aqui
        .eq("id", id);

      if (updateError) throw updateError;
      rollbackNeeded = true; // Se cair após este ponto, precisamos de rollback

      // 3. Checar a Cobrança mais recente (Lógica copiada do Dialog)
      const { data: ultimaCobranca, error: cobrancaError } = await supabase
        .from("cobrancas")
        .select("*")
        .eq("passageiro_id", id)
        .neq("status", "pago")
        .order("ano", { ascending: false })
        .order("mes", { ascending: false })
        .limit(1)
        .single();

      if (!cobrancaError && ultimaCobranca) {
        const valorMudou = passageiroData.valor_mensalidade !== ultimaCobranca.valor;
        const vencimentoMudou = passageiroData.dia_vencimento !== editingPassageiro.dia_vencimento;

        if (valorMudou || vencimentoMudou) {
          // ... Lógica de checagem de data ...
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          const novaDataVencimento = new Date(
            ultimaCobranca.ano,
            ultimaCobranca.mes - 1,
            passageiroData.dia_vencimento
          );
          novaDataVencimento.setHours(0, 0, 0, 0);
          const podeAtualizarCobranca = valorMudou || (vencimentoMudou && novaDataVencimento >= hoje);

          if (podeAtualizarCobranca) {
            // 4. Atualizar o Payment no ASAAS
            const updatePayload = {
              value: passageiroData.valor_mensalidade,
              dueDate: novaDataVencimento.toISOString().split("T")[0],
              billingType: "UNDEFINED",
            };

            await asaasService.updatePayment(
              ultimaCobranca.asaas_payment_id,
              updatePayload,
              asaasApiKey
            );

            // 5. Atualizar a Cobrança no Supabase
            const { error: updateCobrancaError } = await supabase
              .from("cobrancas")
              .update({
                data_vencimento: vencimentoMudou
                  ? novaDataVencimento.toISOString().split("T")[0]
                  : ultimaCobranca.data_vencimento,
                valor: valorMudou
                  ? passageiroData.valor_mensalidade
                  : ultimaCobranca.valor,
                desativar_lembretes: !passageiroData.ativo,
              })
              .eq("id", ultimaCobranca.id);

            if (updateCobrancaError) throw updateCobrancaError;
          }
        }
      }
    } catch (err: any) {
      // --- ROLLBACK EM CASO DE FALHA ---
      if (rollbackNeeded && snapshotPassageiro) {
        try {
          await supabase
            .from("passageiros")
            .update(snapshotPassageiro)
            .eq("id", id);
          console.log("Rollback da edição realizado com sucesso.");
        } catch (rollbackErr) {
          console.error("Erro no rollback da edição:", rollbackErr);
        }
      }
      // Relança o erro para o componente tratar a mensagem de notificação
      throw new Error(err.message || "Erro desconhecido ao atualizar passageiro.");
    }
  }
};