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
  // Using usePermissions for consistency
  const { profile, refreshProfile, isProfissional } = usePermissions();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      chave_pix: "",
    },
  });

  const tipoSelecionado = form.watch("tipo_chave_pix");

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

      toast.success("Chave PIX salva com sucesso!");
      
      updateQuickStartStorage();
      
      // Close immediately for better UX
      if (onSuccess) onSuccess();
      onClose();

      await refreshProfile();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao salvar chave PIX.";
      toast.error("Falha ao salvar", {
         description: errorMessage
      });
    }
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

        {/* Footer fixo */}
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
                 ) : "Salvar Chave"}
              </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
