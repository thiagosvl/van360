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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        icon={<GraduationCap className="w-5 h-5 text-[#1a3a5c]" />}
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
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Escola <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={(val) => {
                      if (val === "add-new-school") {
                        handleAddNewSchool();
                        return;
                      }
                      field.onChange(val);
                    }}
                    disabled={isLoadingEscolas}
                  >
                    <FormControl>
                      <div className="relative">
                        <School className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                        <SelectTrigger
                          className={cn(
                            "pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                            fieldState.error && "border-red-500"
                          )}
                        >
                          <SelectValue placeholder={isLoadingEscolas ? "Carregando escolas..." : "Selecione a escola"} />
                        </SelectTrigger>
                      </div>
                    </FormControl>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {escolasList.map((escola) => (
                        <SelectItem key={escola.id} value={escola.id}>
                          {escola.nome}
                        </SelectItem>
                      ))}
                      <SelectItem
                        value="add-new-school"
                        className="font-semibold text-[#1a3a5c] cursor-pointer"
                      >
                        + Cadastrar Escola
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="periodo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Turno / Período
                  </FormLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                        <SelectTrigger className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left">
                          <SelectValue placeholder="Selecione o turno" />
                        </SelectTrigger>
                      </div>
                    </FormControl>
                    <SelectContent>
                      {periodos.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="turma"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      Turma
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <BookOpen className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                        <Input
                          placeholder="Ex: 5º Ano B"
                          {...field}
                          value={field.value || ""}
                          className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
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
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      Sala
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DoorClosed className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                        <Input
                          placeholder="Ex: Sala 12"
                          {...field}
                          value={field.value || ""}
                          className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
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
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Professor(a)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                      <Input
                        placeholder="Ex: Profa. Juliana"
                        {...field}
                        value={field.value || ""}
                        className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
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
