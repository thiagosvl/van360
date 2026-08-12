import { ChevronDown, Route, Car, School } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ConfigurarRotaHeaderProps {
  nome: string;
  veiculoId: string;
  escolaFixaId: string;
  veiculosList: any[];
  escolasList: any[];
  isConfigExpanded: boolean;
  onToggleExpand: () => void;
  onNomeChange: (nome: string) => void;
  onVeiculoChange: (veiculoId: string) => void;
  onEscolaFixaChange: (escolaFixaId: string) => void;
}

export function ConfigurarRotaHeader({
  nome,
  veiculoId,
  escolaFixaId,
  veiculosList,
  escolasList,
  isConfigExpanded,
  onToggleExpand,
  onNomeChange,
  onVeiculoChange,
  onEscolaFixaChange,
}: ConfigurarRotaHeaderProps) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
      {/* Campo Obrigatório: Nome da Rota */}
      <div className="space-y-1.5 text-left">
        <Label htmlFor="nome" className="text-xs font-bold text-[#1a3a5c] uppercase tracking-wider flex items-center gap-1.5">
          <Route className="w-3.5 h-3.5 text-[#1a3a5c]" />
          <span>Nome da Rota</span>
          <span className="text-rose-500 font-bold">*</span>
        </Label>
        <Input
          id="nome"
          placeholder="Ex: Rota Manhã - Centro / Pompeia"
          value={nome}
          onChange={(e) => onNomeChange(e.target.value)}
          className="h-10 text-xs sm:text-sm font-semibold rounded-xl border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/20"
          required
        />
      </div>

      {/* Accordion/Toggle para Configurações Opcionais da Rota (Veículo e Escola Fixa) */}
      <div className="border-t border-slate-100 pt-2">
        <button
          type="button"
          onClick={onToggleExpand}
          className="w-full flex items-center justify-between text-xs font-bold text-[#1a3a5c] py-1 hover:text-[#1a3a5c]/80 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1a3a5c]" />
            Configurações da Rota (Veículo e Escola)
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isConfigExpanded ? "rotate-180" : ""}`} />
        </button>

        {isConfigExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-left animate-in fade-in-50 duration-200">
            {/* Campo Opcional: Veículo */}
            <div className="space-y-1.5">
              <Label htmlFor="veiculo" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                <span>Veículo da Rota</span>
              </Label>
              <Select value={veiculoId} onValueChange={onVeiculoChange}>
                <SelectTrigger id="veiculo" className="h-9 text-xs rounded-xl border-slate-200 bg-slate-50/50">
                  <SelectValue placeholder="Selecione um veículo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum veículo selecionado</SelectItem>
                  {veiculosList.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.modelo} ({v.placa})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campo Opcional: Escola Fixa */}
            <div className="space-y-1.5">
              <Label htmlFor="escolaFixa" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-slate-400" />
                <span>Escola Principal (Opcional)</span>
              </Label>
              <Select value={escolaFixaId} onValueChange={onEscolaFixaChange}>
                <SelectTrigger id="escolaFixa" className="h-9 text-xs rounded-xl border-slate-200 bg-slate-50/50">
                  <SelectValue placeholder="Selecione uma escola..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma escola fixa</SelectItem>
                  {escolasList.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
