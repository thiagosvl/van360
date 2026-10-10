import { Button } from "@/components/ui/button";
import { useRegisterController } from "@/hooks/register/useRegisterController";
import { isDevEnv } from "@/utils/detectPlatform";
import { useSEO } from "@/hooks/useSEO";
import { getNowBR } from "@/utils/dateUtils";
import { Wand2, Loader2, Calendar, Eye, EyeOff, Lock, Mail, User, Phone, Award, Sparkles, X, Gift } from "lucide-react";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cpfCnpjMask, dateMask, phoneMask } from "@/utils/masks";
import { DuplicateErrorBanner } from "@/components/features/register/DuplicateErrorBanner";
import { TermosUsoDialog as TermosDialog } from "@/components/dialogs/TermosUsoDialog";
import { PoliticaPrivacidadeDialog } from "@/components/dialogs/PoliticaPrivacidadeDialog";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { Banner } from "@/components/ui/Banner";

export default function Register() {
  useSEO({
    title: "Criar conta grátis | Van360",
  });

  const {
    form,
    loading,
    handleNextStep,
    handleFillMagic,
    duplicateError,
    clearDuplicateError,
    hasRefParam,
  } = useRegisterController();

  const [showPassword, setShowPassword] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [openTermos, setOpenTermos] = useState(false);
  const [openPolitica, setOpenPolitica] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isFromSplash = Boolean((location.state as { fromSplash?: boolean })?.fromSplash);

  const cpfcnpjValue = form.watch("cpfcnpj") || "";
  const isCnpj = cpfcnpjValue.replace(/\D/g, "").length > 11;

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col justify-center items-center py-6 px-4 relative overflow-hidden pt-[max(1rem,var(--safe-area-top))] pb-[max(1rem,var(--safe-area-bottom))]">
      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-[#e5e5e5]">
          <div className="text-center p-6 pb-0 relative">
            {isDevEnv() && (
              <div className="absolute right-3 top-3 z-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] rounded-full transition-all"
                  onClick={handleFillMagic}
                  title="Preencher com dados de teste"
                >
                  <Wand2 className="h-5 w-5" />
                </Button>
              </div>
            )}

            <div>
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/assets/logo-van360.webp"
                    alt="Van360"
                    className="h-12 w-auto select-none drop-shadow-xs cursor-pointer"
                    onClick={() => navigate(`${ROUTES.PUBLIC.LOGIN}?tipo=motorista`, { state: { fromSplash: isFromSplash } })}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-1.5 mt-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0a0a0a]">
                  Crie sua conta grátis
                </h1>
                <p className="text-[#737373] text-sm sm:text-base font-medium text-center px-4">
                  Leva menos de 1 minuto para organizar a sua van.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12 lg:pt-8 lg:pb-10">
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Form {...form}>
                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNextStep();
                  }}
                >
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="cpfcnpj"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                            CPF ou CNPJ <span className="text-[#e7000b]">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                              <Input
                                autoFocus
                                {...field}
                                inputMode="numeric"
                                placeholder="Digite seu CPF ou CNPJ"
                                onChange={(e) => field.onChange(cpfCnpjMask(e.target.value))}
                                className={`pl-10 h-11 rounded-[18px] bg-[#f5f5f5] border transition-all text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus-visible:ring-0 focus:bg-white ${
                                  fieldState.error
                                    ? "border-[#e7000b] focus:border-[#e7000b]"
                                    : "border-[#e5e5e5] focus:border-[#2563eb]"
                                }`}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs ml-1 text-[#e7000b]" />
                        </FormItem>
                      )}
                    />

                    {isCnpj && (
                      <FormField
                        control={form.control}
                        name="razao_social"
                        render={({ field, fieldState, formState }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                              Razão Social <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                                <Input
                                  placeholder="Digite a razão social"
                                  {...field}
                                  value={field.value || ""}
                                  className={`pl-10 h-11 rounded-[18px] bg-[#f5f5f5] border transition-all text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus-visible:ring-0 focus:bg-white ${
                                    fieldState.error || (isCnpj && (!field.value || field.value.trim() === "") && Object.keys(formState.errors).length > 0)
                                      ? "border-[#e7000b] focus:border-[#e7000b]"
                                      : "border-[#e5e5e5] focus:border-[#2563eb]"
                                  }`}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs ml-1 text-[#e7000b]" />
                            {isCnpj && (!field.value || field.value.trim() === "") && Object.keys(formState.errors).length > 0 && !fieldState.error && (
                              <p className="text-[0.8rem] font-medium text-[#e7000b] mt-1.5 ml-1">Razão social é obrigatória para CNPJ</p>
                            )}
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                              Nome completo <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                                <Input
                                  placeholder="Digite seu nome completo"
                                  {...field}
                                  className={`pl-10 h-11 rounded-[18px] bg-[#f5f5f5] border transition-all text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus-visible:ring-0 focus:bg-white ${
                                    fieldState.error
                                      ? "border-[#e7000b] focus:border-[#e7000b]"
                                      : "border-[#e5e5e5] focus:border-[#2563eb]"
                                  }`}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs ml-1 text-[#e7000b]" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="apelido"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                              Nome do Transporte / Apelido
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                                <Input
                                  placeholder="Ex: Tio Thiago"
                                  {...field}
                                  className={`pl-10 h-11 rounded-[18px] bg-[#f5f5f5] border transition-all text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus-visible:ring-0 focus:bg-white ${
                                    fieldState.error
                                      ? "border-[#e7000b] focus:border-[#e7000b]"
                                      : "border-[#e5e5e5] focus:border-[#2563eb]"
                                  }`}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs ml-1 text-[#e7000b]" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="telefone"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                              WhatsApp <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                                <Input
                                  {...field}
                                  type="tel"
                                  inputMode="numeric"
                                  placeholder="(11) 99999-9999"
                                  maxLength={15}
                                  onChange={(e) => field.onChange(phoneMask(e.target.value))}
                                  className={`pl-10 h-11 rounded-[18px] bg-[#f5f5f5] border transition-all text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus-visible:ring-0 focus:bg-white ${
                                    fieldState.error
                                      ? "border-[#e7000b] focus:border-[#e7000b]"
                                      : "border-[#e5e5e5] focus:border-[#2563eb]"
                                  }`}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs ml-1 text-[#e7000b]" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                              E-mail <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                                <Input
                                  placeholder="seu@email.com"
                                  {...field}
                                  className={`pl-10 h-11 rounded-[18px] bg-[#f5f5f5] border transition-all text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus-visible:ring-0 focus:bg-white ${
                                    fieldState.error
                                      ? "border-[#e7000b] focus:border-[#e7000b]"
                                      : "border-[#e5e5e5] focus:border-[#2563eb]"
                                  }`}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs ml-1 text-[#e7000b]" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="data_nascimento"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                            Data de nascimento <span className="text-[#e7000b]">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                              <Input
                                {...field}
                                inputMode="numeric"
                                maxLength={10}
                                onChange={(e) => field.onChange(dateMask(e.target.value))}
                                placeholder="dd/mm/aaaa"
                                className={`pl-10 h-11 rounded-[18px] bg-[#f5f5f5] border transition-all text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus-visible:ring-0 focus:bg-white ${
                                  fieldState.error
                                    ? "border-[#e7000b] focus:border-[#e7000b]"
                                    : "border-[#e5e5e5] focus:border-[#2563eb]"
                                }`}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs ml-1 text-[#e7000b]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="senha"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                            Senha <span className="text-[#e7000b]">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mínimo 6 caracteres"
                                {...field}
                                className={`pl-10 pr-10 h-11 rounded-[18px] bg-[#f5f5f5] border transition-all text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus-visible:ring-0 focus:bg-white ${
                                  fieldState.error
                                    ? "border-[#e7000b] focus:border-[#e7000b]"
                                    : "border-[#e5e5e5] focus:border-[#2563eb]"
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] transition-colors p-1 cursor-pointer"
                                tabIndex={-1}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs ml-1 text-[#e7000b]" />
                        </FormItem>
                      )}
                    />

                    {hasRefParam ? (
                      <Banner
                        variant="success"
                        className="p-3"
                        description={
                          <span>
                            <strong>Indicação ativada!</strong> Você garantirá desconto na primeira assinatura.
                          </span>
                        }
                      />
                    ) : (
                      <div className="pt-1">
                        {!showReferralInput ? (
                          <button
                            type="button"
                            onClick={() => setShowReferralInput(true)}
                            className="text-xs font-semibold text-[#737373] hover:text-[#0a0a0a] transition-colors flex items-center gap-2 px-1 py-1 cursor-pointer"
                          >
                            <Gift className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Foi indicado por outro motorista?</span>
                          </button>
                        ) : (
                          <FormField
                            control={form.control}
                            name="indicador_telefone"
                            render={({ field, fieldState }) => (
                              <FormItem className="animate-in fade-in zoom-in-95 duration-200">
                                <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                                  WhatsApp de quem indicou
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600 pointer-events-none" />
                                    <Input
                                      {...field}
                                      type="tel"
                                      inputMode="numeric"
                                      placeholder="(11) 99999-9999"
                                      maxLength={15}
                                      onChange={(e) => field.onChange(phoneMask(e.target.value))}
                                      className={`pl-10 pr-10 h-11 rounded-[18px] bg-[#f5f5f5] border transition-all text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus-visible:ring-0 focus:bg-white ${
                                        fieldState.error
                                          ? "border-[#e7000b] focus:border-[#e7000b]"
                                          : "border-[#e5e5e5] focus:border-[#2563eb]"
                                      }`}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        form.setValue("indicador_telefone", "", { shouldValidate: true });
                                        form.clearErrors("indicador_telefone");
                                        setShowReferralInput(false);
                                      }}
                                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] p-1 rounded-full transition-colors cursor-pointer"
                                      title="Remover"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage className="text-xs ml-1 text-[#e7000b]" />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="termos_aceitos"
                      render={({ field, fieldState }) => (
                        <FormItem className="mt-6">
                          <div className="flex items-start gap-3 pt-1">
                            <FormControl>
                              <Checkbox
                                id="termos_aceitos"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className={`bg-white shadow-2xs rounded-[4px] w-4 h-4 data-[state=checked]:bg-[#2563eb] data-[state=checked]:border-[#2563eb] mt-0.5 shrink-0 ${fieldState.error ? "border-[#e7000b]" : "border-[#e5e5e5]"}`}
                              />
                            </FormControl>
                            <Label
                              htmlFor="termos_aceitos"
                              className="text-xs text-[#737373] cursor-pointer select-none leading-normal font-normal"
                            >
                              Li e concordo com os{" "}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setOpenTermos(true);
                                }}
                                className="text-[#2563eb] hover:underline font-medium cursor-pointer transition-colors"
                              >
                                Termos de Uso
                              </button>{" "}
                              e a{" "}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setOpenPolitica(true);
                                }}
                                className="text-[#2563eb] hover:underline font-medium cursor-pointer transition-colors"
                              >
                                Política de Privacidade
                              </button>
                              .
                            </Label>
                          </div>
                          <FormMessage className="pl-7 text-xs mt-1 text-[#e7000b]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    {duplicateError && clearDuplicateError && (
                      <DuplicateErrorBanner
                        error={duplicateError}
                        onDismiss={clearDuplicateError}
                      />
                    )}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 rounded-[18px] text-[15px] font-bold bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        <>Criar minha conta</>
                      )}
                    </Button>

                    <div className="text-center mt-6">
                      <p className="text-[13px] text-[#737373]">
                        Já tem uma conta?{" "}
                        <button
                          type="button"
                          onClick={() => navigate(`${ROUTES.PUBLIC.LOGIN}?tipo=motorista`, { state: { fromSplash: isFromSplash } })}
                          className="text-[#2563eb] font-bold hover:underline transition-all cursor-pointer"
                        >
                          Fazer login
                        </button>
                      </p>
                    </div>
                  </div>
                </form>
              </Form>

              <TermosDialog open={openTermos} onOpenChange={setOpenTermos} />
              <PoliticaPrivacidadeDialog open={openPolitica} onOpenChange={setOpenPolitica} />
            </section>
          </div>
        </div>

        <div className="text-center pt-4">
          <p className="text-sm text-[#737373] font-medium">
            © {getNowBR().getFullYear()} Van360. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
