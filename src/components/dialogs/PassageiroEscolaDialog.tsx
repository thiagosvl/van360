import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { PassageiroPeriodo } from "@/types/enums";
import { Escola } from "@/types/escola";
import { GraduationCap, School, Clock, BookOpen, DoorClosed, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { periodos } from "@/utils/formatters";
import { useUpdatePassageiro } from "@/hooks/api/usePassageiroMutations";
import { useEscolas } from "@/hooks/api/useEscolas";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { useLayout } from "@/contexts/LayoutContext";
import { toast } from "@/utils/notifications/toast";
import { safeCloseDialog } from "@/hooks";

const passageiroEscolaSchema = z.object({
  escola_id: z.string().min(1, "Selecione a escola"),
  periodo: z.string().optional().nullable(),
  turma: z.string().optional().nullable(),
  sala: z.string().optional().nullable(),
  nome_professor: z.string().optional().nullable(),
});

type PassageiroEscolaFormData = z.infer<typeof passageiroEscolaSchema>;

export interface PassageiroEscolaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: Passageiro | Partial<Passageiro> | null;
  onSuccess?: () => void;
}

export function PassageiroEscolaDialog({
  isOpen,
  onClose,
  passageiro,
  onSuccess,
}: PassageiroEscolaDialogProps) {
  const { user } = useSession();
  const { donoContaId } = useProfile(user?.id);
  const usuarioId = donoContaId || user?.id || "";
  const { openEscolaFormDialog } = useLayout();
  const updatePassageiro = useUpdatePassageiro();
  const isSaving = updatePassageiro.isPending;

  const { data: escolasData, isLoading: isLoadingEscolas } = useEscolas(
    { usuarioId },
    { enabled: isOpen && !!usuarioId }
  );

  const rawList = Array.isArray(escolasData) ? escolasData : (escolasData?.list || []);
  const [newEscola, setNewEscola] = useState<Escola | null>(null);

  const escolasList = useMemo(() => {
    if (!newEscola) return rawList;
    const exists = rawList.find((e) => e.id === newEscola.id);
    if (exists) return rawList;
    return [...rawList, newEscola];
  }, [rawList, newEscola]);

  const form = useForm<PassageiroEscolaFormData>({
    resolver: zodResolver(passageiroEscolaSchema),
    defaultValues: {
      escola_id: "",
      periodo: "",
      turma: "",
      sala: "",
      nome_professor: "",
    },
  });

  useEffect(() => {
    if (isOpen && passageiro) {
      form.reset({
        escola_id: passageiro.escola_id || passageiro.escola?.id || "",
        periodo: passageiro.periodo || "",
        turma: passageiro.turma || "",
        sala: passageiro.sala || "",
        nome_professor: passageiro.nome_professor || "",
      });
      setNewEscola(null);
    }
  }, [isOpen, passageiro, form]);

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const handleAddNewSchool = () => {
    openEscolaFormDialog({
      allowBatchCreation: false,
      onSuccess: (escolaCriada: Escola) => {
        if (escolaCriada?.id) {
          setNewEscola(escolaCriada);
          form.setValue("escola_id", escolaCriada.id, { shouldValidate: true });
        }
      },
    });
  };

  const onSubmit = async (data: PassageiroEscolaFormData) => {
    if (!passageiro?.id) return;

    try {
      await updatePassageiro.mutateAsync({
        id: passageiro.id,
        data: {
          escola_id: data.escola_id,
          periodo: (data.periodo as PassageiroPeriodo) || undefined,
          turma: data.turma?.trim() || null,
          sala: data.sala?.trim() || null,
          nome_professor: data.nome_professor?.trim() || null,
        },
        showToast: false,
      });

      toast.success("Dados escolares atualizados com sucesso!");
      onSuccess?.();
      handleClose();
    } catch {
      toast.error("Erro ao atualizar os dados escolares.");
    }
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} maxWidth="md">
      <BaseDialog.Header
        title="Editar Escola"
        icon={<GraduationCap className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />

      <BaseDialog.Body>
        <Banner
          variant="info"
          description={`Atualize as informações escolares de ${passageiro?.nome || "aluno"}.`}
          className="mb-4"
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="escola_id"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    Escola <span className="text-[#e7000b]">*</span>
                  </FormLabel>
                  <FormControl>
                    <NativeSelect
                      value={field.value || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "add-new-school") {
                          handleAddNewSchool();
                          return;
                        }
                        field.onChange(val);
                      }}
                      disabled={isLoadingEscolas}
                      icon={<School className="h-4 w-4 text-[#737373]" />}
                      error={!!fieldState.error}
                    >
                      <option value="">
                        {isLoadingEscolas ? "Carregando escolas..." : "Selecione a escola"}
                      </option>
                      {escolasList.map((escola) => (
                        <option key={escola.id} value={escola.id}>
                          {escola.nome}
                        </option>
                      ))}
                      <option value="add-new-school">
                        + Cadastrar Escola
                      </option>
                    </NativeSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="periodo"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    Turno / Período
                  </FormLabel>
                  <FormControl>
                    <NativeSelect
                      value={field.value || ""}
                      onChange={field.onChange}
                      icon={<Clock className="h-4 w-4 text-[#737373]" />}
                    >
                      <option value="">Selecionar</option>
                      {periodos.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="turma"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                      Turma
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <BookOpen className="absolute left-3.5 top-2.5 sm:top-3 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          placeholder="Ex: 5º Ano B"
                          {...field}
                          value={field.value || ""}
                          className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sala"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                      Sala
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DoorClosed className="absolute left-3.5 top-2.5 sm:top-3 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          placeholder="Ex: Sala 12"
                          {...field}
                          value={field.value || ""}
                          className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nome_professor"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    Professor(a)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3.5 top-2.5 sm:top-3 h-4 w-4 text-[#737373] pointer-events-none" />
                      <Input
                        placeholder="Ex: Profa. Juliana"
                        {...field}
                        value={field.value || ""}
                        className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          variant="secondary"
          label="Cancelar"
          onClick={handleClose}
          disabled={isSaving}
        />
        <BaseDialog.Action
          label="Salvar"
          onClick={form.handleSubmit(onSubmit)}
          isLoading={isSaving}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
