import { cn } from "@/lib/utils";
import {
  Bus,
  CheckCircle2,
  Rocket,
  School,
  User,
  ArrowRight
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";

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

  const steps = useMemo(() => {
    return [
      {
        id: 1,
        done: veiculosCount > 0,
        label: "Cadastrar Veículo",
        description: "Adicione seu primeiro veículo para começar a gestão.",
        onAction: onOpenVeiculoDialog,
        icon: Bus,
        buttonText: "Adicionar veículo",
      },
      {
        id: 2,
        done: escolasCount > 0,
        label: "Cadastrar Escola",
        description: "Adicione a primeira escola para organizar suas rotas.",
        onAction: onOpenEscolaDialog,
        icon: School,
        buttonText: "Adicionar escola",
      },
      {
        id: 3,
        done: passageirosCount > 0,
        label: "Cadastrar Primeiro Aluno",
        description: "Informe apenas o nome do aluno e já veja o app funcionando.",
        onAction: onOpenPassageiroDialog,
        icon: User,
        buttonText: "Adicionar aluno",
      },
    ];
  }, [
    veiculosCount,
    escolasCount,
    passageirosCount,
    onOpenVeiculoDialog,
    onOpenEscolaDialog,
    onOpenPassageiroDialog,
  ]);

  const completedSteps = steps.filter((step) => step.done).length;
  const totalSteps = steps.length;
  const isComplete = completedSteps === totalSteps;

  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Compute the first pending step
  const firstPendingId = useMemo(() => steps.find(s => !s.done)?.id || null, [steps]);

  // Auto-expand the first pending step whenever a step is completed
  useEffect(() => {
    setExpandedId(firstPendingId);
  }, [firstPendingId, completedSteps]);

  if (loading) return null;
  if (isComplete) return null;

  return (
    <div className="bg-card rounded-3xl shadow-xs border border-border overflow-hidden relative">
      <div className="p-5 md:p-6">
        <div className="flex items-start gap-3.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Rocket className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="flex-1 pt-0.5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground text-base sm:text-[17px]">Primeiros Passos</h3>
              <span className="text-xs font-semibold text-muted-foreground">{completedSteps} / {totalSteps}</span>
            </div>
            <div className="h-2 w-full rounded-full border border-border bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-4">
          {steps.map((step) => {
            const isExpanded = expandedId === step.id;
            const isDone = step.done;
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col py-3.5 border-b border-border last:border-b-0 transition-all duration-300",
                  !isDone ? "cursor-pointer" : "cursor-default opacity-80"
                )}
                onClick={() => !isDone && !isExpanded && setExpandedId(step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isDone
                          ? "bg-muted text-muted-foreground/60"
                          : isExpanded
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      <StepIcon className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <span
                      className={cn(
                        "text-sm font-semibold transition-colors",
                        isDone ? "text-muted-foreground line-through" : "text-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>

                  <div className="shrink-0 flex items-center justify-center">
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" strokeWidth={2} />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-border transition-colors" />
                    )}
                  </div>
                </div>

                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isExpanded ? "grid-rows-[1fr] opacity-100 mt-2.5" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="pt-1 flex flex-col">
                      <p className="text-xs text-muted-foreground mb-3 sm:pl-11 leading-relaxed">
                        {step.description}
                      </p>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          step.onAction();
                        }}
                        className="w-full sm:w-auto sm:self-end flex items-center justify-center gap-2 h-10 sm:h-9 px-4 rounded-2xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover shadow-xs transition-all active:scale-95"
                      >
                        {step.buttonText}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
