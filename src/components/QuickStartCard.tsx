import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

import { Form, FormLabel } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { STORAGE_KEY_QUICKSTART_STATUS } from "@/constants";
import { ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { z } from "zod";

const QUICK_START_STEPS = [
  { id: 1, title: "Cadastrar a primeira escola", href: "/escolas" },
  { id: 2, title: "Cadastrar o primeiro veículo", href: "/veiculos" },
  { id: 3, title: "Cadastrar o primeiro passageiro", href: "/passageiros" },
  {
    id: 4,
    title: "Configurar o sistema (notificações e mensagens automáticas)",
    href: "/configuracoes",
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

  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stepsStatus, setStepsStatus] = useState({
    step_escolas: false,
    step_veiculos: false,
    step_passageiros: false,
    step_configuracoes: false,
  });

  const completedSteps = Object.values(stepsStatus).filter(Boolean).length;
  const totalSteps = QUICK_START_STEPS.length;
  const progressValue = (completedSteps / totalSteps) * 100;

  const formSteps = QUICK_START_STEPS.map((step) => ({
    ...step,
    formKey: `stepsStatus.step_${step.id}`,
  }));

  useEffect(() => {
    if (!profile || !profile.id) return;

    fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      const storageKey = STORAGE_KEY_QUICKSTART_STATUS;
      const cached = localStorage.getItem(storageKey);

      if (cached) {
        setStepsStatus(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const [escolas, veiculos, passageiros, configuracoes] = await Promise.all([
        supabase
          .from("escolas")
          .select("*", { count: "exact", head: true })
          .eq("usuario_id", profile.id),
        supabase
          .from("veiculos")
          .select("*", { count: "exact", head: true })
          .eq("usuario_id", profile.id),
        supabase
          .from("passageiros")
          .select("*", { count: "exact", head: true })
          .eq("usuario_id", profile.id),
        supabase
          .from("configuracoes_motoristas")
          .select("*", { count: "exact", head: true })
          .eq("usuario_id", profile.id),
      ]);

      const data = {
        step_escolas: (escolas.count ?? 0) > 0,
        step_veiculos: (veiculos.count ?? 0) > 0,
        step_passageiros: (passageiros.count ?? 0) > 0,
        step_configuracoes: (configuracoes.count ?? 0) > 0,
      };

      setStepsStatus(data);
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao carregar QuickStart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (data: QuickStartFormValues) => {
    console.log("Status de Primeiros Passos Salvo:", data.stepsStatus);
  };

  if (loading) return null;

  const allCompleted = Object.values(stepsStatus).every(Boolean);
  if (allCompleted) return null;

  return (
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
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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
                      (step.id === 3 && stepsStatus.step_passageiros) ||
                      (step.id === 4 && stepsStatus.step_configuracoes)
                    }
                    disabled
                    onCheckedChange={() => {}}
                    className="h-5 w-5 rounded focus:ring-primary shrink-0 cursor-default opacity-80"
                  />

                  <FormLabel
                    className={`text-base font-semibold transition-colors leading-snug ${
                      (step.id === 1 && stepsStatus.step_escolas) ||
                      (step.id === 2 && stepsStatus.step_veiculos) ||
                      (step.id === 3 && stepsStatus.step_passageiros) ||
                      (step.id === 4 && stepsStatus.step_configuracoes)
                        ? "text-gray-500 line-through"
                        : "text-foreground"
                    }`}
                  >
                    {step.title}
                  </FormLabel>
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
  );
};

export const QUICK_START_STEPS_EXPORT = QUICK_START_STEPS;
