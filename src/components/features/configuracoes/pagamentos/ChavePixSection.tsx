import { Banner } from "@/components/ui/Banner";
import { ModoCobranca, MODO_COBRANCA } from "@/hooks/ui/usePagamentosTabViewModel";
import { Veiculo } from "@/types/veiculo";
import { formatarChavePix } from "@/utils/formatters/pix";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { Key, Pencil } from "lucide-react";

interface ChavePixSectionProps {
  modoVisual: ModoCobranca;
  isBusy: boolean;
  chavePixDisplay: { tipo: string; chave: string } | null;
  veiculos: Veiculo[];
  deveExibirChavesPorVeiculo: boolean;
  onOpenEditarPixPadrao: () => void;
  onOpenEditarPixVeiculo: (veiculo: Veiculo) => void;
}

export function ChavePixSection({
  modoVisual,
  isBusy,
  chavePixDisplay,
  veiculos,
  deveExibirChavesPorVeiculo,
  onOpenEditarPixPadrao,
  onOpenEditarPixVeiculo,
}: ChavePixSectionProps) {
  const isAutomatica = modoVisual === MODO_COBRANCA.AUTOMATICA;

  return (
    <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5 sm:space-y-6">
      <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
          <Key className="w-5 h-5 text-[#0a0a0a]" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
            Chaves Pix de Recebimento
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            {isAutomatica
              ? "Conta onde o valor das parcelas pagas será depositado"
              : "Chave Pix enviada junto aos lembretes no WhatsApp"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-[#0a0a0a]">
            Chave Pix Geral {isAutomatica ? "(Obrigatória)" : "(Opcional)"}
          </h3>
          <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
            Vale automaticamente para todas as vans e alunos sem chave própria.
          </p>
        </div>

        <div className="rounded-[18px] border border-[#e5e5e5] bg-white overflow-hidden shadow-xs">
          <button
            type="button"
            disabled={isBusy}
            onClick={onOpenEditarPixPadrao}
            className="group w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left transition-colors hover:bg-[#fafafa] bg-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {chavePixDisplay ? (
              <div className="min-w-0 space-y-0.5">
                <span className="block text-xs text-[#737373]">
                  {chavePixDisplay.tipo} • Padrão da conta
                </span>
                <span className="block text-sm font-semibold text-[#0a0a0a] tracking-tight">
                  {chavePixDisplay.chave}
                </span>
              </div>
            ) : (
              <div className="min-w-0 space-y-0.5">
                <span className="block text-sm font-medium text-[#0a0a0a]">
                  Nenhuma chave geral cadastrada
                </span>
                <span className="block text-xs text-[#737373]">
                  {isAutomatica
                    ? "Toque para cadastrar sua chave Pix principal"
                    : "Toque se quiser enviar a chave Pix nos lembretes"}
                </span>
              </div>
            )}

            <div className="h-8 w-8 rounded-[12px] bg-[#fafafa] group-hover:bg-[#f0f0f0] border border-[#e5e5e5] flex items-center justify-center text-[#737373] group-hover:text-[#0a0a0a] transition-colors shrink-0">
              <Pencil className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>

      {deveExibirChavesPorVeiculo && veiculos.length > 0 && (
        <div className="space-y-3 pt-5 border-t border-[#e5e5e5]">
          <div>
            <h3 className="text-sm font-semibold text-[#0a0a0a]">
              Chave Pix por Veículo (Opcional)
            </h3>
            <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
              Personalize apenas se você usa uma conta bancária diferente para alguma van.
            </p>
          </div>

          <div className="rounded-[18px] border border-[#e5e5e5] bg-white divide-y divide-[#e5e5e5] overflow-hidden shadow-xs">
            {veiculos.map((v) => {
              const temChavePropria = Boolean(v.chave_pix && v.chave_pix.trim() !== "");
              const chavePropriaFormatada = temChavePropria
                ? formatarChavePix(v.chave_pix, v.tipo_chave_pix)
                : null;

              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={isBusy}
                  onClick={() => onOpenEditarPixVeiculo(v)}
                  className="group w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left transition-colors hover:bg-[#fafafa] bg-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-sm uppercase text-[#0a0a0a] tracking-tight shrink-0">
                        {formatarPlacaExibicao(v.placa)}
                      </span>
                      {v.modelo && (
                        <span className="text-xs text-[#737373] truncate">
                          • {v.marca} {v.modelo}
                        </span>
                      )}
                    </div>

                    {temChavePropria ? (
                      <span className="block text-xs font-medium text-primary">
                        {chavePropriaFormatada} • Exclusiva da van
                      </span>
                    ) : chavePixDisplay ? (
                      <span className="block text-xs text-[#737373]">
                        Usando a Chave Geral
                      </span>
                    ) : (
                      <span className="block text-xs text-[#737373]">
                        Sem chave Pix configurada
                      </span>
                    )}
                  </div>

                  <div className="h-8 w-8 rounded-[12px] bg-[#fafafa] group-hover:bg-[#f0f0f0] border border-[#e5e5e5] flex items-center justify-center text-[#737373] group-hover:text-[#0a0a0a] transition-colors shrink-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Banner
        variant="neutral"
        description="Chave Pix por aluno (opcional): quando você cadastra uma chave Pix na carteirinha do aluno, é ela que será usada para aquele aluno, independente da chave do veículo ou da geral."
      />
    </div>
  );
}
