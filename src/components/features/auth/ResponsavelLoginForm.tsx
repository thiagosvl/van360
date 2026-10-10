import React from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
              className="mb-4"
              description={
                <span>
                  Para acessar, digite o número do telefone informado no cadastro do aluno.
                </span>
              }
            />
            <div className="space-y-4">
              <FormField
                control={phoneForm.control}
                name="telefone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                      Telefone (WhatsApp)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
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
                          className={`pl-10 h-11 rounded-[18px] bg-[#f5f5f5] border transition-all text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus-visible:ring-0 focus:bg-white ${fieldState.error
                            ? "border-[#e7000b] focus:border-[#e7000b]"
                            : "border-[#e5e5e5] focus:border-[#2563eb]"
                            }`}
                          disabled={isPending}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs ml-1 text-[#e7000b]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-2 mt-5 ml-1">
              <Checkbox
                id="rememberPhone"
                checked={rememberPhone}
                onCheckedChange={(checked) => setRememberPhone(Boolean(checked))}
                className="bg-white border-[#e5e5e5] shadow-2xs rounded-[6px] data-[state=checked]:bg-[#2563eb] data-[state=checked]:border-[#2563eb] w-[18px] h-[18px] cursor-pointer"
              />
              <Label
                htmlFor="rememberPhone"
                className="text-[13px] font-medium text-[#737373] cursor-pointer select-none"
              >
                Lembrar meu telefone
              </Label>
            </div>

            {phoneForm.formState.errors.root && (
              <div className="mt-4 p-3 rounded-[14px] bg-red-50 border border-red-200 flex items-start gap-2 text-xs font-medium text-[#e7000b]">
                <span className="mt-0.5">⚠️</span>
                <span>{phoneForm.formState.errors.root.message}</span>
              </div>
            )}

            <div className="pt-2 mt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 rounded-[18px] text-[15px] font-bold bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
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
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={handleBackToPhone}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#0a0a0a] transition-colors p-1.5 rounded-[12px] hover:bg-[#f5f5f5] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Trocar Telefone</span>
              </button>
              <span className="text-xs font-semibold text-[#737373]">{telefoneFormatted}</span>
            </div>

            {isFirstAccess && (
              <Banner
                variant="info"
                className="mb-4"
                description={
                  <span>
                    <strong>Primeiro acesso:</strong> crie uma <strong>senha de 4 dígitos</strong> para entrar no app nas próximas vezes.
                  </span>
                }
              />
            )}

            <FormField
              control={pinForm.control}
              name="pin"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                    Senha de 4 Dígitos
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                      <Input
                        {...field}
                        autoFocus
                        type={showPin ? "text" : "password"}
                        maxLength={4}
                        onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••"
                        className={`pl-10 pr-10 h-11 rounded-[18px] bg-[#f5f5f5] border transition-all text-sm font-semibold text-[#0a0a0a] tracking-widest placeholder:tracking-normal placeholder:text-[#a3a3a3] focus-visible:ring-0 focus:bg-white ${fieldState.error
                          ? "border-[#e7000b] focus:border-[#e7000b]"
                          : "border-[#e5e5e5] focus:border-[#2563eb]"
                          }`}
                        disabled={isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] transition-colors p-1 cursor-pointer"
                        tabIndex={-1}
                        title={showPin ? "Ocultar senha" : "Exibir senha"}
                      >
                        {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs ml-1 text-[#e7000b]" />
                </FormItem>
              )}
            />

            {pinForm.formState.errors.root && (
              <div className="mt-4 p-3 rounded-[14px] bg-red-50 border border-red-200 flex items-start gap-2 text-xs font-medium text-[#e7000b]">
                <span className="mt-0.5">⚠️</span>
                <span>{pinForm.formState.errors.root.message}</span>
              </div>
            )}

            <div className="pt-2 mt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 rounded-[18px] text-[15px] font-bold bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <span>{isFirstAccess ? "Criar Senha e Entrar" : "Entrar"}</span>
                )}
              </Button>
            </div>

            {!isFirstAccess && (
              <div className="flex flex-col items-center gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsRecuperarOpen(true)}
                  className="text-sm text-[#2563eb] hover:text-[#1d4ed8] hover:underline transition-colors font-medium cursor-pointer"
                >
                  Esqueci minha senha
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
