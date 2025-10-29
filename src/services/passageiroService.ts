import { STORAGE_KEY_QUICKSTART_STATUS } from "@/constants";
import { supabase } from "@/integrations/supabase/client";
import { asaasService } from "@/services/asaasService";
import { cleanString, toLocalDateString } from "@/utils/formatters";
import { moneyToNumber } from "@/utils/masks";

export const passageiroService = {

  async finalizePreCadastro(
    prePassageiroId: string,
    data: any,
    usuarioId: string,
    emitir_cobranca_mes_atual: boolean
  ): Promise<void> {
    const passageiroData = {
      ...data,
      valor_cobranca: moneyToNumber(data.valor_cobranca),
      dia_vencimento: Number(data.dia_vencimento),
      escola_id: data.escola_id || null,
      ativo: true,
      usuario_id: usuarioId,
      cpf_responsavel: data.cpf_responsavel.replace(/\D/g, ""),
      telefone_responsavel: data.telefone_responsavel.replace(/\D/g, ""),
    };

    await this.processarNovoPassageiro(
      passageiroData,
      emitir_cobranca_mes_atual,
      prePassageiroId
    );
  },

  async processarNovoPassageiro(
    data: any,
    emitirCobranca: boolean,
    prePassageiroId: string | null = null
  ): Promise<{ newPassageiro: any; asaasCustomer: any; payment: any }> {

    let asaasCustomer: any = null;
    let newPassageiro: any = null;
    let payment: any = null;

    const storageKey = STORAGE_KEY_QUICKSTART_STATUS;
    const cached = localStorage.getItem(storageKey);
    const previousStatus = cached ? JSON.parse(cached) : null;

    const registerOnAsaas = false;

    try {
      if (registerOnAsaas) {
        asaasCustomer = await asaasService.createCustomer({
          name: data.nome_responsavel,
          cpfCnpj: data.cpf_responsavel,
          mobilePhone: data.telefone_responsavel,
          notificationDisabled: true,
        });
        data.asaas_customer_id = asaasCustomer.id;
      }

      const { data: insertedPassageiro, error: insertPassageiroError } =
        await supabase
          .from("passageiros")
          .insert([data])
          .select()
          .single();

      if (insertPassageiroError) throw insertPassageiroError;
      newPassageiro = insertedPassageiro;

      try {
        const status = previousStatus ? { ...previousStatus } : {};
        status.step_passageiros = true;
        localStorage.setItem(storageKey, JSON.stringify(status));
      } catch (e) {
        console.error("Erro ao atualizar QuickStart (passageiro):", e);
      }

      if (emitirCobranca) {
        const currentDate = new Date();
        const mes = currentDate.getMonth() + 1;
        const ano = currentDate.getFullYear();
        const diaInformado = data.dia_vencimento;
        const hoje = currentDate.getDate();
        const vencimentoAjustado = diaInformado < hoje ? hoje : diaInformado;
        const dataVencimento = new Date(ano, mes - 1, vencimentoAjustado);

        if (registerOnAsaas) {
          payment = await asaasService.createPayment({
            customer: newPassageiro.asaas_customer_id,
            billingType: "UNDEFINED",
            value: data.valor_cobranca,
            dueDate: toLocalDateString(dataVencimento),
            description: `Cobrança ${mes}/${ano}`,
            externalReference: newPassageiro.id,
          });
        }

        const { error: cobrancaError } = await supabase
          .from("cobrancas")
          .insert([
            {
              passageiro_id: newPassageiro.id,
              mes,
              ano,
              valor: data.valor_cobranca,
              data_vencimento: toLocalDateString(dataVencimento),
              status: "pendente",
              usuario_id: data.usuario_id,
              origem: "automatica",
              asaas_payment_id: payment ? payment.id : null,
              asaas_invoice_url: payment ? payment.invoiceUrl : null,
              asaas_bankslip_url: payment ? payment.bankSlipUrl : null,
            },
          ]);

        if (cobrancaError) throw cobrancaError;
      }

      if (prePassageiroId) {
        const { error: deletePreError } = await supabase
          .from("pre_passageiros")
          .delete()
          .eq("id", prePassageiroId);

        if (deletePreError) {
          throw new Error("Falha crítica ao finalizar o pré-cadastro. Acionando reversão.");
        }
      }

      return { newPassageiro, asaasCustomer, payment };

    } catch (err: any) {
      console.error("Falha no processo. Iniciando Rollback:", err);

      try {
        if (previousStatus) {
          localStorage.setItem(storageKey, JSON.stringify(previousStatus));
          console.warn("QuickStart revertido ao estado anterior (passageiro).");
        }
      } catch (storageErr) {
        console.error("Erro ao restaurar QuickStart:", storageErr);
      }

      try {
        if (registerOnAsaas && payment?.id) await asaasService.deletePayment(payment.id);
        if (newPassageiro?.id) await supabase.from("passageiros").delete().eq("id", newPassageiro.id);
        if (asaasCustomer?.id) await asaasService.deleteCustomer(asaasCustomer.id);

      } catch (rollbackErr) {
        console.error("Erro no processo de Rollback CRÍTICO:", rollbackErr);
      }

      throw new Error(err.message || "Erro desconhecido ao processar o cadastro.");
    }
  },

  async createPassageiroComTransacao(data: any, usuarioId: string): Promise<void> {
    if (!usuarioId) return;

    const { emitir_cobranca_mes_atual, ...pureData } = data;

    const passageiroData = {
      ...pureData,
      nome: cleanString(pureData.nome, true),
      nome_responsavel: cleanString(pureData.nome_responsavel, true),
      email_responsavel: cleanString(pureData.email_responsavel),
      logradouro: cleanString(pureData.logradouro, true),
      bairro: cleanString(pureData.bairro, true),
      cidade: cleanString(pureData.cidade, true),
      referencia: cleanString(pureData.referencia, true),
      observacoes: cleanString(pureData.observacoes, true),
      valor_cobranca: moneyToNumber(pureData.valor_cobranca),
      dia_vencimento: Number(pureData.dia_vencimento),
      escola_id: pureData.escola_id || null,
      ativo: pureData.ativo ?? true,
      usuario_id: usuarioId,
      cpf_responsavel: pureData.cpf_responsavel.replace(/\D/g, ""),
      telefone_responsavel: pureData.telefone_responsavel.replace(/\D/g, ""),
    };

    await this.processarNovoPassageiro(
      passageiroData,
      emitir_cobranca_mes_atual,
      null
    );
  },

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

    if (passageiro?.asaas_customer_id) {
      try {
        await asaasService.deleteCustomer(passageiro.asaas_customer_id);
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

  async updatePassageiroComTransacao(
    id: string,
    data: any
  ): Promise<void> {
    const registerOnAsaas = false;
    const { emitir_cobranca_mes_atual, ...pureData } = data;
    const passageiroData = {
      ...pureData,
      nome: cleanString(pureData.nome, true),
      nome_responsavel: cleanString(pureData.nome_responsavel, true),
      email_responsavel: cleanString(pureData.email_responsavel),
      logradouro: cleanString(pureData.logradouro, true),
      bairro: cleanString(pureData.bairro, true),
      cidade: cleanString(pureData.cidade, true),
      referencia: cleanString(pureData.referencia, true),
      observacoes: cleanString(pureData.observacoes, true),
      valor_cobranca: moneyToNumber(pureData.valor_cobranca),
      dia_vencimento: Number(pureData.dia_vencimento),
      escola_id: pureData.escola_id || null,
      ativo: pureData.ativo ?? true,
      cpf_responsavel: pureData.cpf_responsavel.replace(/\D/g, ""),
      telefone_responsavel: pureData.telefone_responsavel.replace(/\D/g, ""),
    };

    let rollbackNeeded = false;
    let snapshotPassageiro: any = null;

    try {
      const { data: oldPassageiro, error: fetchError } = await supabase
        .from("passageiros")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      snapshotPassageiro = { ...oldPassageiro };

      if (registerOnAsaas && oldPassageiro.asaas_customer_id) {

        const nomeMudou = oldPassageiro.nome_responsavel !== passageiroData.nome_responsavel;
        const cpfMudou = oldPassageiro.cpf_responsavel !== passageiroData.cpf_responsavel;
        const telefoneMudou = oldPassageiro.telefone_responsavel !== passageiroData.telefone_responsavel;
        const emailMudou = oldPassageiro.email_responsavel !== passageiroData.email_responsavel;

        if (nomeMudou || cpfMudou || telefoneMudou || emailMudou) {

          await asaasService.updateCustomer(oldPassageiro.asaas_customer_id, {
            name: passageiroData.nome_responsavel,
            cpfCnpj: passageiroData.cpf_responsavel,
            mobilePhone: passageiroData.telefone_responsavel,
            email: passageiroData.email_responsavel,
          });
        }
      }

      const { error: updateError } = await supabase
        .from("passageiros")
        .update(passageiroData)
        .eq("id", id);

      if (updateError) throw updateError;
      rollbackNeeded = true;


    } catch (err: any) {
      if (rollbackNeeded && snapshotPassageiro) {
        try {
          await supabase
            .from("passageiros")
            .update(snapshotPassageiro)
            .eq("id", id);
          console.log("Rollback da edição de passageiro realizado com sucesso.");
        } catch (rollbackErr) {
          console.error("Erro no rollback da edição:", rollbackErr);
        }
      }
      throw new Error(err.message || "Erro desconhecido ao atualizar passageiro.");
    }
  },

  async toggleAtivo(passageiroId: string, statusAtual: boolean): Promise<boolean> {
    const novoStatus = !statusAtual;

    const { error: passageiroUpdateError } = await supabase
      .from("passageiros")
      .update({ ativo: novoStatus })
      .eq("id", passageiroId);

    if (passageiroUpdateError) {
      throw new Error(`Falha ao ${novoStatus ? "ativar" : "desativar"} o passageiro no banco de dados.`);
    }

    if (!novoStatus) {

      const { error: updateCobrancasError } = await supabase
        .from("cobrancas")
        .update({ desativar_lembretes: true })
        .eq("passageiro_id", passageiroId)
        .neq("status", "pago")
        .eq("origem", "automatica");

      if (updateCobrancasError) {
        console.error("Falha ao desativar notificações de cobranças pendentes em massa:", updateCobrancasError);
      }
    }

    return novoStatus;
  },
};