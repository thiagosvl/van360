import { memo } from "react";
import { User, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RenovacaoPassageiroItem } from "@/types/renovacao";
import { formatShortName, formatFirstName } from "@/utils/formatters";

interface RenovacaoSemTelefoneCardProps {
  item: RenovacaoPassageiroItem;
  onCadastrarResponsavel: (item: RenovacaoPassageiroItem) => void;
}

export const RenovacaoSemTelefoneCard = memo(function RenovacaoSemTelefoneCard({
  item,
  onCadastrarResponsavel,
}: RenovacaoSemTelefoneCardProps) {
  const shortName = formatShortName(item.nome, true);
  const respName = item.responsavel_principal?.nome
    ? formatFirstName(item.responsavel_principal.nome)
    : null;
  const temResponsavelSemTel = Boolean(item.responsavel_principal?.nome && !item.responsavel_principal?.telefone);

  return (
    <div className="rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] bg-white p-3.5 sm:p-4 shadow-xs hover:border-[#737373]/40 transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
          <h3 className="font-semibold text-[#0a0a0a] text-sm leading-tight truncate">
            {shortName}
          </h3>

          <div className="text-xs text-[#737373] truncate mt-1 flex items-center gap-1.5 font-normal">
            {temResponsavelSemTel ? (
              <span>
                Responsável: <strong className="text-[#0a0a0a] font-medium">{respName}</strong> (sem telefone)
              </span>
            ) : (
              <span>Responsável não cadastrado</span>
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
          variant="outline"
          size="sm"
          onClick={() => onCadastrarResponsavel(item)}
          className="w-full sm:w-auto h-9 px-3.5 rounded-[14px] sm:rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium gap-1.5 shadow-none cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5 text-[#737373]" />
          <span>{temResponsavelSemTel ? "Cadastrar Telefone" : "Cadastrar Responsável"}</span>
        </Button>
      </div>
    </div>
  );
});
