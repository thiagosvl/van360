import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Bus,
  CheckCircle2,
  Lock as LockIcon,
  Rocket,
  School,
  User
} from "lucide-react";
import { useMemo, useState } from "react";
import { PassengerOnboardingDrawer } from "./PassengerOnboardingDrawer";

// Hooks
import { useProfile } from "@/hooks/business/useProfile";

interface QuickStartCardProps {
  onOpenVeiculoDialog: () => void;
  onOpenEscolaDialog: () => void;
  onOpenPassageiroDialog: () => void;
}

export const QuickStartCard = ({
  onOpenVeiculoDialog,
  onOpenEscolaDialog,
  onOpenPassageiroDialog,
}: QuickStartCardProps) => {
  const { profile, summary: systemSummary, isLoading: isSummaryLoading } = useProfile();

  const loading = isSummaryLoading;

  const contadores = systemSummary?.contadores;
  // Use aggregated counts from backend
  const escolasCount = contadores?.escolas.total ?? 0;
  const veiculosCount = contadores?.veiculos.total ?? 0;
  const passageirosCount = contadores?.passageiros.total ?? 0;

  const [isPassengerDrawerOpen, setIsPassengerDrawerOpen] = useState(false);


  const steps = useMemo(() => {
    const defaultSteps = [
      {
        id: 1,
        done: veiculosCount > 0,
        label: "Cadastrar um Veículo",
        onAction: onOpenVeiculoDialog,
        icon: Bus,
        buttonText: "Cadastrar",
      },
      {
        id: 2,
        done: escolasCount > 0,
        label: "Cadastrar uma Escola",
        onAction: onOpenEscolaDialog,
        icon: School,
        buttonText: "Cadastrar",
      },
      {
        id: 3,
        done: passageirosCount > 0,
        label: "Cadastrar Primeiro Passageiro",
        onAction: () => setIsPassengerDrawerOpen(true),
        icon: User,
        buttonText: "Cadastrar",
      },
    ];

    return defaultSteps;
  }, [
    veiculosCount,
    escolasCount,
    passageirosCount,
    onOpenVeiculoDialog,
    onOpenEscolaDialog
  ]);

  const completedSteps = steps.filter((step) => step.done).length;
  const totalSteps = steps.length;
  // Use a slight buffer for completed state if needed, or strict done check
  const isComplete = completedSteps === totalSteps;

  if (loading) return null;
  if (isComplete) return null; // Or return a "Success" card version

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-diff-shadow overflow-hidden relative">
        <div className="p-4 md:p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-50/50 text-[#1a3a5c] border border-slate-100 shadow-sm">
                <Rocket className="h-5 w-5 opacity-70" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-headline font-bold text-lg text-[#1a3a5c] leading-tight">
                  Primeiros Passos
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mt-1 opacity-80 leading-relaxed">
                  Complete as etapas para configurar o seu acesso.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-[10px] font-black text-[#1a3a5c] uppercase tracking-[0.2em]">{completedSteps}/{totalSteps}</span>
              <div className="h-1 bg-slate-100 rounded-full mt-1.5 w-12 overflow-hidden">
                <div
                  className="h-full bg-[#1a3a5c] transition-all duration-700 ease-out"
                  style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const isDone = step.done;
              const previousStepsDone = steps
                .slice(0, index)
                .every((s) => s.done);
              const isCurrent = !isDone && previousStepsDone;
              const StepIcon = step.icon;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-300 relative",
                    isCurrent
                      ? "bg-slate-50/50 border-slate-200/50 shadow-sm ring-1 ring-[#1a3a5c]/5"
                      : "bg-white border-gray-100/50",
                    isDone && "bg-gray-50/50 border-gray-100/30 opacity-60"
                  )}
                >
                  {/* Ícone Indicador */}
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300",
                      isDone
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50"
                        : isCurrent
                          ? "bg-[#1a3a5c] text-white shadow-lg shadow-[#1a3a5c]/20 scale-105"
                          : "bg-gray-50 text-gray-400 border border-gray-100"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <StepIcon className={cn("h-4 w-4", isCurrent && "animate-pulse")} />
                    )}
                  </div>

                  {/* Texto do Passo */}
                  <div className="flex-1 min-w-0 flex flex-col pointer-events-none">
                    <span
                      className={cn(
                        "text-[13px] font-bold leading-tight",
                        isDone
                          ? "text-slate-400 line-through font-medium"
                          : isCurrent
                            ? "text-[#1a3a5c]"
                            : "text-slate-400"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Ação */}
                  {isCurrent && (
                    <button
                      onClick={step.onAction}
                      className="shrink-0 h-8 px-4 rounded-lg bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#1a3a5c]/10 active:scale-95 transition-all"
                    >
                      {step.buttonText}
                    </button>
                  )}
                </div>
              );
            })}

            <div className="flex items-center gap-2 justify-center pt-3 opacity-60">
              <LockIcon className="h-3 w-3 text-slate-400" />
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">
                Complete as etapas para organizar seu painel.
              </p>
            </div>
          </div>
        </div>
      </div>

      <PassengerOnboardingDrawer
        open={isPassengerDrawerOpen}
        onOpenChange={setIsPassengerDrawerOpen}
        onManualRegistration={onOpenPassageiroDialog}
        profile={profile}
      />
    </>
  );
};
