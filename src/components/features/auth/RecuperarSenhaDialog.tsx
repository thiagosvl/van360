import { forwardRef, useState, useEffect } from "react";
import { useRecuperacaoSenhaForm } from "@/hooks/form/useRecuperacaoSenhaForm";
import { getMessage } from "@/constants/messages";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Smartphone, User, ChevronLeft, MessageSquare, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { cpfMask } from "@/utils/masks";

interface RecuperarSenhaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCpf?: string;
}

const variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const CustomInput = forwardRef<HTMLInputElement, any>(
  ({ icon: Icon, label, className, ...props }, ref) => {
    return (
      <div className="group relative flex items-center w-full h-14 rounded-xl border border-gray-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">
        <div className="mr-3 text-gray-400 group-focus-within:text-blue-500 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col w-full h-full justify-center">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">
            {label}
          </label>
          <Input
            ref={ref}
            {...props}
            className={`h-auto p-0 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-300 text-sm font-medium text-gray-900 ${className}`}
          />
        </div>
      </div>
    );
  }
);
CustomInput.displayName = "CustomInput";

export function RecuperarSenhaDialog({ open, onOpenChange, initialCpf }: RecuperarSenhaDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
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
    handleVoltarStep1,
    telefoneMascarado,
    reset
  } = useRecuperacaoSenhaForm(() => onOpenChange(false), initialCpf);

  useEffect(() => {
    if (!open) {
      reset();
      setShowPassword(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[92vw] sm:max-w-[400px] p-0 overflow-hidden border-none bg-white rounded-[2.5rem] shadow-soft-2xl animate-in zoom-in-95 duration-300 pointer-events-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="relative p-5 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center text-center space-y-3 px-2">
                  <div className="w-16 h-16 rounded-2xl bg-[#1a3a5c]/5 flex items-center justify-center text-[#1a3a5c] mb-2">
                    <User className="w-8 h-8 opacity-80" />
                  </div>
                  <h2 className="text-2xl font-headline font-black text-[#1a3a5c] tracking-tight uppercase">
                    {getMessage("auth.recuperacao.titulo")}
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {getMessage("auth.recuperacao.descricao")}
                  </p>
                </div>

                <Form {...formStep1}>
                  <form onSubmit={formStep1.handleSubmit(handleSolicitar)} className="space-y-4">
                    <FormField
                      control={formStep1.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <CustomInput
                              {...field}
                              icon={User}
                              label="CPF"
                              placeholder="000.000.000-00"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(cpfMask(e.target.value))}
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full h-14 rounded-2xl font-headline font-black text-[11px] shadow-lg transition-all active:scale-95 uppercase tracking-wider bg-[#1a3a5c] hover:bg-[#1a3a5c]/95 text-white shadow-[#1a3a5c]/20"
                        disabled={loading}
                      >
                        {loading ? getMessage("comum.aguarde.aguarde").toUpperCase() : getMessage("auth.recuperacao.botaoSolicitar").toUpperCase()}
                      </Button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center text-center space-y-3 px-2">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-headline font-black text-[#1a3a5c] tracking-tight uppercase leading-tight">
                    {getMessage("auth.recuperacao.validacaoTitulo")}
                  </h2>
                  <div className="text-sm text-slate-500 leading-relaxed font-medium">
                    <p>Enviamos um código para o WhatsApp</p>
                    <span className="block font-bold text-[#1a3a5c] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                      {telefoneMascarado}
                    </span>
                    <p className="mt-4 text-[13px]">Insira o código recebido:</p>
                  </div>
                </div>

                <Form {...formStep2}>
                  <form onSubmit={formStep2.handleSubmit(handleValidar)} className="space-y-6">
                    <FormField
                      control={formStep2.control}
                      name="codigo"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-center w-full overflow-hidden">
                          <FormControl>
                            <InputOTP
                              maxLength={6}
                              value={field.value}
                              onChange={field.onChange}
                              onComplete={() => formStep2.handleSubmit(handleValidar)()}
                              disabled={loading}
                              className="flex justify-center"
                            >
                              <InputOTPGroup className="gap-1">
                                <InputOTPSlot index={0} className="w-8 sm:w-11 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-gray-200 bg-white text-base sm:text-lg font-black text-[#1a3a5c] shadow-sm" />
                                <InputOTPSlot index={1} className="w-8 sm:w-11 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-gray-200 bg-white text-base sm:text-lg font-black text-[#1a3a5c] shadow-sm" />
                                <InputOTPSlot index={2} className="w-8 sm:w-11 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-gray-200 bg-white text-base sm:text-lg font-black text-[#1a3a5c] shadow-sm" />
                              </InputOTPGroup>
                              <InputOTPSeparator className="text-slate-200 mx-0.5 opacity-50" />
                              <InputOTPGroup className="gap-1">
                                <InputOTPSlot index={3} className="w-8 sm:w-11 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-gray-200 bg-white text-base sm:text-lg font-black text-[#1a3a5c] shadow-sm" />
                                <InputOTPSlot index={4} className="w-8 sm:w-11 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-gray-200 bg-white text-base sm:text-lg font-black text-[#1a3a5c] shadow-sm" />
                                <InputOTPSlot index={5} className="w-8 sm:w-11 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-gray-200 bg-white text-base sm:text-lg font-black text-[#1a3a5c] shadow-sm" />
                              </InputOTPGroup>
                            </InputOTP>
                          </FormControl>
                          <FormMessage className="text-[11px] font-bold text-red-500 mt-2 text-center animate-in fade-in slide-in-from-top-1 px-4 py-1 bg-red-50 rounded-lg w-full max-w-[280px]" />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3 pt-4">
                      <Button
                        type="submit"
                        className="w-full h-14 rounded-2xl font-headline font-black text-[11px] shadow-lg transition-all active:scale-95 uppercase tracking-wider bg-[#1a3a5c] hover:bg-[#1a3a5c]/95 text-white shadow-[#1a3a5c]/20"
                        disabled={loading || formStep2.watch("codigo").length < 6}
                      >
                        {loading ? getMessage("comum.aguarde.aguarde").toUpperCase() : getMessage("auth.recuperacao.botaoValidar").toUpperCase()}
                      </Button>

                      <button
                        type="button"
                        onClick={handleVoltarStep1}
                        className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1a3a5c]/40 hover:text-[#1a3a5c] transition-colors py-2"
                        disabled={loading}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        {getMessage("auth.recuperacao.alterarCpf")}
                      </button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center text-center space-y-3 px-2">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-headline font-black text-[#1a3a5c] tracking-tight uppercase">
                    {getMessage("auth.recuperacao.novaSenhaTitulo")}
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {getMessage("auth.recuperacao.novaSenhaDescricao")}
                  </p>
                </div>

                <Form {...formStep3}>
                  <form onSubmit={formStep3.handleSubmit(handleResetar)} className="space-y-4">
                    <FormField
                      control={formStep3.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <CustomInput
                                {...field}
                                type={showPassword ? "text" : "password"}
                                icon={Lock}
                                label="Nova Senha"
                                placeholder="••••••••"
                                disabled={loading}
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a3a5c] transition-colors p-1"
                                disabled={loading}
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full h-14 rounded-2xl font-headline font-black text-[11px] shadow-lg transition-all active:scale-95 uppercase tracking-wider bg-[#1a3a5c] hover:bg-[#1a3a5c]/95 text-white shadow-[#1a3a5c]/20"
                        disabled={loading}
                      >
                        {loading ? getMessage("comum.aguarde.aguarde").toUpperCase() : "Redefinir Senha"}
                      </Button></div>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
