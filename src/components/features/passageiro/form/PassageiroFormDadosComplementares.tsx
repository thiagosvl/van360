import { useEffect, useMemo } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  CamposFormularioExternoConfig,
  resolvePerguntasPersonalizadas,
  TipoPerguntaPersonalizadaEnum,
} from "@/constants/formularioExterno";
import { PrePassageiroFormData } from "@/schemas/prePassageiroSchema";
import { cn } from "@/lib/utils";
import { ClipboardList } from "lucide-react";
import { useFormContext } from "react-hook-form";

interface PassageiroFormDadosComplementaresProps {
  formConfig?: CamposFormularioExternoConfig;
}

export function PassageiroFormDadosComplementares({
  formConfig,
}: PassageiroFormDadosComplementaresProps) {
  const form = useFormContext<PrePassageiroFormData>();

  const perguntasAtivas = useMemo(
    () =>
      resolvePerguntasPersonalizadas(
        formConfig?.perguntas_personalizadas
      ).filter((p) => p.ativo),
    [formConfig?.perguntas_personalizadas]
  );

  useEffect(() => {
    if (perguntasAtivas.length === 0) return;

    const atuais = form.getValues("dados_complementares") || [];
    const precisaSincronizar =
      atuais.length !== perguntasAtivas.length ||
      perguntasAtivas.some((p, i) => atuais[i]?.id !== p.id);

    if (precisaSincronizar) {
      const mapaAtuais = new Map(
        atuais.filter((item) => Boolean(item?.id)).map((item) => [item.id, item])
      );
      const sincronizados = perguntasAtivas.map((p) => {
        const existente = mapaAtuais.get(p.id);
        return {
          id: p.id,
          pergunta: p.pergunta,
          tipo: p.tipo,
          resposta_booleana:
            existente?.resposta_booleana !== undefined
              ? existente.resposta_booleana
              : null,
          resposta_texto: existente?.resposta_texto || "",
        };
      });
      form.setValue("dados_complementares", sincronizados, {
        shouldValidate: false,
      });
    }
  }, [perguntasAtivas, form]);

  const watchedRespostas = form.watch("dados_complementares") || [];

  if (perguntasAtivas.length === 0) {
    return null;
  }

  return (
    <div id="section-dados-complementares" className="space-y-4">
      <div className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-[#0a0a0a] mb-4">
        <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5] shrink-0">
          <ClipboardList className="w-4 h-4" />
        </div>
        Informações Complementares
      </div>

      <div className="space-y-4 sm:space-y-5">
        {perguntasAtivas.map((pergunta, index) => {
          const itemAtual = watchedRespostas[index];
          const isSimNao =
            pergunta.tipo === TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO;
          const boolVal = itemAtual?.resposta_booleana;

          if (isSimNao) {
            return (
              <div key={pergunta.id} className="space-y-2">
                <FormField
                  control={form.control}
                  name={`dados_complementares.${index}.resposta_booleana`}
                  render={({ fieldState }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[#0a0a0a] font-medium text-xs leading-snug block">
                        {pergunta.pergunta}{" "}
                        <span className="text-[#e7000b]">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              form.setValue(
                                `dados_complementares.${index}.id`,
                                pergunta.id
                              );
                              form.setValue(
                                `dados_complementares.${index}.pergunta`,
                                pergunta.pergunta
                              );
                              form.setValue(
                                `dados_complementares.${index}.tipo`,
                                pergunta.tipo
                              );
                              form.setValue(
                                `dados_complementares.${index}.resposta_booleana`,
                                false,
                                { shouldValidate: true }
                              );
                              form.setValue(
                                `dados_complementares.${index}.resposta_texto`,
                                "",
                                { shouldValidate: true }
                              );
                            }}
                            className={cn(
                              "h-10 sm:h-11 rounded-[18px] text-xs sm:text-sm border transition-all cursor-pointer",
                              boolVal === false
                                ? "bg-primary/10 text-primary border-primary/25 font-semibold shadow-2xs"
                                : fieldState.error
                                  ? "bg-[#f5f5f5] text-[#737373] border-[#e7000b] font-medium hover:bg-[#ededed] hover:text-[#0a0a0a]"
                                  : "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5] font-medium hover:bg-[#ededed] hover:text-[#0a0a0a]"
                            )}
                          >
                            Não
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              form.setValue(
                                `dados_complementares.${index}.id`,
                                pergunta.id
                              );
                              form.setValue(
                                `dados_complementares.${index}.pergunta`,
                                pergunta.pergunta
                              );
                              form.setValue(
                                `dados_complementares.${index}.tipo`,
                                pergunta.tipo
                              );
                              form.setValue(
                                `dados_complementares.${index}.resposta_booleana`,
                                true,
                                { shouldValidate: true }
                              );
                            }}
                            className={cn(
                              "h-10 sm:h-11 rounded-[18px] text-xs sm:text-sm border transition-all cursor-pointer",
                              boolVal === true
                                ? "bg-primary/10 text-primary border-primary/25 font-semibold shadow-2xs"
                                : fieldState.error
                                  ? "bg-[#f5f5f5] text-[#737373] border-[#e7000b] font-medium hover:bg-[#ededed] hover:text-[#0a0a0a]"
                                  : "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5] font-medium hover:bg-[#ededed] hover:text-[#0a0a0a]"
                            )}
                          >
                            Sim
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {boolVal === true && (
                  <FormField
                    control={form.control}
                    name={`dados_complementares.${index}.resposta_texto`}
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-1.5 animate-in fade-in duration-200">
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder={
                              pergunta.placeholder_detalhe ||
                              "Especifique os detalhes..."
                            }
                            className="h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
                            aria-invalid={!!fieldState.error}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            );
          }

          return (
            <FormField
              key={pergunta.id}
              control={form.control}
              name={`dados_complementares.${index}.resposta_texto`}
              render={({ field, fieldState }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs leading-snug block">
                    {pergunta.pergunta}{" "}
                    {pergunta.obrigatorio ? (
                      <span className="text-[#e7000b]">*</span>
                    ) : (
                      <span className="text-[#737373] font-normal text-xs">
                        (opcional)
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => {
                        form.setValue(
                          `dados_complementares.${index}.id`,
                          pergunta.id
                        );
                        form.setValue(
                          `dados_complementares.${index}.pergunta`,
                          pergunta.pergunta
                        );
                        form.setValue(
                          `dados_complementares.${index}.tipo`,
                          pergunta.tipo
                        );
                        field.onChange(e.target.value);
                      }}
                      placeholder={
                        pergunta.placeholder_detalhe ||
                        "Digite sua resposta..."
                      }
                      className="h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
                      aria-invalid={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
