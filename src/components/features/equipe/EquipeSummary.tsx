import { MembroEquipe } from "@/types/equipe";
import { UserType } from "@/types/enums";
import { formatShortName } from "@/utils/formatters/name";
import { phoneMask, cpfCnpjMask } from "@/utils/masks";
import { Car, Mail, Phone, FileText, UserCheck, Users2 } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";

interface EquipeSummaryProps {
  membro: MembroEquipe;
}

export function EquipeSummary({ membro }: EquipeSummaryProps) {
  const isMonitor = membro.tipo === UserType.MONITOR;
  const displayName = membro.apelido || formatShortName(membro.nome, true);

  return (
    <div className="flex flex-col text-left w-full min-w-0 px-0.5 pt-0.5 pb-1">
      <div className="flex justify-between items-center mb-1.5 w-full min-w-0 gap-2">
        <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-[0.05em] leading-none">
          {isMonitor ? "Monitor" : "Motorista"}
        </span>

        <StatusBadge status={membro.ativo !== false} />
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-[#0a0a0a] tracking-tight leading-tight break-words w-full min-w-0 mt-0.5">
        {membro.nome}
      </h2>

      {membro.apelido && (
        <p className="text-xs font-normal text-[#737373] mt-0.5 leading-snug line-clamp-1 break-words w-full min-w-0">
          Apelido: {membro.apelido}
        </p>
      )}

      <div className="mt-2.5 pt-2.5 border-t border-[#e5e5e5]/80 space-y-1.5 text-xs text-[#737373] w-full min-w-0">
        {membro.telefone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#737373] shrink-0" />
            <span className="text-[#0a0a0a]">{phoneMask(membro.telefone)}</span>
          </div>
        )}
        {membro.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#737373] shrink-0" />
            <span className="truncate text-[#0a0a0a]">{membro.email}</span>
          </div>
        )}
        {membro.cpfcnpj && (
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#737373] shrink-0" />
            <span className="text-[#0a0a0a]">CPF/CNPJ: {cpfCnpjMask(membro.cpfcnpj)}</span>
          </div>
        )}
        {membro.veiculos && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#e5e5e5]/60 mt-1">
            <Car className="w-3.5 h-3.5 text-[#737373] shrink-0" />
            <span className="text-xs text-[#737373] truncate">
              Veículo: <strong className="text-[#0a0a0a] font-semibold">{membro.veiculos.modelo} ({membro.veiculos.placa})</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
