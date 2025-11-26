import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usuarioApi } from "@/services";
import { toast } from "@/utils/notifications/toast";
import { useEffect, useMemo, useState } from "react";

interface Passageiro {
  id: string;
  nome: string;
  nome_responsavel?: string;
  email_responsavel?: string;
  telefone_responsavel?: string;
  enviar_cobranca_automatica: boolean;
  selecionado: boolean;
}

interface SelecaoPassageirosDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (passageiroIds: string[]) => void;
  tipo: "upgrade" | "downgrade";
  franquia: number;
  usuarioId: string;
}

export function SelecaoPassageirosDialog({
  isOpen,
  onClose,
  onConfirm,
  tipo,
  franquia,
  usuarioId,
}: SelecaoPassageirosDialogProps) {
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      carregarPassageiros();
    } else {
      setBusca("");
      setSelecionados(new Set());
    }
  }, [isOpen, tipo, franquia]);

  const carregarPassageiros = async () => {
    setLoading(true);
    try {
      const data = await usuarioApi.listarPassageirosParaSelecao(usuarioId, tipo, franquia);
      setPassageiros(data);
      
      const idsSelecionados = new Set(
        data.filter((p: Passageiro) => p.selecionado).map((p: Passageiro) => p.id)
      );
      setSelecionados(idsSelecionados);
    } catch (error: any) {
      toast.error("Erro ao carregar passageiros", {
        description: error.message || "Não foi possível carregar a lista de passageiros.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelecao = (id: string) => {
    const novoSelecionados = new Set(selecionados);
    
    if (novoSelecionados.has(id)) {
      novoSelecionados.delete(id);
    } else {
      if (novoSelecionados.size < franquia) {
        novoSelecionados.add(id);
      } else {
        toast.error("Limite atingido", {
          description: `Você pode selecionar no máximo ${franquia} passageiros.`,
        });
        return;
      }
    }
    
    setSelecionados(novoSelecionados);
  };

  const handleConfirm = () => {
    // Em downgrade, permitir selecionar 0 passageiros (desativar todos)
    if (tipo === "downgrade" && selecionados.size === 0) {
      // Permitir - usuário pode querer desativar todos
    } else if (selecionados.size === 0) {
      toast.error("Seleção obrigatória", {
        description: "Selecione pelo menos um passageiro.",
      });
      return;
    }
    onConfirm(Array.from(selecionados));
  };

  const passageirosFiltrados = useMemo(() => {
    if (!busca.trim()) return passageiros;
    
    const buscaLower = busca.toLowerCase();
    return passageiros.filter((p) =>
      p.nome.toLowerCase().includes(buscaLower) ||
      p.nome_responsavel?.toLowerCase().includes(buscaLower)
    );
  }, [passageiros, busca]);

  const podeSelecionarMais = selecionados.size < franquia;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Escolha os passageiros</DialogTitle>
          <DialogDescription>
            Você pode escolher até {franquia} passageiros. Selecione quais terão cobrança automática.
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Buscar passageiro..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="mb-4"
        />

        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : passageirosFiltrados.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {busca ? "Nenhum passageiro encontrado" : "Nenhum passageiro disponível"}
            </p>
          ) : (
            passageirosFiltrados.map((passageiro) => {
              const estaSelecionado = selecionados.has(passageiro.id);
              const desabilitado = !estaSelecionado && !podeSelecionarMais;
              
              return (
                <div
                  key={passageiro.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors",
                    estaSelecionado
                      ? "border-blue-500 bg-blue-50"
                      : desabilitado
                      ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => !desabilitado && toggleSelecao(passageiro.id)}
                >
                  <Checkbox
                    checked={estaSelecionado}
                    onCheckedChange={() => !desabilitado && toggleSelecao(passageiro.id)}
                    disabled={desabilitado}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{passageiro.nome}</p>
                    {passageiro.nome_responsavel && (
                      <p className="text-sm text-gray-500">{passageiro.nome_responsavel}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <span className={cn(
            "text-sm",
            selecionados.size >= franquia ? "text-red-600 font-medium" : "text-gray-600"
          )}>
            {selecionados.size} de {franquia} passageiros selecionados
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={tipo === "upgrade" && selecionados.size === 0}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

