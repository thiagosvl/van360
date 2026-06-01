import { useState, useEffect } from "react";
import { usePassageiros } from "../api/usePassageiros";
import { useCreateRoute, useUpdateRoute } from "../api/useRouteMutations";
import { Route, RoutePassenger } from "@/types/route";
import { Passageiro } from "@/types/passageiro";
import { toast } from "@/utils/notifications/toast";

interface SetupPassenger {
  id: string;
  nome: string;
  bairro?: string;
  escola_nome?: string;
  ordem: number;
}

export function useRouteSetupViewModel({
  usuarioId,
  routeToEdit
}: {
  usuarioId: string;
  routeToEdit?: Route;
}) {
  const [nome, setNome] = useState("");
  const [periodo, setPeriodo] = useState("manha");
  const [tipo, setTipo] = useState<"ida" | "volta">("ida");
  const [selectedPassengers, setSelectedPassengers] = useState<SetupPassenger[]>([]);

  const { data: passageirosData, isLoading: isLoadingPassengers } = usePassageiros({
    usuarioId,
    status: "true"
  });
  const allPassengers = passageirosData?.list || [];

  const createRouteMutation = useCreateRoute();
  const updateRouteMutation = useUpdateRoute();

  useEffect(() => {
    if (routeToEdit) {
      setNome(routeToEdit.nome);
      setPeriodo(routeToEdit.periodo);
      setTipo(routeToEdit.tipo);
      if (routeToEdit.passageiros) {
        const mapped = routeToEdit.passageiros.map((p) => ({
          id: p.passageiro_id,
          nome: p.nome,
          bairro: p.bairro,
          escola_nome: p.escola?.nome,
          ordem: p.ordem
        }));
        setSelectedPassengers(mapped.sort((a, b) => a.ordem - b.ordem));
      }
    }
  }, [routeToEdit]);

  const togglePassengerSelection = (passenger: Passageiro) => {
    const isSelected = selectedPassengers.some((p) => p.id === passenger.id);

    if (isSelected) {
      const filtered = selectedPassengers.filter((p) => p.id !== passenger.id);
      const reordered = filtered.map((p, index) => ({
        ...p,
        ordem: index + 1
      }));
      setSelectedPassengers(reordered);
    } else {
      const newPassenger: SetupPassenger = {
        id: passenger.id,
        nome: passenger.nome,
        bairro: passenger.bairro,
        escola_nome: passenger.escola?.nome,
        ordem: selectedPassengers.length + 1
      };
      setSelectedPassengers([...selectedPassengers, newPassenger]);
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
    setSelectedPassengers(reordered);
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
    setSelectedPassengers(reordered);
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
    setSelectedPassengers(reordered);
  };

  const handleSave = async (onSuccessCallback?: () => void) => {
    if (!nome.trim()) {
      toast.error("Nome da rota é obrigatório");
      return;
    }

    if (selectedPassengers.length === 0) {
      toast.error("Selecione pelo menos um passageiro para a rota");
      return;
    }

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
