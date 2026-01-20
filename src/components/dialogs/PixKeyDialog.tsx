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
import { usePermissions } from "@/hooks/business/usePermissions";
import { pixKeySchemaRequired } from "@/schemas/pix";
import { usuarioApi } from "@/services/api/usuario.api";
import { PixKeyStatus } from "@/types/enums";
import { TIPOS_CHAVE_PIX_LABEL, TipoChavePix } from "@/types/pix";
import { cnpjMask, cpfMask as maskCpf, phoneMask as maskPhone } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { cleanString } from "@/utils/string";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Key, Loader2, X } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";


interface PixKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  canClose?: boolean;
}

// O schema já vem com .superRefine do arquivo compartilhado.
const schema = pixKeySchemaRequired;

type FormData = z.infer<typeof schema>;

export default function PixKeyDialog({
  isOpen,
  onClose,
  onSuccess,
  canClose = true
}: PixKeyDialogProps) {
  const { profile, refreshProfile, isProfissional } = usePermissions();
  const [isChecking, setIsChecking] = React.useState(false);
  const [overrideStatus, setOverrideStatus] = React.useState(false);

  // Define form
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      chave_pix: "",
    },
  });

  const tipoSelecionado = form.watch("tipo_chave_pix");

  // Reset form when opening
  useEffect(() => {
    if (isOpen && profile) {
        if (profile.chave_pix && (profile.tipo_chave_pix as any)) {
             let initialValue = profile.chave_pix;
             const type = profile.tipo_chave_pix as TipoChavePix;
             
             // Apply mask to initial value
             if (type === TipoChavePix.CPF) initialValue = maskCpf(initialValue);
             else if (type === TipoChavePix.CNPJ) initialValue = cnpjMask(initialValue);
             else if (type === TipoChavePix.TELEFONE) initialValue = maskPhone(initialValue);

             form.reset({
                 tipo_chave_pix: type,
                 chave_pix: initialValue
             });
        } else {
             form.reset({
                 chave_pix: "",
             });
        }
    }
  }, [isOpen, profile, form]);

  const status = profile?.status_chave_pix;
  const isPending = status === PixKeyStatus.PENDENTE_VALIDACAO;
  const isFailed = status === PixKeyStatus.FALHA_VALIDACAO;
  const isValid = status === PixKeyStatus.VALIDADA;



  useEffect(() => {
    if (!isOpen || !profile?.id || status !== PixKeyStatus.PENDENTE_VALIDACAO) return;

    const interval = setInterval(() => {
        refreshProfile();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isOpen, profile?.id, status, refreshProfile]);

  const handleChaveChange = (e: React.ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
    let value = e.target.value;
    
    if (tipoSelecionado === TipoChavePix.CPF) {
        value = maskCpf(value);
    } else if (tipoSelecionado === TipoChavePix.CNPJ) {
        value = cnpjMask(value);
    } else if (tipoSelecionado === TipoChavePix.TELEFONE) {
        value = maskPhone(value);
    }
    
    fieldChange(value);
  };

  const handleSubmit = async (data: FormData) => {
    if (!profile?.id) return;

    try {
      // Limpar chave PIX
      let chavePixLimpa = data.chave_pix;
      const tipo = data.tipo_chave_pix;

      if (chavePixLimpa && tipo) {
          if ([TipoChavePix.CPF, TipoChavePix.CNPJ, TipoChavePix.TELEFONE].includes(tipo)) {
              chavePixLimpa = chavePixLimpa.replace(/\D/g, "");
          } else {
              chavePixLimpa = cleanString(chavePixLimpa);
          }
      }

      // 1. Save locally/notify server
      await usuarioApi.atualizarUsuario(profile.id, {
        chave_pix: chavePixLimpa,
        tipo_chave_pix: tipo
      });

      // 2. Immediately update local state to "PENDENTE_VALIDACAO" to trigger the validation screen
      await refreshProfile(); 

      toast.success("Chave salva! Iniciando validação...");

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao salvar chave PIX.";
      toast.error("Falha ao salvar", {
         description: errorMessage
      });
    }
  };

  const handleCheckStatus = async () => {
      setIsChecking(true);
      await refreshProfile();
      setIsChecking(false);
      
      if (profile?.status_chave_pix === PixKeyStatus.VALIDADA) {
          toast.success("Chave validada com sucesso!");
          if (onSuccess) onSuccess();
          onClose();
      } else if (profile?.status_chave_pix === PixKeyStatus.FALHA_VALIDACAO) {
          toast.error("A validação falhou. Verifique os dados.");
      } else {
          toast.info("Ainda pendente. Aguarde mais um pouco.");
      }
  };

  // Render Content Logic
  const renderContent = () => {
      if (isPending && !overrideStatus) {
          return (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
                  <div className="relative">
                       <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
                       <div className="bg-blue-50 p-4 rounded-full relative">
                           <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                       </div>
                  </div>
                  <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900">Validando sua chave...</h3>
                      <p className="text-gray-500 max-w-xs mx-auto">
                          Enviamos uma transação de R$ 0,01 para confirmar a titularidade da conta.
                      </p>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 max-w-sm w-full text-sm text-blue-800">
                      <p><strong>Atenção:</strong> A conta bancária deve estar no mesmo CPF/CNPJ cadastrado no sistema ({maskCpf(profile?.cpfcnpj || '')}).</p>
                  </div>
              </div>
          );
      }
      
      if (isFailed && !overrideStatus) {
          return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="bg-red-50 p-4 rounded-full">
                   <X className="w-12 h-12 text-red-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-red-900">Validação Falhou</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">
                      Não conseguimos confirmar a titularidade da conta. O nome registrado no banco não coincide.
                  </p>
                </div>
                 <div className="bg-red-50/50 border border-red-100 rounded-lg p-4 max-w-sm w-full text-sm text-red-800">
                    <p>Verifique se digitou a chave corretamente ou tente outra chave.</p>
                </div>
            </div>
          );
      }

      // NEW: Success State (Explicit feedback instead of auto-close)
      if (isValid && !overrideStatus) {
           return (
               <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
                   <div className="bg-green-50 p-4 rounded-full animate-in zoom-in duration-300">
                       <Check className="w-12 h-12 text-green-600" />
                   </div>
                   <div className="space-y-2">
                       <h3 className="text-xl font-semibold text-green-900">Chave Validada!</h3>
                       <p className="text-gray-500 max-w-xs mx-auto">
                           Sua chave PIX foi confirmada e já está pronta para receber pagamentos.
                       </p>
                   </div>
                   <Button 
                       onClick={onClose}
                       className="w-full max-w-xs h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-500/20"
                   >
                       Concluir
                   </Button>
               </div>
           );
      }

      return (
          <div className="p-6 bg-white flex-1 overflow-y-auto">
           <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="tipo_chave_pix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium ml-1">Tipo de Chave</FormLabel>
                    <Select onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue("chave_pix", ""); // Limpa chave ao trocar tipo
                        form.clearErrors("chave_pix"); // Limpa erros de validação anteriores
                    }} defaultValue={field.value} value={field.value}>
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
                            disabled={!tipoSelecionado}
                            onChange={(e) => handleChaveChange(e, field.onChange)}
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
      );
  };
  
  // Render Footer buttons logic
  const renderFooter = () => {
      if (isPending && !overrideStatus) {
           return (
              <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0 flex gap-3">
                 <Button 
                    className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    onClick={handleCheckStatus}
                    disabled={isChecking}
                 >
                    {isChecking ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : "Verificar Status"}
                 </Button>
              </div>
           );
      }
      
      if (isFailed && !overrideStatus) {
           return (
              <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0 flex gap-3">
                 <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-xl border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => setOverrideStatus(true)}
                 >
                    Corrigir Chave
                 </Button>
              </div>
           );
      }

      // Hide default footer if Success (button is inline)
      if (isValid && !overrideStatus) return null;

      // Default Form Footer
      return (
        <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0 flex gap-3">
             {canClose && (
                 <Button 
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1 h-12 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 font-medium"
                 >
                    Depois
                 </Button>
             )}
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
        </div>
      );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && canClose) onClose();
    }}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-full max-w-md p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-6 text-center relative shrink-0">
          {canClose && (
            <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
            </DialogClose>
          )}
          
          <div className="mx-auto bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm shadow-inner">
            <Key className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Configurar Recebimento
          </DialogTitle>
        </div>

        {renderContent()}
        {renderFooter()}

      </DialogContent>
    </Dialog>
  );
}
