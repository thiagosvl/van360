import { Button } from "@/components/ui/button";
import { useAnalyticsInjector } from "@/hooks/business/useAnalyticsInjector";
import { useRegisterController } from "@/hooks/register/useRegisterController";
import { useSEO } from "@/hooks/useSEO";
import { getNowBR } from "@/utils/dateUtils";
import { Wand2, Loader2, Calendar, Eye, EyeOff, Lock, Mail, User, Phone } from "lucide-react";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cpfCnpjMask, dateMask, phoneMask } from "@/utils/masks";
import { DuplicateErrorBanner } from "@/components/features/register/DuplicateErrorBanner";
import { TermosUsoDialog as TermosDialog } from "@/components/dialogs/TermosUsoDialog";
import { PoliticaPrivacidadeDialog } from "@/components/dialogs/PoliticaPrivacidadeDialog";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export default function Register() {
  useSEO({
    title: "Criar conta grátis | Van360",
  });
  useAnalyticsInjector({ gtm: true, clarity: true });

  const {
    form,
    loading,
    handleNextStep,
    handleFillMagic,
    duplicateError,
    clearDuplicateError,
  } = useRegisterController();

  const [showPassword, setShowPassword] = useState(false);
  const [openTermos, setOpenTermos] = useState(false);
  const [openPolitica, setOpenPolitica] = useState(false);
  const navigate = useNavigate();

  const cpfcnpjValue = form.watch("cpfcnpj") || "";
  const isCnpj = cpfcnpjValue.replace(/\D/g, "").length > 11;

  return (
    <div className="min-h-screen bg-[#e8ecf1] flex flex-col justify-center items-center py-6 px-4 relative overflow-hidden pt-[max(1rem,var(--safe-area-top))] pb-[max(1rem,var(--safe-area-bottom))]">
      <div className="w-full max-w-2xl relative z-10">

        {/* Main Card */}
        <div className="bg-slate-50 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-200">

          {/* Header */}
          <div className="text-center p-6 pb-0 relative">
            {import.meta.env.DEV && (
              <div className="absolute right-2 top-2 z-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-[#1a3a5c] hover:bg-slate-50 rounded-full transition-all"
                  onClick={handleFillMagic}
                  title="Preencher com dados de teste"
                >
                  <Wand2 className="h-5 w-5" />
                </Button>
              </div>
            )}

            <div>
              {/* Logo Section */}
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/assets/logo-van360.webp"
                    alt="Van360"
                    className="h-12 w-auto select-none drop-shadow-sm cursor-pointer"
                    onClick={() => navigate(ROUTES.PUBLIC.LOGIN)}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-1.5 mt-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1a3a5c] drop-shadow-sm">
                  Crie sua conta grátis
                </h1>
                <p className="text-slate-500 text-sm sm:text-base font-medium text-center px-4">
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
                          <FormControl>
                            <div className={`flex items-center border rounded-2xl p-2 bg-white shadow-sm transition-all ${fieldState.error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 focus-within:ring-2 focus-within:ring-[#1a3a5c]/20 focus-within:border-[#1a3a5c]'}`}>
                              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 mr-3 shrink-0">
                                <User className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <label className="text-[11px] font-medium text-slate-500 mb-0.5 truncate select-none">
                                  CPF ou CNPJ <span className="text-red-600">*</span>
                                </label>
                                <Input
                                  {...field}
                                  inputMode="numeric"
                                  onChange={(e) => field.onChange(cpfCnpjMask(e.target.value))}
                                  placeholder=""
                                  className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none"
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs ml-1" />
                        </FormItem>
                      )}
                    />

                    {isCnpj && (
                      <FormField
                        control={form.control}
                        name="razao_social"
                        render={({ field, fieldState, formState }) => (
                          <FormItem>
                            <FormControl>
                              <div className={`flex items-center border rounded-2xl p-2 bg-white shadow-sm transition-all ${fieldState.error || (isCnpj && (!field.value || field.value.trim() === "") && Object.keys(formState.errors).length > 0) ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 focus-within:ring-2 focus-within:ring-[#1a3a5c]/20 focus-within:border-[#1a3a5c]'}`}>
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 mr-3 shrink-0">
                                  <User className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                  <label className="text-[11px] font-medium text-slate-500 mb-0.5 truncate select-none">
                                    Razão Social <span className="text-red-600">*</span>
                                  </label>
                                  <Input
                                    placeholder="Digite a razão social"
                                    {...field}
                                    value={field.value || ""}
                                    className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none"
                                  />
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs ml-1" />
                            {isCnpj && (!field.value || field.value.trim() === "") && Object.keys(formState.errors).length > 0 && !fieldState.error && (
                              <p className="text-[0.8rem] font-medium text-red-500 mt-1.5 ml-1">Razão social é obrigatória para CNPJ</p>
                            )}
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <div className={`flex items-center border rounded-2xl p-2 bg-white shadow-sm transition-all ${fieldState.error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 focus-within:ring-2 focus-within:ring-[#1a3a5c]/20 focus-within:border-[#1a3a5c]'}`}>
                              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 mr-3 shrink-0">
                                <User className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <label className="text-[11px] font-medium text-slate-500 mb-0.5 truncate select-none">
                                  Nome completo <span className="text-red-600">*</span>
                                </label>
                                <Input
                                  placeholder="Digite seu nome completo"
                                  {...field}
                                  className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none"
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs ml-1" />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="telefone"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormControl>
                              <div className={`flex items-center border rounded-2xl p-2 bg-white shadow-sm transition-all ${fieldState.error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 focus-within:ring-2 focus-within:ring-[#1a3a5c]/20 focus-within:border-[#1a3a5c]'}`}>
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 mr-3 shrink-0">
                                  <Phone className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                  <label className="text-[11px] font-medium text-slate-500 mb-0.5 truncate select-none">
                                    WhatsApp <span className="text-red-600">*</span>
                                  </label>
                                  <Input
                                    {...field}
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="(11) 99999-9999"
                                    maxLength={15}
                                    onChange={(e) => field.onChange(phoneMask(e.target.value))}
                                    className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none"
                                  />
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs ml-1" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormControl>
                              <div className={`flex items-center border rounded-2xl p-2 bg-white shadow-sm transition-all ${fieldState.error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 focus-within:ring-2 focus-within:ring-[#1a3a5c]/20 focus-within:border-[#1a3a5c]'}`}>
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 mr-3 shrink-0">
                                  <Mail className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                  <label className="text-[11px] font-medium text-slate-500 mb-0.5 truncate select-none">
                                    E-mail <span className="text-red-600">*</span>
                                  </label>
                                  <Input
                                    placeholder="seu@email.com"
                                    {...field}
                                    className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none"
                                  />
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs ml-1" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="data_nascimento"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <div className={`flex items-center border rounded-2xl p-2 bg-white shadow-sm transition-all ${fieldState.error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 focus-within:ring-2 focus-within:ring-[#1a3a5c]/20 focus-within:border-[#1a3a5c]'}`}>
                              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 mr-3 shrink-0">
                                <Calendar className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <label className="text-[11px] font-medium text-slate-500 mb-0.5 truncate select-none">
                                  Data de nascimento <span className="text-red-600">*</span>
                                </label>
                                <Input
                                  {...field}
                                  inputMode="numeric"
                                  maxLength={10}
                                  onChange={(e) => field.onChange(dateMask(e.target.value))}
                                  placeholder="dd/mm/aaaa"
                                  className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none"
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs ml-1" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="senha"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <div className={`flex items-center border rounded-2xl p-2 bg-white shadow-sm transition-all ${fieldState.error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 focus-within:ring-2 focus-within:ring-[#1a3a5c]/20 focus-within:border-[#1a3a5c]'}`}>
                              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 mr-3 shrink-0">
                                <Lock className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <label className="text-[11px] font-medium text-slate-500 mb-0.5 truncate select-none">
                                  Senha <span className="text-red-600">*</span>
                                </label>
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Mínimo 6 caracteres"
                                  {...field}
                                  className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none tracking-wider placeholder:tracking-normal"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="flex items-center justify-center w-10 h-10 text-slate-400 hover:text-slate-600 transition-colors shrink-0 outline-none"
                                tabIndex={-1}
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs ml-1" />
                        </FormItem>
                      )}
                    />

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
                                className={`bg-white shadow-sm rounded-[4px] w-5 h-5 data-[state=checked]:bg-[#1a3a5c] data-[state=checked]:border-[#1a3a5c] mt-0.5 flex-shrink-0 ${fieldState.error ? "border-red-500" : "border-slate-300"}`}
                              />
                            </FormControl>
                            <Label
                              htmlFor="termos_aceitos"
                              className="text-[13px] sm:text-[14px] text-slate-600 cursor-pointer select-none leading-relaxed font-medium"
                            >
                              Declaro que li e concordo com os Termos de Uso e a Política de Privacidade.
                            </Label>
                          </div>
                          <FormMessage className="pl-8 text-xs mt-1" />
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
                      className="w-full h-14 rounded-2xl text-[16px] font-bold bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white shadow-lg shadow-[#1a3a5c]/20 transition-all"
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

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 pt-2">
                      <button
                        type="button"
                        onClick={() => setOpenTermos(true)}
                        className="text-xs font-medium text-slate-500 hover:text-[#1a3a5c] transition-colors focus:outline-none"
                      >
                        Termos de Uso
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenPolitica(true)}
                        className="text-xs font-medium text-slate-500 hover:text-[#1a3a5c] transition-colors focus:outline-none"
                      >
                        Política de Privacidade
                      </button>
                    </div>

                    {/* Voltar ao login */}
                    <div className="text-center mt-6">
                      <p className="text-[13px] text-slate-500">
                        Já tem uma conta?{" "}
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.PUBLIC.LOGIN)}
                          className="text-[#1a3a5c] font-bold hover:underline transition-all"
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

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-sm text-slate-600 font-medium">
            © {getNowBR().getFullYear()} Van360. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
