import { useRecuperacaoSenhaForm } from "@/hooks/form/useRecuperacaoSenhaForm"
import { BaseDialog } from "@/components/ui/BaseDialog"
import { Banner } from "@/components/ui/Banner"
import { safeCloseDialog } from "@/hooks"
import {
  KeyRound,
  Mail,
  ArrowLeft,
  RefreshCw,
  Fingerprint,
  Trash2,
  User,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck
} from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { cpfCnpjMask } from "@/utils/masks"

interface RecuperarSenhaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCpf?: string
}

export function RecuperarSenhaDialog({ open, onOpenChange, initialCpf }: RecuperarSenhaDialogProps) {
  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false))
  }

  const {
    step,
    setStep,
    loading,
    formStep1,
    formStep2,
    formStep3,
    handleSolicitar,
    handleValidar,
    handleResetar,
    emailMascarado,
  } = useRecuperacaoSenhaForm(handleClose)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (open && initialCpf && !formStep1.getValues("cpf")) {
      formStep1.setValue("cpf", cpfCnpjMask(initialCpf))
    }
  }, [open, initialCpf, formStep1])

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <Form {...formStep1}>
            <form id="form-recuperar-step1" onSubmit={formStep1.handleSubmit(handleSolicitar)} className="space-y-4">
              <div className="space-y-4 py-2">
                <Banner
                  variant="info"
                  icon={<Fingerprint className="w-5 h-5 text-[#2563eb]" />}
                  description="Informe seu CPF ou CNPJ para iniciarmos o processo de recuperação da sua conta."
                />

                <FormField
                  control={formStep1.control}
                  name="cpf"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                        Seu CPF ou CNPJ
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                          <Input
                            {...field}
                            inputMode="numeric"
                            placeholder="CPF ou CNPJ"
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
              </div>
            </form>
          </Form>
        )

      case 2:
        return (
          <Form {...formStep2}>
            <form id="form-recuperar-step2" onSubmit={formStep2.handleSubmit(handleValidar)} className="space-y-6">
              <div className="space-y-6 py-2">
                <Banner
                  variant="info"
                  icon={<Mail className="w-5 h-5 text-[#2563eb]" />}
                  description={
                    <div className="space-y-1">
                      <p className="text-xs text-[#737373] leading-relaxed font-medium">
                        O código foi enviado para o e-mail:
                      </p>
                      <p className="font-bold text-[#0a0a0a] text-sm break-all">
                        {emailMascarado}
                      </p>
                    </div>
                  }
                />

                <div className="sr-only">
                  <DialogTitle>Validar código</DialogTitle>
                  <DialogDescription>
                    Insira o código de 6 dígitos enviado para o seu dispositivo.
                  </DialogDescription>
                </div>

                <FormField
                  control={formStep2.control}
                  name="codigo"
                  render={({ field: { ref, ...field } }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormControl>
                        <div className="space-y-4 w-full">
                          <InputOTP
                            maxLength={6}
                            {...field}
                            onChange={(val) => {
                              field.onChange(val);
                              const realValue = val.replace(/\s/g, "");
                              if (realValue.length === 6) {
                                formStep2.handleSubmit(handleValidar)()
                              }
                            }}
                            containerClassName="justify-center flex-1"
                          >
                            <InputOTPGroup className="gap-1.5 sm:gap-3">
                              {Array.from({ length: 6 }).map((_, index) => (
                                <InputOTPSlot
                                  key={index}
                                  index={index}
                                  className="h-12 w-9 sm:h-16 sm:w-14 text-xl font-bold rounded-[18px] border-[#e5e5e5] bg-[#f5f5f5] text-[#0a0a0a] shadow-2xs transition-all focus-within:ring-2 focus-within:ring-[#2563eb]/15 focus-within:border-[#2563eb]"
                                />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                          <FormMessage className="text-center" />

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full h-10 text-xs font-semibold text-[#737373] hover:text-[#e7000b] hover:bg-[#e7000b]/10 rounded-[18px] gap-2 tracking-wide cursor-pointer"
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
        )

      case 3:
        return (
          <Form {...formStep3}>
            <form id="form-recuperar-step3" onSubmit={formStep3.handleSubmit(handleResetar)} className="space-y-4">
              <div className="space-y-4 py-2">
                <Banner
                  variant="info"
                  icon={<ShieldCheck className="w-5 h-5 text-[#2563eb]" />}
                  description="Código validado com sucesso! Agora crie uma nova senha segura para acessar sua conta."
                />

                <FormField
                  control={formStep3.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                        Sua Nova Senha
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`pl-10 pr-10 h-11 rounded-[18px] bg-[#f5f5f5] border transition-all text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus-visible:ring-0 focus:bg-white ${
                              fieldState.error
                                ? "border-[#e7000b] focus:border-[#e7000b]"
                                : "border-[#e5e5e5] focus:border-[#2563eb]"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] focus:outline-none transition-colors p-1 cursor-pointer"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs ml-1 text-[#e7000b]" />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        )

      default:
        return null
    }
  }

  const getHeaderProps = () => {
    switch (step) {
      case 1:
        return {
          title: "RECUPERAR SENHA",
          subtitle: "Passo 1: Identificação",
          icon: <Mail className="w-6 h-6 text-[#2563eb]" />
        }
      case 2:
        return {
          title: "VALIDAR CÓDIGO",
          subtitle: "Passo 2: Verificação",
          icon: <RefreshCw className="w-6 h-6 text-[#2563eb]" />,
          leftAction: (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-10 w-10 rounded-[18px] flex items-center justify-center bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] shadow-2xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )
        }
      case 3:
        return {
          title: "NOVA SENHA",
          subtitle: "Passo 3: Conclusão",
          icon: <KeyRound className="w-6 h-6 text-[#2563eb]" />
        }
    }
  }

  return (
    <BaseDialog open={open} onOpenChange={handleClose} lockClose={loading}>
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
              label="Solicitar Código"
              variant="primary"
              form="form-recuperar-step1"
              type="submit"
              isLoading={loading}
              className="w-full"
            />
          ) : step === 2 ? (
            <BaseDialog.Action
              label="Validar"
              variant="primary"
              form="form-recuperar-step2"
              type="submit"
              isLoading={loading}
              disabled={formStep2.watch("codigo")?.length < 6}
            />
          ) : (
            <BaseDialog.Action
              label="Confirmar"
              variant="primary"
              form="form-recuperar-step3"
              type="submit"
              isLoading={loading}
            />
          )}
        </div>
      </BaseDialog.Footer>
    </BaseDialog>
  )
}
