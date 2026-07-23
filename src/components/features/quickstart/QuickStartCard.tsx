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

  const steps = useMemo(() => {
    return [
      {
        id: 1,
        done: veiculosCount > 0,
        label: "Cadastrar um Veículo",
        description: "Adicione seu primeiro veículo para começar a gestão.",
        onAction: onOpenVeiculoDialog,
        icon: Bus,
        buttonText: "Adicionar veículo",
      },
      {
        id: 2,
        done: escolasCount > 0,
        label: "Cadastrar uma Escola",
        description: "Adicione a primeira escola para organizar suas rotas.",
        onAction: onOpenEscolaDialog,
        icon: School,
        buttonText: "Adicionar escola",
      },
      {
        id: 3,
        done: passageirosCount > 0,
        label: "Cadastrar Primeiro Passageiro",
        description: "Adicione seu primeiro aluno para ver o app funcionando.",
        onAction: onOpenPassageiroDialog,
        icon: User,
        buttonText: "Adicionar passageiro",
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      <div className="p-5 md:p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-2">
          <div className="text-[#1a3a5c] mt-0.5">
            <Rocket className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <div className="flex-1 pt-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-[#1a3a5c] text-[17px]">Primeiros Passos</h3>
              <span className="text-[13px] font-bold text-[#1a3a5c]">{completedSteps} / {totalSteps}</span>
            </div>
            {/* Progress bar line - outline with rounded caps */}
            <div className="h-[6px] w-full rounded-full border border-gray-200 bg-gray-50 overflow-hidden">
              <div
                className="h-full bg-[#1a3a5c] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Steps List */}
        <div className="flex flex-col mt-4">
          {steps.map((step) => {
            const isExpanded = expandedId === step.id;
            const isDone = step.done;
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col py-4 border-b border-gray-100 last:border-b-0 transition-all duration-300",
                  !isDone ? "cursor-pointer" : "cursor-default opacity-80"
                )}
                onClick={() => !isDone && !isExpanded && setExpandedId(step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="text-slate-500">
                      <StepIcon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <span
                      className={cn(
                        "text-[15px] font-medium transition-colors",
                        isDone ? "text-slate-400" : "text-[#1a3a5c]"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Status Circle */}
                  <div className="shrink-0 flex items-center justify-center">
                    {isDone ? (
                      <CheckCircle2 className="h-[22px] w-[22px] text-emerald-500" strokeWidth={2} />
                    ) : (
                      <div className="h-[22px] w-[22px] rounded-full border-2 border-slate-300 transition-colors" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isExpanded ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="pl-[34px] pr-2 pt-1 flex flex-col">
                      <p className="text-[13px] text-slate-500 mb-4 leading-relaxed">
                        {step.description}
                      </p>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          step.onAction();
                        }}
                        className="w-full sm:w-auto sm:self-end flex items-center justify-center gap-2 h-10 sm:h-9 px-4 rounded-2xl bg-[#1a3a5c] text-white text-[13px] sm:text-[12px] font-medium hover:bg-[#1a3a5c]/90 transition-colors active:scale-95"
                      >
                        {step.buttonText}
                        <ArrowRight className="h-3.5 w-3.5" />
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
