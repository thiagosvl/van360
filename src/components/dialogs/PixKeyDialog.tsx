import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
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
import { useSession } from "@/hooks/business/useSession";
import { pixKeySchemaRequired } from "@/schemas/pix";
import { usuarioApi } from "@/services/api/usuario.api";
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
  const { user } = useSession();
  const { profile, refreshProfile, isProfissional } = usePermissions();
  const [isChecking, setIsChecking] = React.useState(false);

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
             form.reset({
                 tipo_chave_pix: profile.tipo_chave_pix as TipoChavePix,
                 chave_pix: profile.chave_pix
             });
        }
    }
  }, [isOpen, profile, form]);

  const status = profile?.status_chave_pix;
  const isPending = status === 'PENDENTE_VALIDACAO';
  const isFailed = status === 'FALHA_VALIDACAO';
  const isValid = status === 'VALIDADA'; // Should usually close if validated, but logic here helps

  // Effect: if becomes valid, close
  useEffect(() => {
     if (isOpen && isValid && !canClose) {
         // Auto close if it was forced open but now is valid
         onClose();
     }
  }, [isValid, isOpen, canClose, onClose]);


  const handleChaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (tipoSelecionado === TipoChavePix.CPF) {
        value = maskCpf(value);
    } else if (tipoSelecionado === TipoChavePix.CNPJ) {
        value = cnpjMask(value);
    } else if (tipoSelecionado === TipoChavePix.TELEFONE) {
        value = maskPhone(value);
    }
    
    form.setValue("chave_pix", value);
  };

  const updateQuickStartStorage = () => {
      try {
          const currentStorage = localStorage.getItem("van360:quickstart_status");
          let storageObj = currentStorage ? JSON.parse(currentStorage) : {};
          
          storageObj = {
              ...storageObj,
              step_pix: true
          };
          
          localStorage.setItem("van360:quickstart_status", JSON.stringify(storageObj));
      } catch (e) {
          console.error("Falha ao atualizar storage quickstart", e);
      }
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

      await usuarioApi.atualizarUsuario(profile.id, {
        chave_pix: chavePixLimpa,
        tipo_chave_pix: tipo
      });

      toast.success("Chave enviada para validação!");
      
      updateQuickStartStorage();
      await refreshProfile();
      
      // We do NOT close immediately if we are in blocking mode, we switch to pending view implicitly
      if (canClose && onSuccess) {
          onSuccess();
          onClose();
      }
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
      
      if (profile?.status_chave_pix === 'VALIDADA') {
          toast.success("Chave validada com sucesso!");
          if (onSuccess) onSuccess();
          onClose();
      } else if (profile?.status_chave_pix === 'FALHA_VALIDACAO') {
          toast.error("A validação falhou. Verifique os dados.");
      } else {
          toast.info("Ainda pendente. Aguarde mais um pouco.");
      }
  };

  const handleRetry = async () => {
      // Logic to allow retry: Basically we just want to show the form again.
      // But status is in profile. We need to clear the status locally? 
      // Or just render the form despite the status if user clicks "Corrigir".
      // Let's implement a local override state.
      setOverrideStatus(true);
  };
  
  const [overrideStatus, setOverrideStatus] = React.useState(false);

  // If we are in a pending/failed state but user wants to fix:
  const showForm = !status || (status !== 'PENDENTE_VALIDACAO' && status !== 'FALHA_VALIDACAO') || overrideStatus;
  
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
                            onChange={handleChaveChange}
                            maxLength={tipoSelecionado === TipoChavePix.CPF ? 14 : tipoSelecionado === TipoChavePix.CNPJ ? 18 : 100}
                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all pl-4"
                        />
                        {tipoSelecionado && field.value && !form.formState.errors.chave_pix && (
                            <div className="absolute right-3 top-3.5 text-green-500 animate-in fade-in zoom-in">
                                <Check className="w-5 h-5" />
                            </div>
                        )}
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
          <DialogDescription className="text-blue-100/90 text-sm mt-1 max-w-[280px] mx-auto leading-relaxed">
             Para receber pagamentos automáticos, precisamos da sua chave PIX.
          </DialogDescription>
        </div>

        {renderContent()}
        {renderFooter()}

      </DialogContent>
    </Dialog>
  );
}
