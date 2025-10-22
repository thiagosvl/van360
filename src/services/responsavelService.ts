import { supabase } from "@/integrations/supabase/client";

export const responsavelService = {
  async loginPorCpfEmail(cpf: string, email: string) {
    const { data: passageiro, error } = await supabase
      .from("passageiros")
      .select("*, escolas(nome), veiculos(placa)")
      .eq("cpf_responsavel", cpf)
      .eq("email_responsavel", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !passageiro) return null

    const { data: outros, error: errorOutros } = await supabase
      .from("passageiros")
      .select("*, escolas(nome), veiculos(placa)")
      .eq("cpf_responsavel", cpf)
      .eq("email_responsavel", email)
      .eq("usuario_id", passageiro.usuario_id)
      .order("nome", { ascending: true })

    if (errorOutros) return [passageiro]
    return outros || [passageiro]
  },

  async listarAnosPorPassageiro(passageiroId: string) {
    const { data, error } = await supabase.rpc("listar_anos_por_passageiro", { passageiro_id_input: passageiroId })
    if (error) throw error
    return data || []
  },
}
