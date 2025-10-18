import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { z } from "zod";

const QUICK_START_STEPS = [
  { id: 1, title: "Cadastrar a primeira escola", href: "/escolas" },
  { id: 2, title: "Cadastrar o primeiro passageiro", href: "/passageiros" },
  {
    id: 3,
    title: "Configurar o sistema (notificações e mensagens automáticas)",
    href: "/configuracoes",
  },
];

const quickStartSchema = z.object({
  stepsStatus: z.record(z.string(), z.boolean()).default({
    step_1: false,
    step_2: false,
    step_3: false,
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

  const watchedSteps = form.watch("stepsStatus");
  const completedSteps = Object.values(watchedSteps).filter(Boolean).length;
  const totalSteps = QUICK_START_STEPS.length;
  const progressValue = (completedSteps / totalSteps) * 100;

  const formSteps = QUICK_START_STEPS.map((step) => ({
    ...step,
    formKey: `stepsStatus.step_${step.id}`,
  }));

  const handleSubmit = (data: QuickStartFormValues) => {
    console.log("Status de Primeiros Passos Salvo:", data.stepsStatus);
  };

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
                <FormField
                  control={form.control}
                  name={step.formKey as keyof QuickStartFormValues}
                  render={({ field }) => (
                    <div className="flex items-center space-x-3">
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="h-5 w-5 rounded focus:ring-primary shrink-0"
                          />
                        </FormControl>

                        <FormLabel
                          className={`text-base font-semibold transition-colors cursor-pointer leading-snug ${
                            field.value
                              ? "text-gray-500 line-through"
                              : "text-foreground"
                          }`}
                        >
                          {step.title}
                        </FormLabel>
                      </FormItem>
                    </div>
                  )}
                />

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
