import { useState, useEffect, useRef } from "react";
import BaseDialog from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TipoChavePix, TIPOS_CHAVE_PIX_LABEL } from "@/types/pix";
import { Veiculo } from "@/types/veiculo";
import { pixKeySchema } from "@/schemas/pix";
import { cpfMask, cnpjMask, phoneMask, evpMask } from "@/utils/masks";
import { formatarPlacaExibicao } from "@/utils/domain";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useUpdatePixVeiculo } from "@/hooks/api/useVeiculoMutations";
import { useMotoristaFinanceiroApi } from "@/hooks/api/useMotoristaFinanceiroApi";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { Key, Trash2 } from "lucide-react";
import { z } from "zod";

interface EditarPixVeiculoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  veiculo: Veiculo | null;
  onSuccess?: () => void;
}

type PixFormData = z.infer<typeof pixKeySchema>;

export default function EditarPixVeiculoDialog({
  isOpen,
  onClose,
  veiculo,
  onSuccess,
}: EditarPixVeiculoDialogProps) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { financeiro } = useMotoristaFinanceiroApi();
  const updatePixMutation = useUpdatePixVeiculo();

  const [isRemoving, setIsRemoving] = useState(false);
  const originalTipoRef = useRef<TipoChavePix | null>(null);
  const originalChaveRef = useRef<string>("");

  const form = useForm<PixFormData>({
    resolver: zodResolver(pixKeySchema),
    defaultValues: {
      tipo_chave_pix: undefined,
      chave_pix: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const temChavePropria = Boolean(veiculo?.chave_pix && veiculo?.tipo_chave_pix);

  useEffect(() => {
    if (isOpen && veiculo) {
      const tipo = (veiculo.tipo_chave_pix as TipoChavePix) || undefined;
      let chave = veiculo.chave_pix || "";

      originalTipoRef.current = tipo || null;
      originalChaveRef.current = chave;

      if (tipo === TipoChavePix.CPF) chave = cpfMask(chave);
      else if (tipo === TipoChavePix.CNPJ) chave = cnpjMask(chave);
      else if (tipo === TipoChavePix.TELEFONE) chave = phoneMask(chave);
      else if (tipo === TipoChavePix.ALEATORIA) chave = evpMask(chave);

      form.reset({
        tipo_chave_pix: tipo,
        chave_pix: chave,
      });
    }
  }, [isOpen, veiculo, form]);

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const chavePadraoFormatada = (() => {
    if (!financeiro?.chave_pix_repasse || !financeiro?.tipo_chave_pix) return null;
    const tipo = financeiro.tipo_chave_pix as TipoChavePix;
    let chave = financeiro.chave_pix_repasse;
    if (tipo === TipoChavePix.CPF) chave = cpfMask(chave);
    else if (tipo === TipoChavePix.CNPJ) chave = cnpjMask(chave);
    else if (tipo === TipoChavePix.TELEFONE) chave = phoneMask(chave);
    else if (tipo === TipoChavePix.ALEATORIA) chave = evpMask(chave);
    return `${chave} (${TIPOS_CHAVE_PIX_LABEL[tipo] || tipo})`;
  })();

  const handleSubmit = async (data: PixFormData) => {
    if (!veiculo?.id) return;

    const chaveLimpa = data.chave_pix?.trim() || null;
    const tipoLimpo = data.tipo_chave_pix || null;

    if (!chaveLimpa) {
      await handleRemoverChavePropria();
      return;
    }

    await updatePixMutation.mutateAsync({
      id: veiculo.id,
      data: {
        chave_pix: chaveLimpa,
        tipo_chave_pix: tipoLimpo,
      },
    });

    if (onSuccess) onSuccess();
    handleClose();
  };

  const handleRemoverChavePropria = async () => {
    if (!veiculo?.id) return;
    setIsRemoving(true);
    try {
      await updatePixMutation.mutateAsync({
        id: veiculo.id,
        data: {
          chave_pix: null,
          tipo_chave_pix: null,
        },
      });
      if (onSuccess) onSuccess();
      handleClose();
    } finally {
      setIsRemoving(false);
    }
  };

  if (!veiculo) return null;

  const isSaving = updatePixMutation.isPending || isRemoving;

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} maxWidth="md">
      <BaseDialog.Header
        title={`Chave Pix — ${formatarPlacaExibicao(veiculo.placa)}`}
        subtitle={`${veiculo.marca} ${veiculo.modelo}`}
        icon={<Key className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="space-y-4">
          {temChavePropria ? (
            <Banner
              variant="info"
              description="Este veículo possui uma chave Pix própria configurada. As cobranças dos alunos vinculados a ele utilizarão esta chave."
            />
          ) : (
            <Banner
              variant="info"
              description={
                chavePadraoFormatada
                  ? `Se não configurar uma chave própria para este veículo, as cobranças usarão a chave padrão da conta: ${chavePadraoFormatada}.`
                  : "Configure uma chave Pix para receber os pagamentos dos alunos vinculados a este veículo."
              }
            />
          )}

          <Form {...form}>
            <form id="editar-pix-veiculo-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="tipo_chave_pix"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold text-[#0a0a0a]">Tipo de Chave</FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value || ""}
                        className="h-11 rounded-[18px] bg-[#f5f5f5] border-transparent focus:border-[#e5e5e5] focus:bg-white text-sm text-[#0a0a0a]"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            field.onChange(undefined);
                            form.setValue("chave_pix", "");
                            return;
                          }

                          const selecionado = val as TipoChavePix;
                          field.onChange(selecionado);

                          if (selecionado === originalTipoRef.current) {
                            let chaveOriginal = originalChaveRef.current;
                            if (selecionado === TipoChavePix.CPF) chaveOriginal = cpfMask(chaveOriginal);
                            else if (selecionado === TipoChavePix.CNPJ) chaveOriginal = cnpjMask(chaveOriginal);
                            else if (selecionado === TipoChavePix.TELEFONE) chaveOriginal = phoneMask(chaveOriginal);
                            else if (selecionado === TipoChavePix.ALEATORIA) chaveOriginal = evpMask(chaveOriginal);
                            form.setValue("chave_pix", chaveOriginal);
                          } else {
                            let preenchimento = "";
                            if (profile) {
                              const cpfLimpo = profile.cpfcnpj ? profile.cpfcnpj.replace(/\D/g, "") : "";
                              if (selecionado === TipoChavePix.CPF && cpfLimpo.length === 11) {
                                preenchimento = cpfMask(profile.cpfcnpj);
                              } else if (selecionado === TipoChavePix.CNPJ && cpfLimpo.length === 14) {
                                preenchimento = cnpjMask(profile.cpfcnpj);
                              } else if (selecionado === TipoChavePix.TELEFONE && profile.telefone) {
                                preenchimento = phoneMask(profile.telefone);
                              } else if (selecionado === TipoChavePix.EMAIL && (profile.email || user?.email)) {
                                preenchimento = profile.email || user?.email || "";
                              }
                            }
                            form.setValue("chave_pix", preenchimento);
                          }
                        }}
                      >
                        <option value="" disabled>Selecionar...</option>
                        {Object.values(TipoChavePix).map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {TIPOS_CHAVE_PIX_LABEL[tipo]}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chave_pix"
                render={({ field }) => {
                  const tipo = form.watch("tipo_chave_pix");
                  return (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-[#0a0a0a]">Chave Pix</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={tipo ? "Digite a chave Pix deste veículo" : "Selecione o tipo de chave primeiro"}
                          disabled={!tipo || isSaving}
                          type={tipo === TipoChavePix.TELEFONE ? "tel" : "text"}
                          inputMode={
                            tipo === TipoChavePix.CPF ||
                            tipo === TipoChavePix.CNPJ ||
                            tipo === TipoChavePix.TELEFONE
                              ? "numeric"
                              : "text"
                          }
                          value={field.value || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            let maskedVal = val;
                            if (tipo === TipoChavePix.CPF) {
                              maskedVal = cpfMask(val);
                            } else if (tipo === TipoChavePix.CNPJ) {
                              maskedVal = cnpjMask(val);
                            } else if (tipo === TipoChavePix.TELEFONE) {
                              maskedVal = phoneMask(val);
                            } else if (tipo === TipoChavePix.ALEATORIA) {
                              maskedVal = evpMask(val);
                            }
                            field.onChange(maskedVal);
                          }}
                          className="h-11 rounded-[18px] bg-[#f5f5f5] border-transparent focus:border-[#e5e5e5] focus:bg-white text-sm text-[#0a0a0a] placeholder:text-[#737373]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </form>
          </Form>
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        {temChavePropria ? (
          <BaseDialog.Action
            label="Usar padrão da conta"
            variant="outline"
            icon={<Trash2 className="w-4 h-4 text-red-600" />}
            onClick={handleRemoverChavePropria}
            disabled={isSaving}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          />
        ) : (
          <BaseDialog.Action
            label="Cancelar"
            variant="secondary"
            onClick={handleClose}
            disabled={isSaving}
          />
        )}
        <BaseDialog.Action
          label={temChavePropria ? "Salvar Alterações" : "Salvar Chave Pix"}
          type="submit"
          form="editar-pix-veiculo-form"
          isLoading={isSaving}
          variant="primary"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
