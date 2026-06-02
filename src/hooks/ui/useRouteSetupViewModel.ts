import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePassageiros } from "../api/usePassageiros";
import { useCreateRoute, useUpdateRoute } from "../api/useRouteMutations";
import { Route } from "@/types/route";
import { Passageiro } from "@/types/passageiro";

interface SetupPassenger {
  id: string;
  nome: string;
  bairro?: string;
  escola_nome?: string;
  ordem: number;
}

export const routeSetupSchema = z.object({
  nome: z.string({ required_error: "Nome da rota é obrigatório" }).min(1, "Nome da rota é obrigatório"),
  periodo: z.string({ required_error: "Período é obrigatório" }),
  tipo: z.enum(["ida", "volta"], { required_error: "Tipo é obrigatório" }),
  passageiros: z.array(z.object({
    id: z.string(),
    nome: z.string(),
    bairro: z.string().optional(),
    escola_nome: z.string().optional(),
    ordem: z.number()
  })).min(1, "Selecione pelo menos um passageiro para a rota")
});

export type RouteSetupFormData = z.infer<typeof routeSetupSchema>;

export function useRouteSetupViewModel({
  usuarioId,
  routeToEdit
}: {
  usuarioId: string;
  routeToEdit?: Route;
}) {
  const form = useForm<RouteSetupFormData>({
    resolver: zodResolver(routeSetupSchema),
    defaultValues: {
      nome: "",
      periodo: "manha",
      tipo: "ida",
      passageiros: []
    },
    mode: "onBlur"
  });

  const { data: passageirosData, isLoading: isLoadingPassengers } = usePassageiros({
    usuarioId,
    status: "true"
  });
  const allPassengers = passageirosData?.list || [];

  const createRouteMutation = useCreateRoute();
  const updateRouteMutation = useUpdateRoute();

  useEffect(() => {
    if (routeToEdit) {
      form.setValue("nome", routeToEdit.nome);
      form.setValue("periodo", routeToEdit.periodo);
      form.setValue("tipo", routeToEdit.tipo);
      if (routeToEdit.passageiros) {
        const mapped = routeToEdit.passageiros.map((p) => ({
          id: p.passageiro_id,
          nome: p.nome,
          bairro: p.bairro,
          escola_nome: p.escola?.nome,
          ordem: p.ordem
        }));
        form.setValue("passageiros", mapped.sort((a, b) => a.ordem - b.ordem));
      }
    }
  }, [routeToEdit, form]);

  const selectedPassengers = form.watch("passageiros") || [];
  const nome = form.watch("nome");
  const periodo = form.watch("periodo");
  const tipo = form.watch("tipo");

  const setNome = (val: string) => form.setValue("nome", val, { shouldValidate: true });
  const setPeriodo = (val: string) => form.setValue("periodo", val, { shouldValidate: true });
  const setTipo = (val: "ida" | "volta") => form.setValue("tipo", val, { shouldValidate: true });

  const togglePassengerSelection = (passenger: Passageiro) => {
    const isSelected = selectedPassengers.some((p) => p.id === passenger.id);

    if (isSelected) {
      const filtered = selectedPassengers.filter((p) => p.id !== passenger.id);
      const reordered = filtered.map((p, index) => ({
        ...p,
        ordem: index + 1
      }));
      form.setValue("passageiros", reordered, { shouldValidate: true });
    } else {
      const newPassenger: SetupPassenger = {
        id: passenger.id,
        nome: passenger.nome,
        bairro: passenger.bairro,
        escola_nome: passenger.escola?.nome,
        ordem: selectedPassengers.length + 1
      };
      form.setValue("passageiros", [...selectedPassengers, newPassenger], { shouldValidate: true });
    }
  };

  const moverParaCima = (index: number) => {
    if (index === 0) return;
    const newItems = [...selectedPassengers];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;

    const reordered = newItems.map((p, idx) => ({
      ...p,
      ordem: idx + 1
    }));
    form.setValue("passageiros", reordered, { shouldValidate: true });
  };

  const moverParaBaixo = (index: number) => {
    if (index === selectedPassengers.length - 1) return;
    const newItems = [...selectedPassengers];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;

    const reordered = newItems.map((p, idx) => ({
      ...p,
      ordem: idx + 1
    }));
    form.setValue("passageiros", reordered, { shouldValidate: true });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const newItems = [...selectedPassengers];
    const [removed] = newItems.splice(sourceIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    const reordered = newItems.map((p, idx) => ({
      ...p,
      ordem: idx + 1
    }));
    form.setValue("passageiros", reordered, { shouldValidate: true });
  };

  const handleSave = async (onSuccessCallback?: () => void) => {
    const payload = {
      usuario_id: usuarioId,
      nome,
      periodo,
      tipo,
      passageiros: selectedPassengers.map((p) => ({
        passageiro_id: p.id,
        ordem: p.ordem
      }))
    };

    if (routeToEdit) {
      updateRouteMutation.mutate(
        { id: routeToEdit.id, data: payload },
        {
          onSuccess: () => {
            if (onSuccessCallback) onSuccessCallback();
          }
        }
      );
    } else {
      createRouteMutation.mutate(payload, {
        onSuccess: () => {
          if (onSuccessCallback) onSuccessCallback();
        }
      });
    }
  };

  const availablePassengers = allPassengers.filter(
    (ap) => !selectedPassengers.some((sp) => sp.id === ap.id)
  );

  return {
    form,
    nome,
    setNome,
    periodo,
    setPeriodo,
    tipo,
    setTipo,
    selectedPassengers,
    availablePassengers,
    isLoading: isLoadingPassengers || createRouteMutation.isPending || updateRouteMutation.isPending,
    togglePassengerSelection,
    moverParaCima,
    moverParaBaixo,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleSave
  };
}

