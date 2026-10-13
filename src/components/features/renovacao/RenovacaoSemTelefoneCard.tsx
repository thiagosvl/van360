import { memo } from "react";
import { User, PhoneCall, AlertTriangle } from "lucide-react";
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
    <div className="rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] bg-white p-4 sm:p-5 shadow-xs hover:border-[#737373]/50 transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {item.foto_url ? (
          <img
            src={item.foto_url}
            alt={shortName}
            className="h-10 w-10 rounded-full object-cover shrink-0 border border-[#e5e5e5]"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
            <User className="w-5 h-5 text-[#737373]" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[#0a0a0a] text-sm sm:text-base leading-tight truncate">
              {shortName}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px] bg-amber-500/[0.08] text-amber-700 border border-amber-500/20 shrink-0">
              <AlertTriangle className="w-3 h-3" />
              <span>Sem WhatsApp</span>
            </span>
          </div>

          <div className="text-xs text-[#737373] truncate mt-1 flex items-center gap-2">
            {temResponsavelSemTel ? (
              <span className="font-normal truncate">
                Responsável: <strong className="text-[#0a0a0a] font-medium">{respName}</strong> (sem telefone)
              </span>
            ) : (
              <span className="text-[#e7000b] font-medium">
                Nenhum responsável cadastrado
              </span>
            )}
            {item.escola_nome_atual && (
              <>
                <span className="text-[#e5e5e5]">•</span>
                <span className="truncate hidden min-[480px]:inline text-[#737373]">
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
          variant="tonal"
          onClick={() => onCadastrarResponsavel(item)}
          className="w-full sm:w-auto h-9 px-3.5 rounded-[18px] text-xs font-medium gap-1.5 cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>{temResponsavelSemTel ? "Preencher Telefone" : "Cadastrar Responsável"}</span>
        </Button>
      </div>
    </div>
  );
});
