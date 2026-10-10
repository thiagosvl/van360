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
    <div className="flex flex-col p-4 sm:p-5 bg-white rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] text-left w-full min-w-0 overflow-hidden">
      <div className="flex justify-between items-center mb-2.5 w-full min-w-0 gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-6 h-6 rounded-[8px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#737373]">
            {isMonitor ? <Users2 className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
          </div>
          <span className="text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em] leading-none">
            {isMonitor ? "Monitor" : "Motorista"}
          </span>
        </div>

        <StatusBadge status={membro.ativo !== false} />
      </div>

      <div className="flex items-start gap-2 w-full min-w-0">
        <h1 className="text-base sm:text-lg font-semibold text-[#0a0a0a] tracking-tight leading-snug break-words w-full min-w-0">
          {membro.nome}
        </h1>
      </div>

      {membro.apelido && (
        <p className="text-xs font-normal text-[#737373] mt-0.5 leading-snug line-clamp-1 break-words w-full min-w-0">
          Apelido: {membro.apelido}
        </p>
      )}

      <div className="bg-[#f5f5f5] border border-[#e5e5e5] rounded-[16px] p-3 space-y-2 text-xs text-[#737373] mt-3">
        {membro.razao_social && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#0a0a0a]">Razão Social:</span> {membro.razao_social}
          </div>
        )}
        {membro.cpfcnpj && (
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#737373] shrink-0" />
            <span className="text-[#0a0a0a]">CPF/CNPJ: {cpfCnpjMask(membro.cpfcnpj)}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-[#737373] shrink-0" />
          <span className="truncate text-[#0a0a0a]">{membro.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-[#737373] shrink-0" />
          <span className="text-[#0a0a0a]">{phoneMask(membro.telefone || "")}</span>
        </div>
      </div>

      {membro.veiculos && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e5e5e5] w-full min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Car className="h-4 w-4 text-[#737373] shrink-0" />
            <span className="text-xs font-medium text-[#737373] truncate">
              Veículo: <strong className="text-[#0a0a0a] font-semibold">{membro.veiculos.modelo} ({membro.veiculos.placa})</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
