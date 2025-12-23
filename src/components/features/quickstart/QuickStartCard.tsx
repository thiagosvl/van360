import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Bus, CheckCircle2, Lock as LockIcon, School, Trophy, User } from "lucide-react";
import { useMemo, useState } from "react";
import { PassengerOnboardingDrawer } from "./PassengerOnboardingDrawer";

// Hooks
import { useEscolas } from "@/hooks/api/useEscolas";
import { usePassageiros } from "@/hooks/api/usePassageiros";
import { useVeiculos } from "@/hooks/api/useVeiculos";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";

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
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const { data: escolasData, isLoading: isEscolasLoading } = useEscolas(
    profile?.id,
    {
      enabled: !!profile?.id,
    }
  );

  const { data: veiculosData, isLoading: isVeiculosLoading } = useVeiculos(
    profile?.id,
    {
      enabled: !!profile?.id,
    }
  );

  const { data: passageirosData, isLoading: isPassageirosLoading } =
    usePassageiros(
      {
        usuarioId: profile?.id,
      },
      {
        enabled: !!profile?.id,
      }
    );

  const loading = isEscolasLoading || isVeiculosLoading || isPassageirosLoading;

  const escolasCount = (escolasData as { total?: number } | undefined)?.total ?? 0;
  const veiculosCount = (veiculosData as { total?: number } | undefined)?.total ?? 0;
  const passageirosCount = (passageirosData as { total?: number } | undefined)?.total ?? 0;

  const [isPassengerDrawerOpen, setIsPassengerDrawerOpen] = useState(false);

  const steps = useMemo(() => [
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
  ], [veiculosCount, escolasCount, passageirosCount, onOpenVeiculoDialog, onOpenEscolaDialog]);

  const completedSteps = steps.filter((step) => step.done).length;
  const totalSteps = steps.length;
  // Use a slight buffer for completed state if needed, or strict done check
  const isComplete = completedSteps === totalSteps;

  if (loading) return null;
  if (isComplete) return null; // Or return a "Success" card version

  return (
    <>
      <Card className="border shadow-sm rounded-2xl overflow-hidden bg-white border-indigo-100">
        <CardContent className="p-4 md:p-5">
          
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-600">
               <Trophy className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg leading-tight text-gray-900">
                Primeiros Passos
              </h3>
              <p className="text-sm mt-1 mb-3 text-gray-500">
                Complete as etapas para configurar o seu acesso.
              </p>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-3 md:ml-14">
              {steps.map((step, index) => {
                  const isDone = step.done;
                  // If it's the first undone step, it's the "current" one.
                  // Or: allow any order? Home uses sequential logic mostly for highlighting.
                  // Let's copy Home logic: "isCurrent" if previous are done.
                  const previousStepsDone = steps.slice(0, index).every((s) => s.done);
                  const isCurrent = !isDone && previousStepsDone;
                  const StepIcon = step.icon;

                  return (
                  <div
                      key={step.id}
                      className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-colors duration-200",
                      isCurrent
                          ? "bg-indigo-50 border-indigo-200 shadow-sm"
                          : "bg-white border-gray-100",
                      isDone && "bg-gray-50 border-gray-100 opacity-70"
                      )}
                  >
                      <div className="flex items-center gap-3">
                      <div
                          className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                          isDone
                              ? "bg-green-100 text-green-600"
                              : isCurrent
                              ? "bg-purple-100 text-purple-600 border border-purple-200"
                              : "bg-gray-100 text-gray-400"
                          )}
                      >
                          {isDone ? (
                          <CheckCircle2 className="h-4 w-4" />
                          ) : (
                          <StepIcon className="h-4 w-4" />
                          )}
                      </div>
                      <span
                          className={cn(
                          "text-sm font-medium",
                          isDone
                              ? "text-gray-400 line-through"
                              : isCurrent
                              ? "text-indigo-900 font-bold"
                              : "text-gray-400"
                          )}
                      >
                          {step.label}
                      </span>
                      </div>

                      {isCurrent && (
                      <Button
                          size="sm"
                          onClick={step.onAction}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3 rounded-lg text-xs font-bold shadow-indigo-200/50 shadow-lg"
                      >
                          {step.buttonText}
                      </Button>
                      )}
                  </div>
                  );
              })}

              <div className="flex items-center gap-2 justify-center pt-2 opacity-60">
                  <LockIcon className="h-3 w-3 text-gray-400" />
                  <p className="text-[10px] text-gray-500 font-medium text-center">
                  Complete as etapas para organizar seu painel.
                  </p>
              </div>
          </div>
        </CardContent>
      </Card>

      <PassengerOnboardingDrawer
        open={isPassengerDrawerOpen}
        onOpenChange={setIsPassengerDrawerOpen}
        onManualRegistration={onOpenPassageiroDialog}
        profile={profile}
      />
    </>
  );
};
