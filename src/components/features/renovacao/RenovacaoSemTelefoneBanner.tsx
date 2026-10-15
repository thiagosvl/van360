import { useState } from "react";
import { AlertTriangle, ChevronDown, ArrowRight } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RenovacaoSemTelefoneBannerProps {
  count: number;
  onVerAlunos: () => void;
}

export function RenovacaoSemTelefoneBanner({
  count,
  onVerAlunos,
}: RenovacaoSemTelefoneBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (count <= 0) return null;

  const alunoLabel = count === 1 ? "aluno não aparece abaixo" : "alunos não aparecem abaixo";

  return (
    <>
      <div className="block sm:hidden rounded-[18px] border border-amber-500/25 bg-amber-500/[0.08] overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-left cursor-pointer select-none active:bg-amber-500/[0.12] transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-semibold text-[#0a0a0a] truncate">
              {count} {alunoLabel}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700 shrink-0">
            <span>{isExpanded ? "Ocultar" : ""}</span>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </div>
        </button>

        {isExpanded && (
          <div className="px-3.5 pb-3 pt-2 border-t border-amber-500/15 space-y-2.5">
            <p className="text-xs text-[#737373] leading-relaxed">
              Eles não possuem telefone cadastrado e só aparecerão na lista de renovação após o preenchimento do contato.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onVerAlunos}
              className="w-full h-8 px-3 rounded-[14px] bg-white border-amber-500/30 text-amber-900 hover:bg-amber-50 text-xs font-medium gap-1.5 shadow-none cursor-pointer"
            >
              <span>Ver e Cadastrar Contatos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      <div className="hidden sm:block">
        <Banner
          variant="warning"
          title={`${count} ${count === 1 ? "aluno sem telefone cadastrado" : "alunos sem telefone cadastrado"}`}
          description="Eles não aparecem na lista de renovação abaixo até que o telefone seja informado."
          action={{
            label: "Ver e Cadastrar Contatos",
            onClick: onVerAlunos,
          }}
          className="rounded-[18px]"
        />
      </div>
    </>
  );
}
