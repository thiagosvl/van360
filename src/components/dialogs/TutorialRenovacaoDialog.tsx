import { useState, useEffect, useRef } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Checkbox } from "@/components/ui/checkbox";
import { STORAGE_KEYS } from "@/constants";
import { safeCloseDialog } from "@/utils/dialogUtils";
import {
  TrendingUp,
  Edit3,
  FileSignature,
  Send,
  Smartphone,
  CheckCircle2,
  XCircle,
  Lock,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TutorialRenovacaoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  anoDestino: number;
}

export function TutorialRenovacaoDialog({
  isOpen,
  onClose,
  anoDestino,
}: TutorialRenovacaoDialogProps) {
  const [step, setStep] = useState(1);
  const [naoMostrarNovamente, setNaoMostrarNovamente] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const totalSteps = 4;
  const anoOrigem = anoDestino - 1;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setNaoMostrarNovamente(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [step]);

  const handleClose = () => {
    if (naoMostrarNovamente) {
      localStorage.setItem(STORAGE_KEYS.GUIDE_RENOVACOES_DISMISSED, "true");
    }
    safeCloseDialog(onClose);
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      localStorage.setItem(STORAGE_KEYS.GUIDE_RENOVACOES_DISMISSED, "true");
      safeCloseDialog(onClose);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const stepsConfig = [
    { id: 1, label: "Preparar", icon: SlidersHorizontal },
    { id: 2, label: "Convidar", icon: Send },
    { id: 3, label: "Confirmar", icon: CheckCircle2 },
    { id: 4, label: "Controle", icon: ShieldCheck },
  ];

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) handleClose();
      }}
      maxWidth="lg"
      description="Como funciona o ciclo de renovação de matrículas"
    >
      <BaseDialog.Header
        title="Como Funciona a Renovação"
        icon={<HelpCircle className="w-5 h-5 text-primary" />}
        showSteps
        currentStep={step}
        totalSteps={totalSteps}
        onClose={handleClose}
      />

      <BaseDialog.Body containerRef={bodyRef} className="space-y-4">
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#f5f5f5] rounded-[16px] border border-[#e5e5e5]">
          {stepsConfig.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[12px] text-xs font-medium transition-all cursor-pointer",
                  isActive
                    ? "bg-white text-[#0a0a0a] shadow-xs font-semibold"
                    : "text-[#737373] hover:text-[#0a0a0a]"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-primary" : "text-[#737373]")} />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.id}</span>
              </button>
            );
          })}
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-[#0a0a0a] leading-tight">
                1. Ajuste os valores para {anoDestino}
              </h3>
              <p className="text-xs sm:text-sm text-[#737373] mt-1 leading-relaxed">
                Seus alunos de {anoOrigem} já estão na lista. Antes de avisar os responsáveis, defina os valores e datas:
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5]">
                <div className="w-8 h-8 rounded-[12px] bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    Ajustes em Lote
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    Aumente o valor de todos os alunos ou filtre por escola (em % ou R$), e acerte o dia de vencimento de uma só vez.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5]">
                <div className="w-8 h-8 rounded-[12px] bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    Editar Aluno por Aluno
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    Se combinou um valor, turno ou escola diferente com algum aluno específico, toque no botão <strong>Editar</strong> ao lado dele.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5]">
                <div className="w-8 h-8 rounded-[12px] bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <FileSignature className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    Configurar Período e Contrato
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    Defina as datas das aulas em <strong>Configurar Período</strong> e ative o <strong>Contrato Digital</strong> se quiser que o responsável assine pelo celular no ato da confirmação.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-[#0a0a0a] leading-tight">
                2. Convide os responsáveis pelo WhatsApp
              </h3>
              <p className="text-xs sm:text-sm text-[#737373] mt-1 leading-relaxed">
                Com as condições prontas, você avisa os responsáveis com praticidade:
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5]">
                <div className="w-8 h-8 rounded-[12px] bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Send className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    Enviar pelo WhatsApp
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    Toque em <strong>Enviar WhatsApp</strong> no aluno ou selecione vários para usar o botão <strong>Disparar WhatsApp</strong>. Cada responsável recebe uma mensagem com o link exclusivo do filho.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5]">
                <div className="w-8 h-8 rounded-[12px] bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    O que o Responsável Vê
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    Ele abre o link no celular, confere o valor da parcela de {anoDestino} e pode tocar em <strong>Editar Dados</strong> se precisar atualizar endereço, turma ou professor antes de responder.
                  </span>
                </div>
              </div>
            </div>

            <Banner
              variant="info"
              title="Sem WhatsApp cadastrado?"
              description="Se faltar o telefone de algum responsável, preencha o número no cadastro do aluno antes de disparar."
              className="rounded-[16px]"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-[#0a0a0a] leading-tight">
                3. Resposta rápida e vagas atualizadas
              </h3>
              <p className="text-xs sm:text-sm text-[#737373] mt-1 leading-relaxed">
                Conforme os responsáveis respondem pelo celular, a lista atualiza na hora:
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5]">
                <div className="w-8 h-8 rounded-[12px] bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    Quando o Responsável Confirma
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    O aluno muda para <strong>Confirmado</strong> e a vaga de {anoDestino} já fica garantida. Se você ativou o Contrato Digital, ele já assina o documento na tela do celular no mesmo momento.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5]">
                <div className="w-8 h-8 rounded-[12px] bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <XCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    Quando Informa que Não Vai Renovar
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    O aluno vai para <strong>Saída</strong>, liberando o lugar na sua van para novos alunos em {anoDestino}. Ele continua ativo nas suas rotas e parcelas de {anoOrigem} normalmente até o fim das aulas.
                  </span>
                </div>
              </div>
            </div>

            <Banner
              variant="neutral"
              title="Avisou pessoalmente?"
              description="Se o responsável já combinou com você no dia a dia, você não precisa do link: basta tocar direto em 'Confirmado' ou 'Saída' ao lado do aluno."
              className="rounded-[16px]"
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-[#0a0a0a] leading-tight">
                4. Segurança e histórico protegido
              </h3>
              <p className="text-xs sm:text-sm text-[#737373] mt-1 leading-relaxed">
                Você tem controle total para lidar com imprevistos sem misturar os anos:
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5]">
                <div className="w-8 h-8 rounded-[12px] bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    Link Protegido Após Resposta
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    Após o responsável responder (confirmando ou saindo), o link trava para evitar cliques acidentais. Se ele precisar alterar algo, a tela orienta que fale diretamente com você.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5]">
                <div className="w-8 h-8 rounded-[12px] bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    E se o responsável mudar de ideia?
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    Se alguém disse que não ia renovar e depois pediu a vaga de volta (ou vice-versa), toque em <strong>Pendente</strong> ao lado do aluno. Isso reabre a vaga e destrava o link para ele responder novamente.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5]">
                <div className="w-8 h-8 rounded-[12px] bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    {anoOrigem} e {anoDestino} Separados
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    Qualquer alteração feita para {anoDestino} não afeta as parcelas, rotas ou contratos do ano letivo de {anoOrigem}.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </BaseDialog.Body>

      <BaseDialog.Footer className="flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <label className="flex items-center gap-2 select-none cursor-pointer text-xs text-[#737373] hover:text-[#0a0a0a] transition-colors">
          <Checkbox
            checked={naoMostrarNovamente}
            onCheckedChange={(val) => setNaoMostrarNovamente(Boolean(val))}
          />
          <span>Não mostrar este guia novamente</span>
        </label>

        <div className="flex items-center gap-2 justify-end">
          {step > 1 ? (
            <BaseDialog.Action
              label="Anterior"
              variant="secondary"
              onClick={handlePrev}
              icon={<ArrowLeft className="w-4 h-4" />}
            />
          ) : (
            <BaseDialog.Action
              label="Fechar"
              variant="secondary"
              onClick={handleClose}
            />
          )}

          <BaseDialog.Action
            label={step < totalSteps ? "Próximo" : "Entendi, vamos lá!"}
            variant="primary"
            onClick={handleNext}
            icon={step < totalSteps ? <ArrowRight className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          />
        </div>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

