import { useState, useEffect } from "react";
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
  Calendar,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
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
  const totalSteps = 4;
  const anoOrigem = anoDestino - 1;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setNaoMostrarNovamente(false);
    }
  }, [isOpen]);

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

  const stepTitles: Record<number, { title: string; badge: string }> = {
    1: {
      badge: "Passo 1 • Preparação",
      title: `Ajuste os valores para ${anoDestino}`,
    },
    2: {
      badge: "Passo 2 • Convite aos Pais",
      title: "Envie o link pelo WhatsApp",
    },
    3: {
      badge: "Passo 3 • Confirmação e Contrato",
      title: "O pai responde e o sistema matricula",
    },
    4: {
      badge: "Passo 4 • Segurança e Controle",
      title: "E se alguém mudar de ideia?",
    },
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) handleClose();
      }}
      maxWidth="lg"
      description="Passo a passo de como funciona a renovação de matrícula"
    >
      <BaseDialog.Header
        title="Como Funciona a Renovação"
        icon={<HelpCircle className="w-5 h-5 text-[#0a0a0a]" />}
        showSteps
        currentStep={step}
        totalSteps={totalSteps}
        onClose={handleClose}
      />

      <BaseDialog.Body animate animationKey={step} className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[11px] font-semibold bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5]">
              {stepTitles[step].badge}
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-[#0a0a0a] mt-1.5 leading-snug">
              {stepTitles[step].title}
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setStep(num)}
                className={cn(
                  "w-7 h-7 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center justify-center",
                  step === num
                    ? "bg-[#0a0a0a] text-white"
                    : "bg-[#f5f5f5] text-[#737373] hover:text-[#0a0a0a] border border-[#e5e5e5]"
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
              Todos os seus alunos ativos de <strong>{anoOrigem}</strong> já aparecem prontos na lista. Antes de chamar os pais, você prepara as condições de <strong>{anoDestino}</strong>:
            </p>

            <div className="bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-3.5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-white border border-[#e5e5e5] flex items-center justify-center shrink-0 text-[#0a0a0a]">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    Ajustes em Lote (Para vários de uma vez)
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    Aplique aumento por porcentagem (%) ou valor fixo (R$), escolha o dia de vencimento e as datas de início e fim das aulas para todos ou por escola.
                  </span>
                </div>
              </div>

              <div className="border-t border-[#e5e5e5] pt-3 flex items-start gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-white border border-[#e5e5e5] flex items-center justify-center shrink-0 text-[#0a0a0a]">
                  <Edit3 className="w-4 h-4 text-[#0a0a0a]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    Editar Condições (Aluno por aluno)
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    Mudou de escola, turno ou tem um valor combinado diferente? Clique em <strong>Editar Condições</strong> no card daquele aluno.
                  </span>
                </div>
              </div>

              <div className="border-t border-[#e5e5e5] pt-3 flex items-start gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-white border border-[#e5e5e5] flex items-center justify-center shrink-0 text-[#0a0a0a]">
                  <FileSignature className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    Contrato Digital de {anoDestino}
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    No topo da tela, você escolhe se deseja exigir que o responsável assine o contrato de {anoDestino} assim que confirmar a vaga.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
              Depois de revisar os valores, é hora de avisar os responsáveis com apenas um clique:
            </p>

            <div className="bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-3.5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-white border border-[#e5e5e5] flex items-center justify-center shrink-0 text-[#0a0a0a]">
                  <Send className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    Botão "Notificar Pendentes"
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    Dispara uma mensagem oficial no WhatsApp de cada responsável com o link exclusivo de renovação do filho. Você também pode selecionar alunos específicos.
                  </span>
                </div>
              </div>

              <div className="border-t border-[#e5e5e5] pt-3 flex items-start gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-white border border-[#e5e5e5] flex items-center justify-center shrink-0 text-[#0a0a0a]">
                  <Smartphone className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    O que o Pai vê quando abre o Link?
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    Ele vê as condições para {anoDestino}. Antes de responder, ele mesmo pode atualizar <strong>endereço, turma, sala, professor ou observações do aluno</strong>.
                  </span>
                </div>
              </div>
            </div>

            <Banner
              variant="info"
              title="Alunos sem Telefone"
              description="Se algum aluno estiver sem celular no cadastro, um aviso aparece no topo da tela para você preencher o número antes de disparar."
              className="rounded-[18px]"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
              Conforme os pais respondem pelo celular, sua lista atualiza sozinha:
            </p>

            <div className="bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-3.5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-white border border-[#e5e5e5] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    Quando o Pai Confirma a Vaga
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    A matrícula de <strong>{anoDestino}</strong> já é criada na hora! Se você ativou o Contrato Digital, o pai já é levado automaticamente para assinar o contrato de {anoDestino} na tela do celular.
                  </span>
                </div>
              </div>

              <div className="border-t border-[#e5e5e5] pt-3 flex items-start gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-white border border-[#e5e5e5] flex items-center justify-center shrink-0">
                  <XCircle className="w-4 h-4 text-[#e7000b]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    Quando o Pai Informa que Não Vai Renovar
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    O aluno entra em <strong>Saídas</strong> para {anoDestino} (liberando a vaga na sua van), mas continua ativo normalmente nas suas rotas e cobranças de {anoOrigem} até o fim do ano.
                  </span>
                </div>
              </div>
            </div>

            <Banner
              variant="neutral"
              title="Pai confirmou pessoalmente ou por conversa?"
              description="Você não precisa esperar ele clicar no link: basta tocar em 'Confirmar Vaga' ou 'Não Renovará' direto no card do aluno."
              className="rounded-[18px]"
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
              Você tem controle total para organizar exceções sem bagunçar seus dados:
            </p>

            <div className="bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-3.5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-white border border-[#e5e5e5] flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-[#0a0a0a]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    Se o Pai Mudar de Ideia Depois de Responder
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    Para sua segurança, depois que o pai confirma ou recusa, o link trava. A tela orienta que ele <strong>fale com você</strong>, e você altera o status dele aqui na tela de Renovação.
                  </span>
                </div>
              </div>

              <div className="border-t border-[#e5e5e5] pt-3 flex items-start gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-white border border-[#e5e5e5] flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    Se Você Mudar Valor ou Escola de Quem Já Confirmou
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    Se você não usa contrato, a matrícula de {anoDestino} é atualizada na hora. Se o aluno já tinha contrato em {anoDestino}, o sistema cancela o antigo e volta o aluno para pendente para que o pai confirme e assine o novo contrato pelo mesmo link.
                  </span>
                </div>
              </div>

              <div className="border-t border-[#e5e5e5] pt-3 flex items-start gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-white border border-[#e5e5e5] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] block">
                    {anoOrigem} e {anoDestino} Ficam Separados
                  </span>
                  <span className="text-xs text-[#737373] block leading-relaxed mt-0.5">
                    Nenhuma alteração feita na renovação de {anoDestino} afeta as parcelas, escolas ou contratos de {anoOrigem}.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </BaseDialog.Body>

      <BaseDialog.Footer className="flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <label className="flex items-center gap-2 select-none cursor-pointer text-xs text-[#737373] hover:text-[#0a0a0a]">
          <Checkbox
            checked={naoMostrarNovamente}
            onCheckedChange={(val) => setNaoMostrarNovamente(Boolean(val))}
          />
          <span>Não mostrar este tutorial novamente</span>
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
