import { supabase } from "@/integrations/supabase/client";
import { PrePassageiro } from "@/types/prePassageiro";

interface QuickPreCadastroPayload {
    nome: string;
    nome_responsavel: string;
    email_responsavel: string;
    cpf_responsavel: string;
    telefone_responsavel: string;
    genero: string;
    usuario_id: string;
}

export const prePassageiroService = {

    async fetchPreCadastros(searchTerm: string = "", usuarioId: string): Promise<PrePassageiro[]> {
        if (!usuarioId) return;

        let query = supabase
            .from("pre_passageiros")
            .select("*")
            .eq("usuario_id", usuarioId)
            .order("nome");

        const term = searchTerm.trim();
        if (term.length > 0) {
            query = query.or(
                `nome.ilike.%${term}%,nome_responsavel.ilike.%${term}%`
            );
        }

        const { data, error } = await query;

        if (error) {
            console.error("Erro ao buscar pré-cadastros:", error);
            throw new Error("Falha ao carregar a lista de pré-cadastros.");
        }

        return data as PrePassageiro[];
    },

    async excluirPreCadastro(prePassageiroId: string): Promise<void> {
        const { error } = await supabase
            .from("pre_passageiros")
            .delete()
            .eq("id", prePassageiroId);

        if (error) {
            console.error("Erro ao excluir pré-cadastro:", error);
            throw new Error("Falha ao excluir o registro temporário.");
        }
    },

    async createPreCadastroRapido(payload: QuickPreCadastroPayload): Promise<void> {
        const { error } = await supabase.from("pre_passageiros").insert([
            {
                ...payload,
                escola_id: null,
                valor_cobranca: null,
                dia_vencimento: null,
            }
        ]);

        if (error) {
            console.error("Erro ao inserir pré-cadastro rápido:", error);
            throw new Error("Falha ao criar o registro temporário.");
        }
    }
};