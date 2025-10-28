import { STORAGE_KEY_QUICKSTART_STATUS } from "@/constants";
import { supabase } from "@/integrations/supabase/client";
import { Escola } from "@/types/escola";

const fetchPassageirosAtivosCount = async (escolaId: string, usuarioId: string): Promise<number> => {
    if (!usuarioId) return;

    const { count, error } = await supabase
        .from("passageiros")
        .select("id", { count: "exact" })
        .eq("escola_id", escolaId)
        .eq("ativo", true)
        .eq("usuario_id", usuarioId);

    if (error) throw error;
    return count || 0;
};

export const fetchEscolasComContagemAtivos = async (usuarioId: string) => {
    if (!usuarioId) return [];

    const { data, error } = await supabase
        .from("escolas")
        .select(`*, passageiros(count)`)
        .eq("usuario_id", usuarioId)
        .eq("passageiros.ativo", true)
        .order("nome", { ascending: true });

    if (error) throw error;

    return (
        data?.map((escola) => ({
            ...escola,
            passageiros_ativos_count: escola.passageiros.filter((p) => p.ativo).length,
        })) ?? []
    );
};

export const saveEscola = async (data: any, editingEscola: Escola | null, usuarioId: string): Promise<Escola> => {
    if (!usuarioId) return;

    if (editingEscola && editingEscola.ativo && data.ativo === false) {
        const count = await fetchPassageirosAtivosCount(editingEscola.id, usuarioId);
        if (count > 0) {
            throw new Error(`Existem passageiros ativos vinculados à escola.`);
        }
    }

    if (editingEscola) {
        const { data: updatedData, error } = await supabase
            .from("escolas")
            .update({ ...data, ativo: data.ativo ?? true })
            .eq("id", editingEscola.id)
            .select()
            .single();

        if (error) throw error;
        return updatedData as Escola;
    } else {
        const storageKey = STORAGE_KEY_QUICKSTART_STATUS;
        const previousStatus = localStorage.getItem(storageKey);

        const { data: createdData, error } = await supabase.from("escolas").insert([
            {
                ...data,
                ativo: true,
                usuario_id: usuarioId,
            },
        ])
            .select()
            .single();

        if (error) {
            if (previousStatus) {
                localStorage.setItem(storageKey, previousStatus);
                console.warn("QuickStart revertido ao estado anterior (escola).");
            }
            throw error;
        }

        const status = previousStatus ? JSON.parse(previousStatus) : {};
        status.step_escolas = true;
        localStorage.setItem(storageKey, JSON.stringify(status));

        return createdData as Escola;
    }
};

export const deleteEscola = async (escolaId: string, usuarioId: string): Promise<void> => {
    if (!usuarioId) return;

    const { data: passageiros, error: checkError } = await supabase
        .from("passageiros")
        .select("id")
        .eq("escola_id", escolaId)
        .eq("usuario_id", usuarioId);

    if (checkError) throw checkError;

    if (passageiros && passageiros.length > 0) {
        throw new Error("Não é possível excluir escola com passageiros vinculados.");
    }

    const { error: deleteError } = await supabase
        .from("escolas")
        .delete()
        .eq("id", escolaId);

    if (deleteError) throw deleteError;
};

export const toggleAtivo = async (escola: Escola, usuarioId): Promise<boolean> => {
    if (!usuarioId) return;

    const novoStatus = !escola.ativo;

    if (!novoStatus) {
        const count = await fetchPassageirosAtivosCount(escola.id, usuarioId);
        if (count > 0) {
            throw new Error("Existem passageiros ativos vinculados à escola.");
        }
    }

    const { error } = await supabase
        .from("escolas")
        .update({ ativo: novoStatus })
        .eq("id", escola.id);

    if (error) throw error;

    return novoStatus;
};

export const escolaService = {
    fetchEscolasComContagemAtivos,
    saveEscola,
    deleteEscola,
    toggleAtivo
};