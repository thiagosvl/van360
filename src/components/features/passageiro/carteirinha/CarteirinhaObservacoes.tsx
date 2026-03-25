import { Button } from "@/components/ui/button";
import { StickyNote, Pencil } from "lucide-react";

interface CarteirinhaObservacoesProps {
  observacoes?: string;
  onEditClick: () => void;
}

export const CarteirinhaObservacoes = ({
  observacoes,
  onEditClick,
}: CarteirinhaObservacoesProps) => {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-diff-shadow overflow-hidden group">
      <div className="px-6 py-6 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-sm">
            <StickyNote className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Informações Extras
            </span>
            <h3 className="text-sm font-headline font-black text-[#1a3a5c]">
              Observações
            </h3>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onEditClick}
          className="h-10 w-10 rounded-xl text-slate-300 hover:text-[#1a3a5c] hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-6">
        {observacoes ? (
          <p className="text-xs font-bold text-slate-500 leading-relaxed italic border-l-2 border-amber-100 pl-4 py-1">
            "{observacoes}"
          </p>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 opacity-30">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Nenhuma anotação registrada
            </p>
          </div>
        )}

        <Button
          variant="ghost"
          onClick={onEditClick}
          className="w-full mt-6 h-11 rounded-xl border border-dashed border-slate-200 text-slate-400 hover:text-[#1a3a5c] hover:border-[#1a3a5c]/20 hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest transition-all"
        >
          {observacoes ? "Editar Observações" : "Adicionar Observação"}
        </Button>
      </div>
    </div>
  );
};
