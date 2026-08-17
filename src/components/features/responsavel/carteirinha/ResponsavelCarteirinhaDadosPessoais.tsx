import React from "react";
import { ResponsavelCarteirinhaData } from "@/types/responsavel";
import { formatDateToBR, formatGenero, formatarEnderecoCompleto, formatFirstName } from "@/utils/formatters";
import { Calendar, User, MapPin, Users, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

import { ResponsavelCarteirinhaObservacoes } from "./ResponsavelCarteirinhaObservacoes";

interface ResponsavelCarteirinhaDadosPessoaisProps {
  carteirinha: ResponsavelCarteirinhaData;
}

const InfoField = ({
  icon,
  label,
  value,
  fullWidth = false,
  hasBorder = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: React.ReactNode | null;
  fullWidth?: boolean;
  hasBorder?: boolean;
}) => {
  const isInvalidOrEmpty =
    value === null ||
    value === undefined ||
    (typeof value === "string" &&
      (value.trim() === "" || value.trim() === "-" || value.trim() === "—"));

  return (
    <div
      className={cn(
        "min-w-0 space-y-1 text-left",
        fullWidth && "col-span-2 sm:col-span-2",
        hasBorder && "pt-2.5 border-t border-slate-200/50"
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
        <span className="text-xs font-medium text-slate-500 leading-none">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "text-xs sm:text-sm font-bold text-[#1a3a5c] leading-tight break-words",
          isInvalidOrEmpty && "text-slate-400 font-normal"
        )}
      >
        {isInvalidOrEmpty ? "—" : value}
      </p>
    </div>
  );
};

export const ResponsavelCarteirinhaDadosPessoais: React.FC<ResponsavelCarteirinhaDadosPessoaisProps> = ({
  carteirinha,
}) => {
  const respPrincipal = carteirinha.responsavel_principal;
  const enderecoFormatado = respPrincipal?.logradouro
    ? formatarEnderecoCompleto(respPrincipal as any)
    : null;

  const referenciaEmbarque = respPrincipal?.referencia || null;
  const primeiroNomeResp = formatFirstName(respPrincipal?.nome);

  const inicioTransporteTexto = carteirinha.data_inicio_transporte
    ? formatDateToBR(carteirinha.data_inicio_transporte)
    : null;

  const fimTransporteTexto = carteirinha.data_fim_transporte
    ? formatDateToBR(carteirinha.data_fim_transporte)
    : null;

  return (
    <div className="space-y-4 text-left">
      {/* 1. Bloco: Informações do Passageiro */}
      <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-xs p-5 space-y-3">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
          <User className="w-4.5 h-4.5 text-[#1a3a5c]" />
          <h3 className="text-sm font-bold text-[#16314f]">
            Informações do Passageiro
          </h3>
        </div>
        <InfoField
          label="Professor(a)"
          value={carteirinha.nome_professor}
          fullWidth
        />
        <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200/50">
          <InfoField
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Data de nascimento"
            value={carteirinha.data_nascimento ? formatDateToBR(carteirinha.data_nascimento) : null}
          />
          <InfoField
            icon={<Users className="h-3.5 w-3.5" />}
            label="Gênero"
            value={carteirinha.genero ? formatGenero(carteirinha.genero) : null}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200/50">
          <InfoField
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Início do transporte"
            value={inicioTransporteTexto}
          />
          <InfoField
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Término do transporte"
            value={fimTransporteTexto}
          />
        </div>
      </div>

      {/* 2. Bloco: Endereço de Embarque */}
      <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-xs p-5 space-y-3">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
          <MapPin className="w-4.5 h-4.5 text-[#1a3a5c]" />
          <h3 className="text-sm font-bold text-[#16314f]">
            Endereço de Embarque
          </h3>
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <span className="text-xs font-medium text-slate-500">
            {primeiroNomeResp ? `Endereço Principal (${primeiroNomeResp})` : "Endereço completo"}
          </span>
          <p className="text-xs text-[#1a3a5c] font-semibold leading-tight block break-words whitespace-pre-wrap">
            {enderecoFormatado || <span className="text-slate-400 font-normal">—</span>}
          </p>
          {referenciaEmbarque && (
            <p className="text-[11px] text-slate-500 font-normal leading-normal mt-1 block break-words">
              <span className="text-slate-400">Referência: </span>{referenciaEmbarque}
            </p>
          )}
        </div>
      </div>

      {/* 3. Observações */}
      <ResponsavelCarteirinhaObservacoes carteirinha={carteirinha} />
    </div>
  );
};
