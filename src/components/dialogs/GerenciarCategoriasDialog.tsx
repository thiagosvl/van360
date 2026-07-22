import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { useGastoCategorias, useCreateGastoCategoria, useUpdateGastoCategoria, useDeleteGastoCategoria } from "@/hooks";
import { cn } from "@/lib/utils";
import { getCategoriaMetadata } from "@/utils/domain";
import { Edit2, Plus, Tag, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { GastoCategoriaForm } from "@/components/features/financeiro/GastoCategoriaForm";

interface GerenciarCategoriasDialogProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioId?: string;
}

export default function GerenciarCategoriasDialog({
  isOpen,
  onClose,
  usuarioId,
}: GerenciarCategoriasDialogProps) {
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();
  
  const { data: categoriasData, isLoading } = useGastoCategorias({ enabled: isOpen });
  const createMutation = useCreateGastoCategoria();
  const updateMutation = useUpdateGastoCategoria();
  const deleteMutation = useDeleteGastoCategoria();

  // Estado para controlar colapso do formulário de criação
  const [isAdding, setIsAdding] = useState(false);

  // Estado para Edição Inline
  const [editingId, setEditingId] = useState<string | null>(null);

  // Ordenação das categorias: Customizadas do usuário primeiro, depois as do Sistema. Dentro de cada grupo, ordem alfabética.
  const categoriasOrdenadas = useMemo(() => {
    if (!categoriasData) return [];
    return [...categoriasData].sort((a, b) => {
      const aSystem = a.usuario_id === null;
      const bSystem = b.usuario_id === null;

      if (!aSystem && bSystem) return -1;
      if (aSystem && !bSystem) return 1;
      
      return a.nome.localeCompare(b.nome);
    });
  }, [categoriasData]);

  const handleStartEdit = (cat: any) => {
    setIsAdding(false); // Recolhe o bloco de cadastro do topo se estiver aberto
    setEditingId(cat.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    openConfirmationDialog({
      title: "Excluir categoria?",
      description: `Tem certeza que deseja excluir a categoria "${name}"? Novos gastos não poderão usá-la, mas os históricos salvos com ela serão mantidos (em cinza).`,
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          closeConfirmationDialog();
        } catch (error) {
          closeConfirmationDialog();
        }
      },
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose} lockClose={isPending}>
      <BaseDialog.Header
        title="Gerenciar Categorias"
        icon={<Tag className="w-5 h-5" />}
        onClose={onClose}
      />

      <BaseDialog.Body className="space-y-6 pt-2">
        {/* Bloco de Cadastro Colapsável */}
        <div className="space-y-3">
          {!isAdding ? (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-9 border-slate-200 text-[#1a3a5c] font-semibold text-xs px-4 shadow-sm transition-all active:scale-95 flex items-center gap-1.5 hover:bg-slate-50"
                onClick={() => {
                  setEditingId(null); // Recolhe qualquer edição ativa
                  setIsAdding(true);
                }}
                disabled={isPending}
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Categoria
              </Button>
            </div>
          ) : (
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
              <h4 className="text-xs font-bold text-slate-700 ml-1 mb-3">Nova Categoria</h4>
              <GastoCategoriaForm
                onSubmit={async ({ nome, cor }) => {
                  await createMutation.mutateAsync({
                    nome,
                    cor,
                    icone: "Tag"
                  });
                  setIsAdding(false);
                }}
                onCancel={() => setIsAdding(false)}
                isPending={createMutation.isPending}
                submitLabel="Adicionar"
                autoFocus={true}
              />
            </div>
          )}
        </div>

        {/* Lista de Categorias existentes */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 ml-1">Categorias Existentes</h4>
          
          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-400">Carregando categorias...</div>
          ) : (
            <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white max-h-[350px] overflow-y-auto shadow-sm">
              {categoriasOrdenadas.map((cat) => {
                const isEditing = editingId === cat.id;
                const metadata = getCategoriaMetadata(cat.slug, [cat]);
                const isSystem = cat.usuario_id === null;

                if (isEditing) {
                  return (
                    <div key={cat.id} className="p-4 bg-slate-50/70 space-y-3 animate-in fade-in duration-200">
                      <h5 className="text-[11px] font-bold text-slate-500 ml-1">Editar Categoria</h5>
                      <GastoCategoriaForm
                        initialValues={{ nome: cat.nome, cor: cat.cor }}
                        onSubmit={async ({ nome, cor }) => {
                          await updateMutation.mutateAsync({
                            id: cat.id,
                            data: { nome, cor }
                          });
                          setEditingId(null);
                        }}
                        onCancel={handleCancelEdit}
                        isPending={updateMutation.isPending}
                        submitLabel="Salvar"
                        autoFocus={true}
                      />
                    </div>
                  );
                }

                return (
                  <div key={cat.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center border border-transparent/10", metadata.bg, metadata.color)}>
                        <metadata.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{cat.nome}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSystem ? (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/30">
                          Padrão
                        </span>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                            onClick={() => handleStartEdit(cat)}
                            disabled={isPending}
                            title="Editar Categoria"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                            onClick={() => handleDelete(cat.id, cat.nome)}
                            disabled={isPending}
                            title="Excluir Categoria"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </BaseDialog.Body>
    </BaseDialog>
  );
}
