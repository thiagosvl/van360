import React from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { phoneMask } from "@/utils/masks";
import { ArrowLeft, Eye, EyeOff, Lock, Phone } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { ResponsavelRecuperarPinDialog } from "./ResponsavelRecuperarPinDialog";
import { useResponsavelLoginForm } from "@/hooks/form/useResponsavelLoginForm";

export const ResponsavelLoginForm: React.FC = () => {
  const {
    step,
    telefoneFormatted,
    isFirstAccess,
    showPin,
    setShowPin,
    rememberPhone,
    setRememberPhone,
    isRecuperarOpen,
    setIsRecuperarOpen,
    phoneForm,
    pinForm,
    handlePhoneSubmit,
    handlePinSubmit,
    handleBackToPhone,
    isPending
  } = useResponsavelLoginForm();

  const phoneInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (step === "phone") {
      const timer = setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="w-full">
      {step === "phone" ? (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}>
            <Banner
              variant="info"
              className="mb-4 p-3 rounded-2xl"
              description={
                <span>
                  Acesso para <strong>pais e responsáveis</strong>. Se você é motorista ou equipe, utilize a aba <strong>Motorista / Equipe</strong>.
                </span>
              }
            />
            <div className="space-y-4">
              <FormField
                control={phoneForm.control}
                name="telefone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <div
                        className={`flex items-center border rounded-2xl p-2 bg-white shadow-sm transition-all ${
                          fieldState.error
                            ? "border-red-500 ring-2 ring-red-500/20"
                            : "border-slate-200 focus-within:ring-2 focus-within:ring-[#1a3a5c]/20 focus-within:border-[#1a3a5c]"
                        }`}
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 mr-3 shrink-0">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <label className="text-[11px] font-medium text-slate-500 mb-0.5 truncate select-none">
                            Telefone (WhatsApp)
                          </label>
                          <Input
                            autoFocus
                            {...field}
                            ref={(e) => {
                              field.ref(e);
                              phoneInputRef.current = e;
                            }}
                            type="tel"
                            placeholder="(00) 00000-0000"
                            onChange={(e) => field.onChange(phoneMask(e.target.value))}
                            className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-300"
                            disabled={isPending}
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs ml-1 text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            {/* Checkbox "Lembrar meu telefone" com UI/UX identica a de motoristas */}
            <div className="flex items-center gap-2 mt-5 ml-1">
              <Checkbox
                id="rememberPhone"
                checked={rememberPhone}
                onCheckedChange={(checked) => setRememberPhone(Boolean(checked))}
                className="bg-white border-slate-300 shadow-sm rounded-[4px] data-[state=checked]:bg-[#1a3a5c] data-[state=checked]:border-[#1a3a5c] w-[18px] h-[18px] cursor-pointer"
              />
              <Label
                htmlFor="rememberPhone"
                className="text-[13px] font-medium text-slate-600 cursor-pointer select-none"
              >
                Lembrar meu telefone
              </Label>
            </div>

            {phoneForm.formState.errors.root && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2 text-xs font-medium text-red-600">
                <span className="mt-0.5">⚠️</span>
                <span>{phoneForm.formState.errors.root.message}</span>
              </div>
            )}

            <div className="pt-2 mt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-14 rounded-2xl text-[16px] font-bold bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white shadow-lg shadow-[#1a3a5c]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <span>Avançar</span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <Form {...pinForm}>
          <form onSubmit={pinForm.handleSubmit(handlePinSubmit)} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handleBackToPhone}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1a3a5c] transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Trocar Telefone</span>
              </button>
              <span className="text-xs font-semibold text-slate-400">{telefoneFormatted}</span>
            </div>

            <FormField
              control={pinForm.control}
              name="pin"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <div
                      className={`flex items-center border rounded-2xl p-2 bg-white shadow-sm transition-all ${
                        fieldState.error
                          ? "border-red-500 ring-2 ring-red-500/20"
                          : "border-slate-200 focus-within:ring-2 focus-within:ring-[#1a3a5c]/20 focus-within:border-[#1a3a5c]"
                      }`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 mr-3 shrink-0">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <label className="text-[11px] font-medium text-slate-500 mb-0.5 truncate select-none">
                          PIN de 4 Dígitos
                        </label>
                        <Input
                          {...field}
                          autoFocus
                          type={showPin ? "text" : "password"}
                          maxLength={4}
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                          placeholder="••••"
                          className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none tracking-widest placeholder:tracking-normal placeholder:text-slate-300"
                          disabled={isPending}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="flex items-center justify-center w-10 h-10 text-slate-400 hover:text-slate-600 transition-colors shrink-0 outline-none"
                        tabIndex={-1}
                        title={showPin ? "Ocultar PIN" : "Exibir PIN"}
                      >
                        {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs ml-1 text-red-500" />
                </FormItem>
              )}
            />

            {pinForm.formState.errors.root && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2 text-xs font-medium text-red-600">
                <span className="mt-0.5">⚠️</span>
                <span>{pinForm.formState.errors.root.message}</span>
              </div>
            )}

            <div className="pt-2 mt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-14 rounded-2xl text-[16px] font-bold bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white shadow-lg shadow-[#1a3a5c]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <span>{isFirstAccess ? "Criar PIN e Entrar" : "Entrar"}</span>
                )}
              </Button>
            </div>

            {!isFirstAccess && (
              <div className="flex flex-col items-center gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsRecuperarOpen(true)}
                  className="text-[14px] text-[#2d5a88] hover:text-[#1a3a5c] hover:underline transition-colors font-medium cursor-pointer"
                >
                  Esqueci meu PIN
                </button>
              </div>
            )}
          </form>
        </Form>
      )}

      <ResponsavelRecuperarPinDialog
        open={isRecuperarOpen}
        onOpenChange={setIsRecuperarOpen}
        initialPhone={telefoneFormatted}
      />
    </div>
  );
};
