import React, { useState, useEffect, useCallback } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import {
  KeyRound,
  Mail,
  ArrowLeft,
  RefreshCw,
  Phone,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Trash2,
  CheckCircle2
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { phoneMask } from "@/utils/masks";
import { responsavelApi } from "@/services/api/responsavel.api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ResponsavelRecuperarPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPhone?: string;
}

const phoneStepSchema = z.object({
  telefone: z.string().min(14, "Digite um telefone válido.")
});

const otpStepSchema = z.object({
  codigo: z.string().length(6, "O código deve ter 6 dígitos.")
});

const pinStepSchema = z.object({
  newPin: z
    .string()
    .length(4, "A senha deve ter exatamente 4 dígitos.")
    .regex(/^\d+$/, "A senha deve conter apenas números.")
});

type PhoneStepValues = z.infer<typeof phoneStepSchema>;
type OtpStepValues = z.infer<typeof otpStepSchema>;
type PinStepValues = z.infer<typeof pinStepSchema>;

interface MaskedEmailItem {
  id: number;
  mascarado: string;
}

export const ResponsavelRecuperarPinDialog: React.FC<ResponsavelRecuperarPinDialogProps> = ({
  open,
  onOpenChange,
  initialPhone = ""
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [emailsEncontrados, setEmailsEncontrados] = useState<MaskedEmailItem[]>([]);
  const [selectedEmailIndex, setSelectedEmailIndex] = useState<number | null>(null);
  const [emailMascarado, setEmailMascarado] = useState<string>("");
  const [resetToken, setResetToken] = useState<string>("");
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const phoneForm = useForm<PhoneStepValues>({
    resolver: zodResolver(phoneStepSchema),
    defaultValues: { telefone: initialPhone }
  });

  const otpForm = useForm<OtpStepValues>({
    resolver: zodResolver(otpStepSchema),
    defaultValues: { codigo: "" }
  });

  const pinForm = useForm<PinStepValues>({
    resolver: zodResolver(pinStepSchema),
    defaultValues: { newPin: "" }
  });

  const handleClose = () => {
    setStep(1);
    setLoading(false);
    setEmailsEncontrados([]);
    setSelectedEmailIndex(null);
    setEmailMascarado("");
    setResetToken("");
    setErrorMessage(null);
    phoneForm.reset();
    otpForm.reset();
    pinForm.reset();
    onOpenChange(false);
  };

  const handleSendOtp = useCallback(async (cleanPhone: string, emailIndex: number) => {
    setLoading(true);
    try {
      const res = await responsavelApi.sendResetOtp(cleanPhone, emailIndex);
      setEmailMascarado(res.emailMascarado);
      setStep(2);
      toast.success(`Código de verificação enviado para ${res.emailMascarado}`);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast.error(errorObj.response?.data?.message || "Erro ao enviar e-mail de recuperação.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCheckEmails = useCallback(async (phoneVal?: string) => {
    const rawVal = phoneVal || phoneForm.getValues("telefone");
    const cleanPhone = rawVal.replace(/\D/g, "");
    if (cleanPhone.length < 10) return;

    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await responsavelApi.checkResetEmails(cleanPhone);
      if (!res.emails || res.emails.length === 0) {
        setErrorMessage("Nenhum e-mail cadastrado no momento. Solicite ao motorista da van para resetar sua senha.");
        return;
      }

      setEmailsEncontrados(res.emails);
      if (res.emails.length === 1) {
        setSelectedEmailIndex(res.emails[0].id);
        await handleSendOtp(cleanPhone, res.emails[0].id);
      } else {
        setSelectedEmailIndex(null);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setErrorMessage(errorObj.response?.data?.message || "Erro ao consultar e-mails cadastrados.");
    } finally {
      setLoading(false);
    }
  }, [phoneForm, handleSendOtp]);

  useEffect(() => {
    if (open && initialPhone) {
      phoneForm.setValue("telefone", initialPhone);
    }
  }, [open, initialPhone, phoneForm]);

  const handleValidarOtp = async (values: OtpStepValues) => {
    const cleanPhone = phoneForm.getValues("telefone").replace(/\D/g, "");
    setLoading(true);
    try {
      const res = await responsavelApi.validateResetOtp(cleanPhone, values.codigo);
      setResetToken(res.resetToken);
      setStep(3);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      otpForm.setError("codigo", { message: errorObj.response?.data?.message || "Código inválido ou expirado." });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteReset = async (values: PinStepValues) => {
    if (!resetToken) return;
    setLoading(true);
    try {
      await responsavelApi.executePinReset(resetToken, values.newPin);
      toast.success("Senha redefinida com sucesso! Faça login com a sua nova senha.");
      handleClose();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      pinForm.setError("newPin", { message: errorObj.response?.data?.message || "Erro ao redefinir a senha." });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <Form {...phoneForm}>
            <form id="form-recuperar-pin-step1" onSubmit={phoneForm.handleSubmit(() => handleCheckEmails())} className="space-y-4">
              <div className="space-y-4 py-2">
                <Banner
                  variant="info"
                  icon={
                    emailsEncontrados.length > 1 ? (
                      <Mail className="w-5 h-5 text-[#1a3a5c]" />
                    ) : (
                      <KeyRound className="w-5 h-5 text-[#1a3a5c]" />
                    )
                  }
                  description={
                    emailsEncontrados.length > 1
                      ? "Escolha para qual e-mail cadastrado deseja receber o código de verificação:"
                      : "Aperte em 'Solicitar Código' para receber um código de verificação no seu e-mail."
                  }
                />

                {emailsEncontrados.length > 1 ? (
                  <div className="flex items-center justify-between p-[#0.875rem] rounded-2xl bg-slate-100/70 border border-slate-200/80">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-sm font-bold text-slate-700 truncate">
                        {phoneForm.getValues("telefone")}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailsEncontrados([]);
                        setSelectedEmailIndex(null);
                      }}
                      className="text-xs font-bold text-[#1a3a5c] hover:underline cursor-pointer ml-2 shrink-0"
                    >
                      Trocar
                    </button>
                  </div>
                ) : (
                  <FormField
                    control={phoneForm.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium ml-1">
                          Telefone (WhatsApp)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                            <Input
                              {...field}
                              type="tel"
                              placeholder="(00) 00000-0000"
                              onChange={(e) => field.onChange(phoneMask(e.target.value))}
                              className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all text-base font-semibold text-slate-700"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5 text-xs font-medium text-red-600 animate-in fade-in duration-200">
                    <span className="mt-0.5 shrink-0">⚠️</span>
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                )}

                {emailsEncontrados.length > 1 && (
                  <div className="space-y-2.5 pt-2">
                    <FormLabel className="text-slate-700 font-medium ml-1">
                      Selecione um e-mail:
                    </FormLabel>
                    <div className="space-y-2.5">
                      {emailsEncontrados.map((em) => {
                        const isSelected = selectedEmailIndex === em.id;
                        return (
                          <div
                            key={em.id}
                            onClick={() => setSelectedEmailIndex(em.id)}
                            className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#1a3a5c] bg-blue-50/70 ring-2 ring-[#1a3a5c]/15 shadow-sm"
                                : "border-slate-200/90 bg-white hover:bg-slate-50/80 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center min-w-0 flex-1 mr-2">
                              <div
                                className={`flex items-center justify-center w-9 h-9 rounded-xl mr-3 shrink-0 transition-colors ${
                                  isSelected ? "bg-[#1a3a5c] text-white" : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                <Mail className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-semibold text-slate-700 tracking-tight truncate">
                                {em.mascarado}
                              </span>
                            </div>

                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-[#1a3a5c] shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-slate-300 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </Form>
        );

      case 2:
        return (
          <Form {...otpForm}>
            <form id="form-recuperar-pin-step2" onSubmit={otpForm.handleSubmit(handleValidarOtp)} className="space-y-6">
              <div className="space-y-6 py-2">
                <Banner
                  variant="info"
                  icon={<Mail className="w-5 h-5 text-[#1a3a5c]" />}
                  description={
                    <div className="space-y-1">
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        O código de 6 dígitos foi enviado para o e-mail:
                      </p>
                      <p className="font-sans font-bold text-[#1a3a5c] text-sm tracking-tight break-all mt-0.5">
                        {emailMascarado}
                      </p>
                    </div>
                  }
                />

                <FormField
                  control={otpForm.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormControl>
                        <div className="space-y-4 w-full">
                          <InputOTP
                            maxLength={6}
                            {...field}
                            onChange={(val) => {
                              field.onChange(val);
                              if (val.replace(/\s/g, "").length === 6) {
                                otpForm.handleSubmit(handleValidarOtp)();
                              }
                            }}
                            containerClassName="justify-center flex-1"
                          >
                            <InputOTPGroup className="gap-1.5 sm:gap-3">
                              {Array.from({ length: 6 }).map((_, index) => (
                                <InputOTPSlot
                                  key={index}
                                  index={index}
                                  className="h-12 w-9 sm:h-16 sm:w-14 text-xl font-black rounded-xl border-gray-200 bg-gray-50 text-[#1a3a5c] shadow-xs transition-all focus-within:ring-4 focus-within:ring-[#1a3a5c]/10"
                                />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                          <FormMessage className="text-center" />

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full h-10 text-[10px] font-black uppercase text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl gap-2 tracking-wider cursor-pointer"
                            onClick={() => field.onChange("")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Limpar Código
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        );

      case 3:
        return (
          <Form {...pinForm}>
            <form id="form-recuperar-pin-step3" onSubmit={pinForm.handleSubmit(handleExecuteReset)} className="space-y-4">
              <div className="space-y-4 py-2">
                <Banner
                  variant="info"
                  icon={<ShieldCheck className="w-5 h-5 text-[#1a3a5c]" />}
                  description="Código validado com sucesso! Crie a sua nova senha de 4 dígitos para acessar o app."
                />

                <FormField
                  control={pinForm.control}
                  name="newPin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium ml-1">
                        Nova Senha (4 dígitos)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                          <Input
                            {...field}
                            type={showPin ? "text" : "password"}
                            maxLength={4}
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                            placeholder="••••"
                            className="pl-12 pr-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all text-base font-semibold text-slate-700 tracking-widest"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-0 cursor-pointer"
                            tabIndex={-1}
                            title={showPin ? "Ocultar senha" : "Exibir senha"}
                          >
                            {showPin ? (
                              <EyeOff className="h-5 w-5 opacity-60" />
                            ) : (
                              <Eye className="h-5 w-5 opacity-60" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        );

      default:
        return null;
    }
  };

  const getHeaderProps = () => {
    switch (step) {
      case 1:
        return {
          title: "REDEFINIR SENHA",
          subtitle: "Passo 1: Identificação",
          icon: <Mail className="w-6 h-6" />
        };
      case 2:
        return {
          title: "VALIDAR CÓDIGO",
          subtitle: "Passo 2: Verificação OTP",
          icon: <RefreshCw className="w-6 h-6" />,
          leftAction: (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-10 w-10 rounded-2xl flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-[#1a3a5c] border border-slate-100 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )
        };
      case 3:
        return {
          title: "NOVA SENHA",
          subtitle: "Passo 3: Conclusão",
          icon: <KeyRound className="w-6 h-6" />
        };
    }
  };

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} lockClose={loading}>
      <BaseDialog.Header
        {...getHeaderProps()}
        showSteps
        currentStep={step}
        totalSteps={3}
        onClose={handleClose}
      />

      <BaseDialog.Body animate animationKey={step}>
        {renderContent()}
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <div className="flex w-full gap-3">
          {step === 1 ? (
            <BaseDialog.Action
              label={
                emailsEncontrados.length > 1
                  ? "Solicitar por e-mail"
                  : loading
                  ? "Consultando..."
                  : "Solicitar Código"
              }
              variant="primary"
              form="form-recuperar-pin-step1"
              type="submit"
              isLoading={loading}
              disabled={emailsEncontrados.length > 1 && selectedEmailIndex === null}
              onClick={() => {
                if (emailsEncontrados.length > 1 && selectedEmailIndex !== null) {
                  const cleanPhone = phoneForm.getValues("telefone").replace(/\D/g, "");
                  handleSendOtp(cleanPhone, selectedEmailIndex);
                }
              }}
              className="w-full"
            />
          ) : step === 2 ? (
            <BaseDialog.Action
              label="Validar Código"
              variant="primary"
              form="form-recuperar-pin-step2"
              type="submit"
              isLoading={loading}
              disabled={otpForm.watch("codigo")?.length < 6}
            />
          ) : (
            <BaseDialog.Action
              label="Salvar Nova Senha"
              variant="primary"
              form="form-recuperar-pin-step3"
              type="submit"
              isLoading={loading}
            />
          )}
        </div>
      </BaseDialog.Footer>
    </BaseDialog>
  );
};
