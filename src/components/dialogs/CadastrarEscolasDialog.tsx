import { useState, useRef, useEffect } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { useCreateEscolasBatch } from "@/hooks/api/useEscolaMutations";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { Escola } from "@/types/escola";
import { Usuario } from "@/types/usuario";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "@/utils/notifications/toast";

interface CadastrarEscolasDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (primeiraEscola: Escola, todasEscolas: Escola[]) => void;
  profile?: Usuario | null;
}

export default function CadastrarEscolasDialog({
  isOpen,
  onClose,
  onSuccess,
  profile: profileProp,
}: CadastrarEscolasDialogProps) {
  const [nomes, setNomes] = useState<string[]>([""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { user } = useSession();
  const { profile: profileFromHook } = useProfile(
    profileProp ? undefined : isOpen ? user?.id : undefined
  );
  const usuarioId = profileProp?.id || profileFromHook?.id || user?.id;

  const createBatchMutation = useCreateEscolasBatch();

  useEffect(() => {
    if (isOpen) {
      setNomes([""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleAddRow = () => {
    setNomes((prev) => {
      const next = [...prev, ""];
      setTimeout(() => {
        inputRefs.current[next.length - 1]?.focus();
      }, 50);
      return next;
    });
  };

  const handleRemoveRow = (index: number) => {
    if (nomes.length <= 1) return;
    setNomes((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const targetIndex = Math.max(0, index - 1);
      setTimeout(() => {
        inputRefs.current[targetIndex]?.focus();
      }, 50);
      return next;
    });
  };

  const handleChangeName = (index: number, value: string) => {
    setNomes((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const pasteData = e.clipboardData.getData("text");
    if (!pasteData || !pasteData.includes("\n")) return;

    e.preventDefault();
    const pastedLines = pasteData
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (pastedLines.length === 0) return;

    setNomes((prev) => {
      const next = [...prev];
      next.splice(index, 1, ...pastedLines);
      setTimeout(() => {
        const nextIndex = Math.min(inputRefs.current.length - 1, index + pastedLines.length - 1);
        inputRefs.current[nextIndex]?.focus();
      }, 50);
      return next;
    });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index === nomes.length - 1) {
        if (nomes[index].trim().length > 0) {
          handleAddRow();
        }
      } else {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (e.key === "Backspace" && nomes[index] === "" && nomes.length > 1) {
      e.preventDefault();
      handleRemoveRow(index);
    }
  };

  const handleSave = async () => {
    if (!usuarioId) {
      toast.error("Usuário não identificado.");
      return;
    }

    const nomesValidos = nomes
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (nomesValidos.length === 0) {
      toast.error("Informe o nome de pelo menos uma escola.");
      inputRefs.current[0]?.focus();
      return;
    }

    try {
      const novasEscolas = await createBatchMutation.mutateAsync({
        usuarioId,
        nomes: nomesValidos,
      });

      if (novasEscolas && novasEscolas.length > 0) {
        onSuccess?.(novasEscolas[0], novasEscolas);
      }

      safeCloseDialog(onClose);
    } catch {
    }
  };

  const countPreenchidas = nomes.filter((n) => n.trim().length > 0).length;
  const submitLabel =
    countPreenchidas > 1
      ? `Cadastrar ${countPreenchidas} Escolas`
      : "Cadastrar Escola";

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !createBatchMutation.isPending) {
          safeCloseDialog(onClose);
        }
      }}
      lockClose={createBatchMutation.isPending}
      maxWidth="md"
      description="Cadastro de escolas em lote"
    >
      <BaseDialog.Header
        title="Cadastrar Escolas"
        subtitle="Adicione as escolas que você atende"
        icon={<Building2 className="w-5 h-5 text-[#1a3a5c]" />}
        onClose={() => safeCloseDialog(onClose)}
        hideCloseButton={createBatchMutation.isPending}
      />

      <BaseDialog.Body className="space-y-4">
        <Banner
          variant="info"
          description={
            <span>
              Digite o nome como você costuma chamar no dia a dia (ex:{" "}
              <strong>Santa Maria</strong>, <strong>Edilamar</strong>, etc).
            </span>
          }
        />

        <div className="space-y-2.5">
          {nomes.map((nome, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-6 text-center text-xs font-bold text-slate-400 select-none">
                {index + 1}.
              </span>

              <div className="relative flex-1">
                <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  value={nome}
                  maxLength={100}
                  placeholder="Ex.: Santa Maria"
                  onChange={(e) => handleChangeName(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={(e) => handlePaste(e, index)}
                  disabled={createBatchMutation.isPending}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#1a3a5c] focus:bg-white focus:ring-2 focus:ring-[#1a3a5c]/10 rounded-xl text-xs text-slate-800 font-semibold transition-all outline-none disabled:opacity-50"
                />
              </div>

              {nomes.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRow(index)}
                  disabled={createBatchMutation.isPending}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
                  aria-label="Remover linha"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddRow}
          disabled={createBatchMutation.isPending}
          className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#1a3a5c]/40 hover:bg-blue-50/40 text-slate-600 hover:text-[#1a3a5c] font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer group disabled:opacity-50 disabled:pointer-events-none"
        >
          <div className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-[#1a3a5c] group-hover:text-white flex items-center justify-center transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span>Adicionar outra escola</span>
          <span className="text-[11px] text-slate-400 font-normal ml-1 hidden sm:inline">
            (ou tecle Enter)
          </span>
        </button>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label={submitLabel}
          onClick={handleSave}
          isLoading={createBatchMutation.isPending}
          disabled={createBatchMutation.isPending || countPreenchidas === 0}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
