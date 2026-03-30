import { useRecuperacaoSenhaForm } from "@/hooks/form/useRecuperacaoSenhaForm"
import { BaseDialog } from "@/components/ui/BaseDialog"
import {
  KeyRound,
  Mail,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  ArrowRight,
  Fingerprint,
  Trash2,
  User,
  Smartphone
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
import { useEffect } from "react"
import { cpfMask } from "@/utils/masks"

interface RecuperarSenhaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCpf?: string
}

export function RecuperarSenhaDialog({ open, onOpenChange, initialCpf }: RecuperarSenhaDialogProps) {
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
    telefoneMascarado,
  } = useRecuperacaoSenhaForm(() => onOpenChange(false))

  // Pré-preencher CPF caso venha da tela de login
  useEffect(() => {
    if (open && initialCpf && !formStep1.getValues("cpf")) {
      formStep1.setValue("cpf", cpfMask(initialCpf))
    }
  }, [open, initialCpf, formStep1])

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <Form {...formStep1}>
            <form id="form-recuperar-step1" onSubmit={formStep1.handleSubmit(handleSolicitar)} className="space-y-4">
              <div className="space-y-4 py-4">
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex gap-3">
                  <Fingerprint className="w-5 h-5 text-[#1a3a5c] shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Informe seu CPF para iniciarmos o processo de recuperação da sua conta.
                  </p>
                </div>

                <FormField
                  control={formStep1.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium ml-1">
                        Seu CPF
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                          <Input
                            {...field}
                            placeholder="000.000.000-00"
                            onChange={(e) => field.onChange(cpfMask(e.target.value))}
                            className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all text-base"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
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
              <div className="space-y-6 py-4">
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 flex gap-3">
                  <Smartphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      O código foi enviado para o número:
                    </p>
                    <p className="font-headline font-black text-[#1a3a5c] text-sm">
                      {telefoneMascarado || "(**) *****-****"}
                    </p>
                  </div>
                </div>

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
                              // Apenas submete se tiver 6 caracteres reais (sem espaços)
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
                                    className="h-12 w-9 sm:h-16 sm:w-14 text-xl font-headline font-black rounded-xl border-gray-200 bg-gray-50 text-[#1a3a5c] shadow-sm transition-all focus-within:ring-4 focus-within:ring-[#1a3a5c]/10"
                                  />
                                ))}
                              </InputOTPGroup>
                          </InputOTP>
                          <FormMessage className="text-center" />

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full h-10 text-[10px] font-black uppercase text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl gap-2 tracking-wider"
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
              <div className="space-y-4 py-4">
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Tudo certo! Agora crie uma nova senha segura para acessar sua conta.
                  </p>
                </div>

                <FormField
                  control={formStep3.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="CRIAR NOVA SENHA"
                            className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all text-base"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formStep3.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <CheckCircle2 className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="CONFIRME A NOVA SENHA"
                            className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all text-base"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
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
          icon: <Mail className="w-6 h-6" />
        }
      case 2:
        return {
          title: "VALIDAR CÓDIGO",
          subtitle: "Passo 2: Verificação",
          icon: <RefreshCw className="w-6 h-6" />,
          leftAction: (
            <button
              onClick={() => setStep(1)}
              className="h-11 w-11 rounded-2xl flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-[#1a3a5c] border border-slate-100 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )
        }
      case 3:
        return {
          title: "NOVA SENHA",
          subtitle: "Passo 3: Conclusão",
          icon: <KeyRound className="w-6 h-6" />
        }
    }
  }

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} lockClose={loading}>
      <BaseDialog.Header
        {...getHeaderProps()}
        showSteps
        currentStep={step}
        totalSteps={3}
        onClose={() => onOpenChange(false)}
      />

      <BaseDialog.Body animate animationKey={step}>
        {renderContent()}
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <div className="flex w-full gap-3">
          {step === 1 ? (
            <BaseDialog.Action
              label="SOLICITAR CÓDIGO"
              variant="primary"
              form="form-recuperar-step1"
              type="submit"
              isLoading={loading}
              className="w-full"
            />
          ) : step === 2 ? (
            <BaseDialog.Action
              label="VALIDAR CÓDIGO"
              variant="primary"
              form="form-recuperar-step2"
              type="submit"
              isLoading={loading}
              disabled={formStep2.watch("codigo")?.length < 6}
            />
          ) : (
            <BaseDialog.Action
              label="ALTERAR SENHA"
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
