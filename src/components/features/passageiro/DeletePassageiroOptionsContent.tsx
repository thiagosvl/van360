import { useState } from "react";
import { CalendarX2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeletePassageiroMode = "matricula" | "aluno";

interface DeletePassageiroOptionsContentProps {
  nomeAluno: string;
  anoSelecionado: number;
  anosMatriculados: number[];
  defaultMode?: DeletePassageiroMode;
  onChangeMode: (mode: DeletePassageiroMode) => void;
}

export function DeletePassageiroOptionsContent({
  nomeAluno,
  anoSelecionado,
  anosMatriculados,
  defaultMode = "matricula",
  onChangeMode,
}: DeletePassageiroOptionsContentProps) {
  const [selected, setSelected] = useState<DeletePassageiroMode>(defaultMode);

  const outrosAnos = anosMatriculados.filter((a) => a !== anoSelecionado);

  const handleSelect = (mode: DeletePassageiroMode) => {
    setSelected(mode);
    onChangeMode(mode);
  };

  return (
    <div className="space-y-3 text-left">
      <p className="text-xs sm:text-sm text-[#737373]">
        <strong>{nomeAluno}</strong> possui matrícula em mais de um ano letivo (
        {anosMatriculados.join(", ")}). Escolha como deseja excluir:
      </p>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => handleSelect("matricula")}
          className={cn(
            "w-full text-left p-3.5 rounded-[18px] border transition-all flex items-start gap-3 cursor-pointer",
            selected === "matricula"
              ? "bg-amber-50/70 border-amber-400 ring-1 ring-amber-400/30"
              : "bg-[#fafafa] border-[#e5e5e5] hover:border-[#737373]/40"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-[12px] flex items-center justify-center shrink-0 mt-0.5",
              selected === "matricula"
                ? "bg-amber-500/15 text-amber-700"
                : "bg-white text-[#737373] border border-[#e5e5e5]"
            )}
          >
            <CalendarX2 className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-xs sm:text-sm font-semibold text-[#0a0a0a]">
              Excluir apenas a matrícula de {anoSelecionado}
            </span>
            <span className="block text-[11px] sm:text-xs text-[#737373] mt-0.5 leading-snug">
              Remove somente o vínculo e dados de {anoSelecionado}, mantendo o cadastro em{" "}
              {outrosAnos.join(", ")}.
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("aluno")}
          className={cn(
            "w-full text-left p-3.5 rounded-[18px] border transition-all flex items-start gap-3 cursor-pointer",
            selected === "aluno"
              ? "bg-rose-50/70 border-rose-400 ring-1 ring-rose-400/30"
              : "bg-[#fafafa] border-[#e5e5e5] hover:border-[#737373]/40"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-[12px] flex items-center justify-center shrink-0 mt-0.5",
              selected === "aluno"
                ? "bg-rose-500/15 text-rose-700"
                : "bg-white text-[#737373] border border-[#e5e5e5]"
            )}
          >
            <Trash2 className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-xs sm:text-sm font-semibold text-[#0a0a0a]">
              Excluir aluno de todos os anos
            </span>
            <span className="block text-[11px] sm:text-xs text-[#737373] mt-0.5 leading-snug">
              Remove permanentemente o cadastro do aluno e todos os registros de todos os anos.
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
