import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState, useMemo } from "react";

import { Form, FormLabel } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { STORAGE_KEY_QUICKSTART_STATUS } from "@/constants";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useEscolas } from "@/hooks/api/useEscolas";
import { useVeiculos } from "@/hooks/api/useVeiculos";
import { usePassageiros } from "@/hooks/api/usePassageiros";
import { ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { z } from "zod";

const QUICK_START_STEPS = [
  {
    id: 1,
    title: "Cadastrar a primeira escola",
    href: "/escolas?openModal=true",
  },
  {
    id: 2,
    title: "Cadastrar o primeiro veículo",
    href: "/veiculos?openModal=true",
  },
  {
    id: 3,
    title: "Cadastrar o primeiro passageiro",
    href: "/passageiros?openModal=true",
  },
];

const quickStartSchema = z.object({
  stepsStatus: z.record(z.string(), z.boolean()).default({
    step_1: false,
    step_2: false,
    step_3: false,
    step_4: false,
  }),
});

type QuickStartFormValues = z.infer<typeof quickStartSchema>;

const defaultValues = {
  stepsStatus: QUICK_START_STEPS.reduce((acc, step) => {
    acc[`step_${step.id}`] = false;
    return acc;
  }, {} as Record<string, boolean>),
};

export const QuickStartCard = () => {
  const form = useForm<QuickStartFormValues>({
    defaultValues: defaultValues,
  });

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

  const stepsStatus = useMemo(() => {
    const escolasCount = (escolasData as { total?: number } | undefined)?.total ?? 0;
    const veiculosCount = (veiculosData as { total?: number } | undefined)?.total ?? 0;
    const passageirosCount = (passageirosData as { total?: number } | undefined)?.total ?? 0;

    return {
      step_escolas: escolasCount > 0,
      step_veiculos: veiculosCount > 0,
      step_passageiros: passageirosCount > 0,
    };
  }, [escolasData?.total, veiculosData?.total, passageirosData?.total]);

  const showing = useMemo(() => {
    return !Object.values(stepsStatus).every(Boolean);
  }, [stepsStatus]);

  useEffect(() => {
    if (!loading && profile?.id) {
      const storageKey = STORAGE_KEY_QUICKSTART_STATUS;
      localStorage.setItem(storageKey, JSON.stringify(stepsStatus));
    }
  }, [stepsStatus, loading, profile?.id]);

  const completedSteps = Object.values(stepsStatus).filter(Boolean).length;
  const totalSteps = QUICK_START_STEPS.length;
  const progressValue = (completedSteps / totalSteps) * 100;

  const formSteps = QUICK_START_STEPS.map((step) => ({
    ...step,
    formKey: `stepsStatus.step_${step.id}`,
  }));

  if (loading) return null;

  return showing ? (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-2">Primeiros Passos</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Concluído {completedSteps} de {totalSteps}
        </p>

        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">Progresso</h3>
          <p className="text-sm font-semibold text-primary">
            {completedSteps} / {totalSteps}
          </p>
        </div>

        <Progress value={progressValue} className="h-2 mb-6" />

        <Form {...form}>
          <form className="space-y-4">
            {formSteps.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between py-2 border-b last:border-b-0 transition-colors rounded-sm"
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={
                      (step.id === 1 && stepsStatus.step_escolas) ||
                      (step.id === 2 && stepsStatus.step_veiculos) ||
                      (step.id === 3 && stepsStatus.step_passageiros)
                    }
                    disabled
                    className="h-5 w-5 rounded focus:ring-primary shrink-0 cursor-default opacity-80"
                  />

                  <NavLink to={step.href}>
                    <FormLabel
                      className={`text-base font-semibold transition-colors cursor-pointer leading-snug ${
                        (step.id === 1 && stepsStatus.step_escolas) ||
                        (step.id === 2 && stepsStatus.step_veiculos) ||
                        (step.id === 3 && stepsStatus.step_passageiros)
                          ? "text-gray-500 line-through"
                          : "text-foreground"
                      }`}
                    >
                      <span title={step.title}>{step.title}</span>
                    </FormLabel>
                  </NavLink>
                </div>

                <NavLink to={step.href}>
                  <ChevronRight className="h-5 w-5 text-primary hover:text-primary/80 transition-colors" />
                </NavLink>
              </div>
            ))}

            <button type="submit" className="hidden" />
          </form>
        </Form>
      </CardContent>
    </Card>
  ) : null;
};
