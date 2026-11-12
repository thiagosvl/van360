import { useEffect, useMemo } from "react";
import {
  FormControl,
  FormField,
  FormItem,
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
import { HeartPulse } from "lucide-react";
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
          <HeartPulse className="w-4 h-4" />
        </div>
        Saúde e Informações Complementares
      </div>

      <div className="space-y-3.5">
        {perguntasAtivas.map((pergunta, index) => {
          const itemAtual = watchedRespostas[index];
          const isSimNao =
            pergunta.tipo === TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO;
          const boolVal = itemAtual?.resposta_booleana;

          return (
            <div
              key={pergunta.id}
              className="rounded-[24px] bg-[#fafafa] border border-[#e5e5e5] p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs sm:text-sm font-semibold text-[#0a0a0a] leading-snug">
                  {pergunta.pergunta}{" "}
                  {isSimNao || pergunta.obrigatorio ? (
                    <span className="text-[#e7000b]">*</span>
                  ) : (
                    <span className="text-[#737373] font-normal text-xs">
                      (opcional)
                    </span>
                  )}
                </p>
              </div>

              {isSimNao ? (
                <div className="space-y-2.5">
                  <FormField
                    control={form.control}
                    name={`dados_complementares.${index}.resposta_booleana`}
                    render={({ fieldState }) => (
                      <FormItem className="space-y-1.5">
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
                                "h-10 sm:h-11 rounded-[18px] text-xs sm:text-sm font-semibold border transition-all cursor-pointer",
                                boolVal === false
                                  ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                                  : fieldState.error
                                    ? "bg-white text-[#0a0a0a] border-[#e7000b]"
                                    : "bg-white text-[#0a0a0a] border-[#e5e5e5] hover:bg-[#f5f5f5]"
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
                                "h-10 sm:h-11 rounded-[18px] text-xs sm:text-sm font-semibold border transition-all cursor-pointer",
                                boolVal === true
                                  ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                                  : fieldState.error
                                    ? "bg-white text-[#0a0a0a] border-[#e7000b]"
                                    : "bg-white text-[#0a0a0a] border-[#e5e5e5] hover:bg-[#f5f5f5]"
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
                              className="h-10 sm:h-11 rounded-[18px] bg-white border-[#e5e5e5] focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
                              aria-invalid={!!fieldState.error}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name={`dados_complementares.${index}.resposta_texto`}
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1.5">
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
                          className="h-10 sm:h-11 rounded-[18px] bg-white border-[#e5e5e5] focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
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
        })}
      </div>
    </div>
  );
}
