import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog";
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
import { getMessage } from "@/constants/messages";
import { usePermissions } from "@/hooks/business/usePermissions";
import { pixKeySchemaRequired } from "@/schemas/pix";
import { usuarioApi } from "@/services/api/usuario.api";
import { PixKeyStatus } from "@/types/enums";
import { TIPOS_CHAVE_PIX_LABEL, TipoChavePix } from "@/types/pix";
import { cnpjMask, evpMask, cpfMask as maskCpf, phoneMask as maskPhone } from "@/utils/masks";


import { toast } from "@/utils/notifications/toast";
import { cleanString } from "@/utils/string";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Key, Lightbulb, Loader2, X } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface PixKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  canClose?: boolean;
}

const schema = pixKeySchemaRequired;
type FormData = z.infer<typeof schema>;

export default function PixKeyDialog({
  isOpen,
  onClose,
  onSuccess,
  canClose = true
}: PixKeyDialogProps) {
  const { profile, refreshProfile } = usePermissions();
  const [overrideStatus, setOverrideStatus] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      chave_pix: "",
    },
  });

  const tipoSelecionado = form.watch("tipo_chave_pix");

  // Reset logic
  useEffect(() => {
    if (isOpen && profile) {
        if (profile.chave_pix && profile.tipo_chave_pix) {
             const type = profile.tipo_chave_pix as TipoChavePix;
             let initialValue = profile.chave_pix;
             
             if (type === TipoChavePix.CPF) initialValue = maskCpf(initialValue);
             else if (type === TipoChavePix.CNPJ) initialValue = cnpjMask(initialValue);
             else if (type === TipoChavePix.TELEFONE) initialValue = maskPhone(initialValue);
             else if (type === TipoChavePix.ALEATORIA) initialValue = evpMask(initialValue);

             form.reset({
                 tipo_chave_pix: type,
                 chave_pix: initialValue
             });
        } else {
             form.reset({ chave_pix: "" });
        }
    }
  }, [isOpen, profile, form]);

  const status = profile?.status_chave_pix;
  const isPending = status === PixKeyStatus.PENDENTE_VALIDACAO;
  const isFailed = status === PixKeyStatus.FALHA_VALIDACAO;
  const isValid = status === PixKeyStatus.VALIDADA;

  // Polling logic
  useEffect(() => {
    if (!isOpen || !profile?.id || status !== PixKeyStatus.PENDENTE_VALIDACAO) return;
    const interval = setInterval(() => refreshProfile(), 5000);
    return () => clearInterval(interval);
  }, [isOpen, profile?.id, status, refreshProfile]);

  // Track previous status to detect transitions
  const prevStatusRef = React.useRef(status);

  // Auto-close on validation success
  useEffect(() => {
    const wasValid = prevStatusRef.current === PixKeyStatus.VALIDADA;
    const isNowValid = status === PixKeyStatus.VALIDADA;

    if (isNowValid && !wasValid && isOpen) {
       toast.success(getMessage("pix.sucesso.validada"));
       const timer = setTimeout(() => {
           if (onSuccess) onSuccess();
           onClose();
       }, 1000);
       return () => clearTimeout(timer);
    }
    
    prevStatusRef.current = status;
  }, [status, overrideStatus, isOpen, onClose, onSuccess]);

  const handleChaveChange = (e: React.ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
    let value = e.target.value;
    if (tipoSelecionado === TipoChavePix.CPF) value = maskCpf(value);
    else if (tipoSelecionado === TipoChavePix.CNPJ) value = cnpjMask(value);
    else if (tipoSelecionado === TipoChavePix.TELEFONE) value = maskPhone(value);
    else if (tipoSelecionado === TipoChavePix.ALEATORIA) value = evpMask(value);
    fieldChange(value);
  };

  const handleSubmit = async (data: FormData) => {
    if (!profile?.id) return;
    try {
      let chavePixLimpa = data.chave_pix;
      const tipo = data.tipo_chave_pix;

      if ([TipoChavePix.CPF, TipoChavePix.CNPJ, TipoChavePix.TELEFONE, TipoChavePix.ALEATORIA].includes(tipo)) {
          chavePixLimpa = chavePixLimpa.replace(/[^a-zA-Z0-9]/g, "");
      } else {
          chavePixLimpa = cleanString(chavePixLimpa);
      }

      // Check for redundant submission
      if (
          profile.chave_pix === chavePixLimpa && 
          profile.tipo_chave_pix === tipo && 
          profile.status_chave_pix === PixKeyStatus.VALIDADA
      ) {
          toast.success(getMessage("pix.info.jaValidada"));
           if (onSuccess) onSuccess();
           onClose();
           return;
      }

      await usuarioApi.atualizarUsuario(profile.id, {
        chave_pix: chavePixLimpa,
        tipo_chave_pix: tipo
      });

      await refreshProfile(); 
      setOverrideStatus(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : getMessage("pix.erro.erroAoSalvar");
      toast.error(getMessage("pix.erro.falhaSalvar"), { description: errorMessage });
    }
  };

  const renderStatusBanner = () => {
    if (isPending && !overrideStatus) {
      return (
        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-center animate-pulse">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-blue-900">Validando Chave...</h4>
            <p className="text-xs text-blue-700">Enviando micro-transação de R$ 0,01.</p>
          </div>
        </div>
      );
    }
    if (isFailed && !overrideStatus) {
      return (
        <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 items-start">
          <X className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-red-900">Validação Falhou</h4>
            <p className="text-sm text-red-800 leading-relaxed">
              O banco rejeitou a chave. Verifique se o CPF/CNPJ da conta bancária é o mesmo do seu cadastro.
            </p>
            <Button 
              variant="link" 
              className="p-0 h-auto text-red-700 font-semibold text-xs"
              onClick={() => setOverrideStatus(true)}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      );
    }
    if (isValid && !overrideStatus) {
      return (
        <div className="mb-6 bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3 items-center">
          <div className="bg-green-100 p-1.5 rounded-full shrink-0">
             <Check className="w-4 h-4 text-green-600" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-green-900">Chave Validada</h4>
            <p className="text-xs text-green-700">Sua conta está pronta para receber.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="mb-6 bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
        <div className="bg-blue-100 p-2 rounded-lg shrink-0">
          <Lightbulb className="w-5 h-5 text-blue-600" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-blue-900">Por que cadastrar a chave PIX?</h4>
          <p className="text-sm text-blue-800 leading-relaxed">
            Ela é necessária para que você receba os pagamentos das mensalidades diretamente na sua conta com total segurança.
          </p>
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    const userCanDismiss = canClose || isValid;
    const showPendingAction = isPending && !overrideStatus;
    const showFailedAction = isFailed && !overrideStatus;
    const showSuccessAction = isValid && !overrideStatus; // usually hidden as per logic, unless user lingers

    if (showSuccessAction) return null; // Success usually implies auto-close or no footer needed

    return (
      <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0 flex gap-3">

        {showPendingAction && (
          <Button 
            className="flex-1 h-12 rounded-xl bg-blue-100 text-blue-600 font-bold cursor-default hover:bg-blue-100"
            disabled
          >
            <Loader2 className="w-5 h-5 animate-spin mr-2"/> Aguardando Validação
          </Button>
        )}

        {showFailedAction && (
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl border-red-200 text-red-700 hover:bg-red-50"
            onClick={() => setOverrideStatus(true)}
          >
            Corrigir Chave
          </Button>
        )}

        {(!showPendingAction && !showFailedAction) && (
           <Button 
             type="submit" 
             onClick={form.handleSubmit(handleSubmit)}
             className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-95"
             disabled={form.formState.isSubmitting}
           >
             {form.formState.isSubmitting ? (
               <Loader2 className="w-5 h-5 animate-spin mr-2" />
             ) : "Salvar e Validar"}
           </Button>
        )}
      </div>
    );
  };

  const userCanDismiss = canClose || isValid;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && userCanDismiss) onClose();
    }}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-full max-w-md p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-6 text-center relative shrink-0">
          {userCanDismiss && (
            <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
            </DialogClose>
          )}
          
          <div className="mx-auto bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm shadow-inner">
            <Key className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Configurar Chave PIX
          </DialogTitle>
        </div>

        <div className="p-6 bg-white flex-1 overflow-y-auto">
           {renderStatusBanner()}
           
           <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="tipo_chave_pix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium ml-1">Tipo de Chave</FormLabel>
                    <Select 
                        disabled={isPending && !overrideStatus} 
                        onValueChange={(val) => {
                            field.onChange(val);
                            
                            // Lógica de preenchimento automático
                            if (!profile?.chave_pix) {
                                // Cadastro novo -> preenche com dados do perfil se disponíveis
                                let autoValue = "";
                                if (val === TipoChavePix.CPF) autoValue = maskCpf(profile?.cpfcnpj || "");
                                else if (val === TipoChavePix.TELEFONE) autoValue = maskPhone(profile?.telefone || "");
                                else if (val === TipoChavePix.EMAIL) autoValue = profile?.email || "";
                                
                                form.setValue("chave_pix", autoValue);
                            } else {
                                // Edição -> limpa o campo para o usuário digitar
                                form.setValue("chave_pix", "");
                            }
                            
                            form.clearErrors("chave_pix");
                            setOverrideStatus(true); // Editando
                        }} 
                        defaultValue={field.value} 
                        value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:ring-blue-500/20 focus:border-blue-500">
                          <SelectValue placeholder="Selecione o tipo..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(TIPOS_CHAVE_PIX_LABEL).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chave_pix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium ml-1">Chave PIX</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                            placeholder={tipoSelecionado ? "Digite a chave" : "Selecione o tipo primeiro"}
                            {...field}
                            disabled={!tipoSelecionado || (isPending && !overrideStatus)}
                            onChange={(e) => {
                                handleChaveChange(e, field.onChange);
                                setOverrideStatus(true); // Editando
                            }}
                            maxLength={tipoSelecionado === TipoChavePix.CPF ? 14 : tipoSelecionado === TipoChavePix.CNPJ ? 18 : 100}
                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all pl-4"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
           </Form>
        </div>

        {renderFooter()}

      </DialogContent>
    </Dialog>
  );
}
