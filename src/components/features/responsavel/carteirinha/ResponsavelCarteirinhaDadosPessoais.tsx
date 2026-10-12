import React, { useState } from "react";
import { ResponsavelCarteirinhaData } from "@/types/responsavel";
import {
  formatDateToBR,
  formatGenero,
  formatPeriodo,
  formatModalidade,
  formatarEnderecoCompleto,
  formatFirstName,
  cleanSala,
} from "@/utils/formatters";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Users,
  DoorClosed,
  BookOpen,
  GraduationCap,
  Bus,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
        hasBorder && "pt-2.5 border-t border-[#e5e5e5]"
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-[#737373] shrink-0">{icon}</span>}
        <span className="text-xs font-normal text-[#737373] leading-none">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "text-xs sm:text-sm font-semibold text-[#0a0a0a] leading-tight break-words",
          isInvalidOrEmpty && "text-[#a3a3a3] font-normal"
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
  const [isCopiedEndereco, setIsCopiedEndereco] = useState(false);

  const respPrincipal = carteirinha.responsavel_principal;
  const enderecoFormatado = respPrincipal?.logradouro
    ? formatarEnderecoCompleto(respPrincipal)
    : carteirinha.logradouro
      ? formatarEnderecoCompleto(carteirinha)
      : null;

  const referenciaEmbarque = respPrincipal?.referencia || carteirinha.referencia || null;
  const primeiroNomeResp = formatFirstName(respPrincipal?.nome);

  const salaLimpa = cleanSala(carteirinha.sala) || null;

  const handleCopyEndereco = () => {
    if (!enderecoFormatado) return;
    navigator.clipboard.writeText(enderecoFormatado);
    setIsCopiedEndereco(true);
    toast.success("Endereço copiado para a área de transferência!");
    setTimeout(() => setIsCopiedEndereco(false), 2000);
  };

  const inicioTransporteTexto = carteirinha.data_inicio_transporte
    ? formatDateToBR(carteirinha.data_inicio_transporte)
    : null;

  const fimTransporteTexto = carteirinha.data_fim_transporte
    ? formatDateToBR(carteirinha.data_fim_transporte)
    : null;

  return (
    <div className="space-y-5 text-left">
      <div className="bg-[#ffffff] rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] shadow-xs p-5 sm:p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">Escola</h3>
          </div>
          <div className="bg-[#fafafa] rounded-[18px] sm:rounded-[20px] p-4 border border-[#e5e5e5] space-y-3">
            <InfoField
              icon={<GraduationCap className="h-3.5 w-3.5" />}
              label="Escola"
              value={carteirinha.escola_nome}
              fullWidth
            />
            <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#e5e5e5]">
              <InfoField
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Período"
                value={carteirinha.periodo ? formatPeriodo(carteirinha.periodo) : null}
              />
              <InfoField
                icon={<BookOpen className="h-3.5 w-3.5" />}
                label="Turma"
                value={carteirinha.turma}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#e5e5e5]">
              <InfoField
                icon={<DoorClosed className="h-3.5 w-3.5" />}
                label="Sala"
                value={salaLimpa}
              />
              <InfoField
                icon={<User className="h-3.5 w-3.5" />}
                label="Professor(a)"
                value={carteirinha.nome_professor}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">Transporte</h3>
          </div>
          <div className="bg-[#fafafa] rounded-[18px] sm:rounded-[20px] p-4 border border-[#e5e5e5] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <InfoField
                icon={<Bus className="h-3.5 w-3.5" />}
                label="Modalidade"
                value={carteirinha.modalidade ? formatModalidade(carteirinha.modalidade) : null}
              />
              <InfoField
                icon={<Bus className="h-3.5 w-3.5" />}
                label="Veículo / Placa"
                value={carteirinha.veiculo_placa}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#e5e5e5]">
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
            <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#e5e5e5]">
              <InfoField
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Horário de entrada"
                value={carteirinha.horario_entrada}
              />
              <InfoField
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Horário de saída"
                value={carteirinha.horario_saida}
              />
            </div>
            <div className="pt-2.5 border-t border-[#e5e5e5] flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                  <span className="text-xs font-normal text-[#737373]">
                    {primeiroNomeResp ? `Endereço Principal (${primeiroNomeResp})` : "Endereço completo"}
                  </span>
                </div>
                <p className="text-xs text-[#0a0a0a] font-semibold leading-tight block break-words whitespace-pre-wrap">
                  {enderecoFormatado || <span className="text-[#a3a3a3] font-normal">—</span>}
                </p>
                {referenciaEmbarque && (
                  <p className="text-[11px] text-[#737373] font-normal leading-normal mt-1 block break-words">
                    <span className="text-[#a3a3a3]">Referência: </span>{referenciaEmbarque}
                  </p>
                )}
              </div>
              {enderecoFormatado && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyEndereco}
                  className="h-8 w-8 rounded-[12px] shrink-0 hover:bg-[#ffffff] border border-[#e5e5e5] cursor-pointer"
                  title="Copiar endereço"
                >
                  {isCopiedEndereco ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-[#737373]" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">Outros Dados</h3>
          <div className="bg-[#fafafa] rounded-[18px] sm:rounded-[20px] p-4 border border-[#e5e5e5] space-y-3">
            <div className="grid grid-cols-2 gap-3">
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
          </div>
        </div>
      </div>

      <ResponsavelCarteirinhaObservacoes carteirinha={carteirinha} />
    </div>
  );
};
