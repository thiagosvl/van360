import { Button } from "@/components/ui/button";
import { Escola } from "@/types/escola";
import { Veiculo } from "@/types/veiculo";
import { periodos } from "@/utils/formatters/periodo";
import {
  Calendar,
  Car,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  RotateCcw,
  School,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { memo, useState } from "react";
import { PassageiroBatchUpdateItem } from "@/services/api/passageiro.api";

type BulkField = "escola_id" | "veiculo_id" | "periodo" | "dia_vencimento";

interface AtualizacaoRapidaStickyBarProps {
  dirtyCount: number;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  selectedCount: number;
  onClearSelection: () => void;
  escolas: Escola[];
  veiculos: Veiculo[];
  onApplyBulk: (
    field: BulkField,
    val: PassageiroBatchUpdateItem[BulkField]
  ) => void;
}

export const AtualizacaoRapidaStickyBar = memo(function AtualizacaoRapidaStickyBar({
  dirtyCount,
  isSaving,
  onSave,
  onDiscard,
  selectedCount,
  onClearSelection,
  escolas,
  veiculos,
  onApplyBulk,
}: AtualizacaoRapidaStickyBarProps) {
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  if (dirtyCount === 0 && selectedCount === 0) return null;

  return (
    <div className="fixed bottom-[calc(4.5rem+var(--safe-area-bottom))] md:bottom-6 left-3 right-3 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl z-40 flex flex-col gap-2 pointer-events-none transition-all duration-200">
      {selectedCount > 0 && (
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-blue-200 shadow-xl rounded-2xl p-3 sm:px-4 transition-all animate-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-[#1a3a5c] flex items-center justify-center font-bold text-xs shrink-0">
                <CheckSquare className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 whitespace-nowrap">
                <strong className="text-[#1a3a5c]">{selectedCount}</strong>{" "}
                <span className="sm:hidden">{selectedCount === 1 ? "aluno" : "alunos"}</span>
                <span className="hidden sm:inline">{selectedCount === 1 ? "aluno selecionado" : "alunos selecionados"}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                onClick={() => setIsBulkOpen((prev) => !prev)}
                className="h-8 px-2.5 sm:px-3 rounded-xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-bold text-xs gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                <span>Alterar</span>
                {isBulkOpen ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronUp className="w-3 h-3 shrink-0" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClearSelection}
                title="Desmarcar todos"
                className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {isBulkOpen && (
            <div className="pt-2.5 mt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in-50 duration-150">
              <div className="relative">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onApplyBulk("veiculo_id", e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="w-full h-8 pl-7 pr-6 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#1a3a5c] shadow-2xs"
                >
                  <option value="" disabled>Definir veículo...</option>
                  {(veiculos || []).map((v) => (
                    <option key={v.id} value={v.id}>{v.modelo} - {v.placa}</option>
                  ))}
                </select>
                <Car className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onApplyBulk("escola_id", e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="w-full h-8 pl-7 pr-6 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#1a3a5c] shadow-2xs"
                >
                  <option value="" disabled>Definir escola...</option>
                  {(escolas || []).map((e) => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
                <School className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onApplyBulk("periodo", e.target.value === "none" ? null : e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="w-full h-8 pl-7 pr-6 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#1a3a5c] shadow-2xs"
                >
                  <option value="" disabled>Definir período...</option>
                  <option value="none">Nenhum</option>
                  {periodos.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onApplyBulk("dia_vencimento", e.target.value === "none" ? null : Number(e.target.value));
                      e.target.value = "";
                    }
                  }}
                  className="w-full h-8 pl-7 pr-6 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#1a3a5c] shadow-2xs"
                >
                  <option value="" disabled>Definir vencimento...</option>
                  <option value="none">Sem vencimento</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={String(d)}>Dia {d}</option>
                  ))}
                </select>
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      )}

      {dirtyCount > 0 && (
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl rounded-2xl px-4 py-2.5 sm:py-3 transition-all animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1a3a5c] animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                <strong className="text-[#1a3a5c]">{dirtyCount}</strong>{" "}
                {dirtyCount === 1 ? "aluno com alterações" : "alunos com alterações"}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onDiscard}
                disabled={isSaving}
                className="h-9 px-3 sm:px-4 rounded-xl text-xs font-bold text-slate-600 border-slate-200 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                Descartar
              </Button>

              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="h-9 px-4 sm:px-6 rounded-xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5 shrink-0" />
                    Salvar ({dirtyCount})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
