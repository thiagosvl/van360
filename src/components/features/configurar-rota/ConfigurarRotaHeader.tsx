import { ChevronDown, Route, Car, School } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
    <div className="bg-white p-4 sm:p-5 rounded-[24px] shadow-xs border border-[#e5e5e5] space-y-4">
      <div className="space-y-1.5 text-left">
        <Label htmlFor="nome" className="text-xs font-semibold text-[#0a0a0a] flex items-center gap-1.5">
          <Route className="w-3.5 h-3.5 text-[#0a0a0a]" />
          <span>Nome da Rota</span>
          <span className="text-[#e7000b]">*</span>
        </Label>
        <Input
          id="nome"
          placeholder="Ex: Rota Manhã - Centro / Pompeia"
          value={nome}
          onChange={(e) => onNomeChange(e.target.value)}
          className="h-10 sm:h-11 text-sm font-normal rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-[#0a0a0a] placeholder:text-[#737373] focus:bg-white focus:border-[#0a0a0a]"
          required
        />
      </div>

      <div className="border-t border-[#e5e5e5] pt-2">
        <button
          type="button"
          onClick={onToggleExpand}
          className="w-full flex items-center justify-between text-xs font-medium text-[#0a0a0a] py-1 hover:text-[#737373] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a]" />
            Configurações da Rota (Veículo e Escola)
          </span>
          <ChevronDown className={cn("w-4 h-4 text-[#737373] transition-transform duration-200", isConfigExpanded && "rotate-180")} />
        </button>

        {isConfigExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-left animate-in fade-in-50 duration-200">
            <div className="space-y-1.5">
              <Label htmlFor="veiculo" className="text-xs font-medium text-[#737373] flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#737373]" />
                <span>Veículo da Rota</span>
              </Label>
              <NativeSelect
                id="veiculo"
                value={veiculoId}
                onChange={(e) => onVeiculoChange(e.target.value)}
                className="h-10 text-xs"
              >
                <option value="none">Nenhum veículo selecionado</option>
                {veiculosList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.modelo} ({v.placa})
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="escolaFixa" className="text-xs font-medium text-[#737373] flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-[#737373]" />
                <span>Escola Principal (Opcional)</span>
              </Label>
              <NativeSelect
                id="escolaFixa"
                value={escolaFixaId}
                onChange={(e) => onEscolaFixaChange(e.target.value)}
                className="h-10 text-xs"
              >
                <option value="none">Nenhuma escola fixa</option>
                {escolasList.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
