import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RegisterFormData } from "@/schemas/registerSchema";
import { Plano, SubPlano } from "@/types/plano";
import { lazyLoad } from "@/utils/lazyLoad";
import { Suspense } from "react";
import { UseFormReturn } from "react-hook-form";

// Lazy load UI components
const PlanoCardSelection = lazyLoad(() =>
  import("@/components/features/register").then((mod) => ({
    default: mod.PlanoCardSelection,
  }))
);

interface PlanSelectionStepProps {
  form: UseFormReturn<RegisterFormData>;
  loadingPlanos: boolean;
  planosDataTyped: { bases: Plano[]; sub: SubPlano[] };
  selectedPlanoId: string;
  selectedSubPlanoId?: string;
  quantidadePersonalizada: string;
  setQuantidadePersonalizada: (v: string) => void;
  precoCalculadoPreview: { preco: number; valorPorCobranca: number } | null;
  isCalculandoPreco: boolean;
  getQuantidadeMinima: () => number | undefined;
  handleSelectSubPlano: (id?: string) => void;
  handleQuantidadePersonalizadaConfirm: () => void;
  handleNextStep: () => Promise<boolean>;
}

export function PlanSelectionStep({
  form,
  loadingPlanos,
  planosDataTyped,
  selectedPlanoId,
  selectedSubPlanoId,
  quantidadePersonalizada,
  setQuantidadePersonalizada,
  precoCalculadoPreview,
  isCalculandoPreco,
  getQuantidadeMinima,
  handleSelectSubPlano,
  handleQuantidadePersonalizadaConfirm,
  handleNextStep,
}: PlanSelectionStepProps) {
  
  return (
    <section className="space-y-3 sm:space-y-4 md:space-y-5">
      <Form {...form}>
        {!loadingPlanos && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planosDataTyped.bases.map((plano) => (
              <Suspense
                key={plano.id}
                fallback={<Skeleton className="h-96 w-full" />}
              >
                <PlanoCardSelection
                  plano={plano}
                  subPlanos={planosDataTyped.sub.filter(
                    (s) => String(s.parent_id) === String(plano.id)
                  )}
                  isSelected={selectedPlanoId === plano.id}
                  selectedSubPlanoId={selectedSubPlanoId}
                  quantidadePersonalizada={quantidadePersonalizada}
                  onSubPlanoSelect={handleSelectSubPlano}
                  onQuantidadePersonalizadaChange={setQuantidadePersonalizada}
                  precoCalculadoPreview={precoCalculadoPreview?.preco ?? null}
                  valorPorCobranca={precoCalculadoPreview?.valorPorCobranca ?? null}
                  isCalculandoPreco={isCalculandoPreco}
                  getQuantidadeMinima={getQuantidadeMinima}
                  onQuantidadePersonalizadaConfirm={handleQuantidadePersonalizadaConfirm}
                  onAvancarStep={async () => {
                    await handleNextStep();
                  }}
                  onSelect={(id) => {
                    const planoSelecionado = planosDataTyped.bases.find(
                      (p) => p.id === id
                    );
                    if (planoSelecionado) {
                      form.setValue("plano_id", id, { shouldValidate: true });
                    }
                  }}
                />
              </Suspense>
            ))}
          </div>
        )}

        <FormField
          control={form.control}
          name="plano_id"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} type="hidden" className="hidden" />
              </FormControl>
            </FormItem>
          )}
        />
      </Form>
    </section>
  );
}
