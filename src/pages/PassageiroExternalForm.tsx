import { usePassageiroExternalForm } from "@/hooks/form/usePassageiroExternalForm";

import { MoneyInput } from "@/components/forms";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { generos, modalidades, periodos } from "@/utils/formatters";
import {
    AlertTriangle,
    CalendarDays,
    Car,
    CheckCircle2,
    CreditCard,
    Loader2,
    School,
    Sun,
    User,
    Wand2,
} from "lucide-react";

import { PassageiroFormEndereco } from "@/components/features/passageiro/form/PassageiroFormEndereco";
import { PassageiroFormResponsavel } from "@/components/features/passageiro/form/PassageiroFormResponsavel";
import { dateMask } from "@/utils/masks";

export default function PassageiroExternalForm() {
  const {
    form,
    loading,
    motoristaApelido,
    submitting,
    success,
    openAccordionItems,
    setOpenAccordionItems,
    escolasList,
    handleSubmit,
    onFormError,
    handleNewCadastro,
    handleFillMock,
  } = usePassageiroExternalForm();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50/90 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-3xl p-8 text-center border border-gray-100">
          <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Cadastro realizado!
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            O condutor{" "}
            <span className="font-semibold text-gray-900">
              {motoristaApelido}
            </span>{" "}
            será notificado que você concluiu o cadastro.
          </p>
          <Button
            onClick={handleNewCadastro}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
          >
            Novo Cadastro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-0 px-0 sm:pt-8 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-3xl mx-auto">
        <div className="shadow-2xl sm:rounded-3xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-blue-600 p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/pattern.png')] opacity-10"></div>

            <div className="absolute right-4 top-4 z-20">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/20 rounded-full"
                onClick={handleFillMock}
                title="Preencher com dados fictícios"
              >
                <Wand2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-6 transition-transform hover:scale-105 duration-500 ease-out">
                <img
                  src="/assets/logo-van360.png"
                  alt="Van360"
                  className="h-20 sm:h-24 w-auto drop-shadow-lg select-none filter brightness-0 invert opacity-90"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                Cadastro de Passageiro
              </h1>
              <div className="inline-flex items-center gap-2 bg-blue-700/50 px-4 py-1.5 rounded-full text-blue-100 text-sm font-medium backdrop-blur-sm border border-blue-500/30">
                <Car className="w-4 h-4" />
                {motoristaApelido}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit, onFormError)}
                className="space-y-8"
              >
                <Accordion
                  type="multiple"
                  value={openAccordionItems}
                  onValueChange={setOpenAccordionItems}
                  className="w-full space-y-4"
                >
                  {/* DADOS DO PASSAGEIRO */}
                  <AccordionItem
                    value="passageiro"
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
                      <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <User className="w-5 h-5" />
                        </div>
                        Passageiro
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
                      <div className="grid grid-cols-1 gap-6">
                        <FormField
                          control={form.control}
                          name="nome"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Nome <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                  <Input
                                    {...field}
                                    placeholder="Digite o nome do passageiro"
                                    className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    aria-invalid={!!fieldState.error}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="escola_id"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 font-medium ml-1">
                                  Escola
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <div className="relative">
                                      <School className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                      <SelectTrigger
                                        className={cn(
                                          "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 text-left focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                          fieldState.error && "border-red-500"
                                        )}
                                      >
                                        <SelectValue placeholder="Selecione a escola" />
                                      </SelectTrigger>
                                    </div>
                                  </FormControl>
                                  <SelectContent>
                                    {escolasList?.map((escola) => (
                                      <SelectItem
                                        key={escola.id}
                                        value={escola.id}
                                      >
                                        {escola.nome}
                                      </SelectItem>
                                    ))}
                                    <SelectItem
                                      value="none"
                                      className="text-blue-600 font-semibold border-t border-blue-50 mt-1"
                                    >
                                      Nenhuma das opções acima
                                    </SelectItem>
                                  </SelectContent>
                                </Select>

                                {field.value === "none" && (
                                  <Alert className="mt-4 bg-blue-50 border-blue-100 text-blue-900 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-xs text-blue-700 leading-relaxed font-medium">
                                      Escola não listada? Continue o cadastro. O
                                      motorista será avisado para ajustar
                                      depois.
                                    </AlertDescription>
                                  </Alert>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="periodo"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 font-medium ml-1">
                                  Período
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <div className="relative">
                                      <Sun className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                      <SelectTrigger
                                        className={cn(
                                          "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 text-left focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                          fieldState.error && "border-red-500"
                                        )}
                                      >
                                        <SelectValue placeholder="Selecione o período" />
                                      </SelectTrigger>
                                    </div>
                                  </FormControl>
                                  <SelectContent>
                                    {periodos.map((periodo) => (
                                      <SelectItem
                                        key={periodo.value}
                                        value={periodo.value}
                                      >
                                        {periodo.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <FormField
                          control={form.control}
                          name="modalidade"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Modalidade <span className="text-red-600">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={cn(
                                      "h-12 rounded-xl bg-gray-50 border-gray-200 text-left focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                      fieldState.error && "border-red-500"
                                    )}
                                  >
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {modalidades.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                           control={form.control}
                           name="data_nascimento"
                           render={({ field, fieldState }) => (
                             <FormItem>
                               <FormLabel className="text-gray-700 font-medium ml-1">
                                 Data de Nascimento <span className="text-red-600">*</span>
                               </FormLabel>
                               <FormControl>
                                 <Input
                                   type="text"
                                   placeholder="DD/MM/AAAA"
                                   maxLength={10}
                                   {...field}
                                   onChange={(e) => {
                                     field.onChange(dateMask(e.target.value));
                                   }}
                                   className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                 />
                               </FormControl>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                         <FormField
                           control={form.control}
                           name="genero"
                           render={({ field, fieldState }) => (
                             <FormItem>
                               <FormLabel className="text-gray-700 font-medium ml-1">
                                 Gênero <span className="text-red-600">*</span>
                               </FormLabel>
                               <Select
                                 onValueChange={field.onChange}
                                 value={field.value}
                               >
                                 <FormControl>
                                   <SelectTrigger
                                       className={cn(
                                         "h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                         fieldState.error && "border-red-500"
                                       )}
                                     >
                                       <SelectValue placeholder="Selecione..." />
                                     </SelectTrigger>
                                 </FormControl>
                                 <SelectContent>
                                   {generos.map((option) => (
                                     <SelectItem key={option.value} value={option.value}>
                                       {option.label}
                                     </SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                      </div>

                    </AccordionContent>
                  </AccordionItem>

                  {/* DADOS DO RESPONSÁVEL */}
                  <PassageiroFormResponsavel />

                  {/* MENSALIDADE */}
                  <AccordionItem
                    value="cobranca"
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline transition-colors">
                      <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        Mensalidade
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="valor_cobranca"
                          render={({ field }) => (
                            <MoneyInput
                              field={field}
                              label="Valor da Mensalidade"
                              inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                            />
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dia_vencimento"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium ml-1">
                                Dia do Vencimento
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <div className="relative">
                                    <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                    <SelectTrigger
                                      className={cn(
                                        "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                        fieldState.error && "border-red-500"
                                      )}
                                      aria-invalid={!!fieldState.error}
                                    >
                                      <SelectValue placeholder="Selecione o dia" />
                                    </SelectTrigger>
                                  </div>
                                </FormControl>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                  {Array.from(
                                    { length: 31 },
                                    (_, i) => i + 1
                                  ).map((dia) => (
                                    <SelectItem key={dia} value={String(dia)}>
                                      Dia {dia}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                         <FormField
                            control={form.control}
                            name="data_inicio_transporte"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 font-medium ml-1">
                                  Início do Transporte
                                </FormLabel>
                                 <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* ENDEREÇO E OBSERVAÇÕES */}
                  <PassageiroFormEndereco />
                </Accordion>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 border-t border-gray-200 backdrop-blur-sm z-50">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={form.handleSubmit(handleSubmit, onFormError)}
            disabled={submitting}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Enviando Cadastro...
              </>
            ) : (
              "Enviar Cadastro"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
