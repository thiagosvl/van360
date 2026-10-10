import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { useGastoCategorias, useCreateGastoCategoria, useUpdateGastoCategoria, useDeleteGastoCategoria, safeCloseDialog } from "@/hooks";
import { cn } from "@/lib/utils";
import { getCategoriaMetadata } from "@/utils/domain";
import { Edit2, Plus, Tag, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { GastoCategoriaForm } from "@/components/features/financeiro/GastoCategoriaForm";
import { GastoCategoriaResponse } from "@/services/api/gasto-categoria.api";

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

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const handleStartEdit = (cat: GastoCategoriaResponse) => {
    setIsAdding(false);
    setEditingId(cat.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    openConfirmationDialog({
      title: "Excluir categoria?",
      description: `Tem certeza que deseja excluir a categoria "${name}"? Novos gastos não poderão usá-la, mas os históricos salvos com ela serão mantidos.`,
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

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(val) => !val && handleClose()} lockClose={isPending}>
      <BaseDialog.Header
        title="Gerenciar Categorias"
        icon={<Tag className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />

      <BaseDialog.Body className="p-4 sm:p-6 space-y-4 pt-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-[#737373] uppercase tracking-[0.05em]">
              Categorias
            </h4>
            <span className="text-[11px] font-semibold text-[#737373] bg-[#f5f5f5] px-2 py-0.5 rounded-[18px] border border-[#e5e5e5]">
              {categoriasOrdenadas.length}
            </span>
          </div>

          {!isAdding && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-[18px] border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium px-3 gap-1.5 shadow-none transition-all active:scale-[0.98] cursor-pointer"
              onClick={() => {
                setEditingId(null);
                setIsAdding(true);
              }}
              disabled={isPending}
            >
              <Plus className="w-3.5 h-3.5 text-[#737373]" />
              Nova Categoria
            </Button>
          )}
        </div>

        {isAdding && (
          <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-[20px] p-4 shadow-none animate-in fade-in slide-in-from-top-1 duration-200">
            <GastoCategoriaForm
              onSubmit={async ({ nome, cor }) => {
                await createMutation.mutateAsync({
                  nome,
                  cor: cor || "slate",
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

        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#737373]">Carregando categorias...</div>
        ) : (
          <div className="border border-[#e5e5e5] rounded-[20px] overflow-hidden bg-white shadow-2xs">
            <div className="divide-y divide-[#e5e5e5] max-h-[300px] sm:max-h-[340px] overflow-y-auto [scrollbar-width:thin]">
              {categoriasOrdenadas.map((cat) => {
                const isEditing = editingId === cat.id;
                const metadata = getCategoriaMetadata(cat.slug, [cat]);
                const isSystem = cat.usuario_id === null;

                if (isEditing) {
                  return (
                    <div key={cat.id} className="p-4 bg-[#fafafa] space-y-3 animate-in fade-in duration-200">
                      <h5 className="text-xs font-semibold text-[#0a0a0a]">Editar Categoria</h5>
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
                  <div key={cat.id} className="flex items-center justify-between px-3.5 py-3 hover:bg-[#fafafa] transition-colors gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a] shrink-0">
                        <metadata.icon className="w-4 h-4 text-[#737373]" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-[#0a0a0a] truncate">{cat.nome}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isSystem ? (
                        <span className="text-[11px] font-medium text-[#737373] bg-[#f5f5f5] px-2.5 py-0.5 rounded-[18px] border border-[#e5e5e5]">
                          Padrão
                        </span>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] rounded-[14px] transition-colors cursor-pointer"
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
                            className="w-7 h-7 text-[#737373] hover:text-[#e7000b] hover:bg-red-50 rounded-[14px] transition-colors cursor-pointer"
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
          </div>
        )}
      </BaseDialog.Body>
    </BaseDialog>
  );
}
