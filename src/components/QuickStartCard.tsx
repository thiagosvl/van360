import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"; // Assumindo o import correto
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"; // Assumindo os imports do Form
import { Progress } from "@/components/ui/progress"; // Assumindo o import correto
import { ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { z } from "zod";

// --- 1. Dados Estáticos para Quick Start ---
const QUICK_START_STEPS = [
  { id: 1, title: "Cadastrar a primeira escola", href: "/escolas" },
  { id: 2, title: "Cadastrar o primeiro passageiro", href: "/passageiros" },
  {
    id: 3,
    title: "Configurar o sistema (notificações e mensagens automáticas)",
    href: "/configuracoes",
  },
];

// --- 2. Schema e Tipagem para o Formulário ---
// O formulário gerencia um objeto onde as chaves são os IDs dos passos (strings)
// e os valores são booleanos (true = concluído, false = pendente).
const quickStartSchema = z.object({
  // Exemplo de tipagem dinâmica para os checkboxes:
  // "step_1": z.boolean().default(false),
  // ...
  // Usaremos um Record<string, boolean> para simplificar.
  stepsStatus: z.record(z.string(), z.boolean()).default({
    // Inicializa todos como falsos
    step_1: false,
    step_2: false,
    step_3: false,
  }),
});

type QuickStartFormValues = z.infer<typeof quickStartSchema>;

// Mapeia os dados estáticos para o formato do formulário
const defaultValues = {
  stepsStatus: QUICK_START_STEPS.reduce((acc, step) => {
    // Usamos um prefixo para garantir que a chave seja uma string única
    acc[`step_${step.id}`] = false;
    return acc;
  }, {} as Record<string, boolean>),
};

// --- Componente: Quick Start Guide ---
export const QuickStartCard = () => {
  // 1. Inicializa o formulário
  const form = useForm<QuickStartFormValues>({
    defaultValues: defaultValues,
    // Note: Não estamos usando resolver para simplificar
  });

  // 2. Assiste às mudanças para calcular o progresso
  const watchedSteps = form.watch("stepsStatus");
  const completedSteps = Object.values(watchedSteps).filter(Boolean).length;
  const totalSteps = QUICK_START_STEPS.length;
  const progressValue = (completedSteps / totalSteps) * 100;

  // Mapeia os IDs dos passos para as chaves do formulário
  const formSteps = QUICK_START_STEPS.map((step) => ({
    ...step,
    formKey: `stepsStatus.step_${step.id}`,
  }));

  const handleSubmit = (data: QuickStartFormValues) => {
    // Aqui você enviaria o status de conclusão para o backend
    console.log("Status de Primeiros Passos Salvo:", data.stepsStatus);
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-2">Primeiros Passos</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Concluído {completedSteps} de {totalSteps}
        </p>

        {/* Progress Bar moderna */}
        <Progress value={progressValue} className="h-2 mb-6" />

        {/* 3. Envolve tudo no componente Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {formSteps.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between py-2 border-b last:border-b-0 transition-colors hover:bg-gray-50/50 rounded-sm"
              >
                {/* 4. Campo de Formulário para o Checkbox */}
                <FormField
                  control={form.control}
                  name={step.formKey as keyof QuickStartFormValues}
                  render={({ field }) => (
                    // ⭐️ 1. REMOVER o w-full daqui para que o NavLink fique ao lado
                    <div className="flex items-center space-x-3">
                      {/* ⭐️ 2. Usamos o FormItem para envolver o clique no LABEL e no Checkbox */}
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            // ⭐️ 3. CORREÇÃO: Adicionar onCheckedChange de volta.
                            // Esta é a função que o Checkbox do shadcn/ui deve usar.
                            onCheckedChange={field.onChange}
                            className="h-5 w-5 rounded focus:ring-primary shrink-0"
                          />
                        </FormControl>

                        {/* 4. FormLabel agora só se comporta como um label */}
                        <FormLabel
                          className={`text-base font-medium transition-colors cursor-pointer ${
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

                {/* Ícone de Acesso Rápido */}
                <NavLink to={step.href}>
                  <ChevronRight className="h-5 w-5 text-primary hover:text-primary/80 transition-colors" />
                </NavLink>
              </div>
            ))}

            {/* Botão de envio (mantido invisível, mas essencial para a estrutura do form) */}
            <button type="submit" className="hidden" />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

// Exporte os dados estáticos e o componente para uso no Inicio.tsx
export const QUICK_START_STEPS_EXPORT = QUICK_START_STEPS;
