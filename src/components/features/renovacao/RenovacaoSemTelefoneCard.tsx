import { memo } from "react";
import { User, PhoneCall, School, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RenovacaoPassageiroItem } from "@/types/renovacao";
import { formatShortName } from "@/utils/formatters";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";

interface RenovacaoSemTelefoneCardProps {
  item: RenovacaoPassageiroItem;
  onCadastrarResponsavel: (item: RenovacaoPassageiroItem) => void;
}

export const RenovacaoSemTelefoneCard = memo(function RenovacaoSemTelefoneCard({
  item,
  onCadastrarResponsavel,
}: RenovacaoSemTelefoneCardProps) {
  const shortName = formatShortName(item.nome, true);
  const respName = formatNomeResponsavelExibicao(item.responsavel_principal?.nome);
  const temResponsavelSemTel = Boolean(item.responsavel_principal?.nome && !item.responsavel_principal?.telefone);

  return (
    <div className="rounded-2xl border border-orange-200/90 bg-white p-3.5 sm:p-4 shadow-2xs hover:border-orange-300 transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {item.foto_url ? (
          <img
            src={item.foto_url}
            alt={shortName}
            className="h-10 w-10 rounded-full object-cover shrink-0 border border-slate-200"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0 border border-orange-200">
            <User className="w-5 h-5 text-orange-500" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
              {shortName}
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 shrink-0">
              <AlertTriangle className="w-3 h-3 text-orange-500" />
              <span>Sem WhatsApp</span>
            </span>
          </div>

          <div className="text-xs text-slate-500 truncate mt-1 flex items-center gap-2">
            {temResponsavelSemTel ? (
              <span className="text-slate-700 font-medium truncate">
                Responsável: <strong className="text-slate-900">{respName}</strong> (sem número)
              </span>
            ) : (
              <span className="text-rose-600 font-medium">
                Nenhum responsável cadastrado
              </span>
            )}
            {item.escola_nome_atual && (
              <>
                <span className="text-slate-300">•</span>
                <span className="truncate hidden min-[480px]:inline text-slate-600">
                  {item.escola_nome_atual}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center">
        <Button
          type="button"
          onClick={() => onCadastrarResponsavel(item)}
          className="w-full sm:w-auto h-10 px-4 rounded-xl bg-[#1a3a5c] hover:bg-[#142e4a] text-white font-bold text-xs gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>{temResponsavelSemTel ? "Preencher Telefone" : "Cadastrar Responsável"}</span>
        </Button>
      </div>
    </div>
  );
});
