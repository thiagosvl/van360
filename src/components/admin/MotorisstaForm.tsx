import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Motorista, CreateMotoristaData, UpdateMotoristaData } from "@/types/motorista";
import { cpfCnpjMask, phoneMask } from "@/utils/masks";

interface MotorisstaFormProps {
  motorista: Motorista | null;
  onSubmit: (data: CreateMotoristaData | UpdateMotoristaData) => void;
  onClose: () => void;
}

export function MotorisstaForm({ motorista, onSubmit, onClose }: MotorisstaFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    cpfCnpj: "",
    telefone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (motorista) {
      setFormData({
        nome: motorista.nome,
        cpfCnpj: motorista.cpfCnpj,
        telefone: motorista.telefone,
        email: motorista.email,
      });
    } else {
      setFormData({
        nome: "",
        cpfCnpj: "",
        telefone: "",
        email: "",
      });
    }
  }, [motorista]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (motorista) {
        // Editando - não pode alterar CPF/CNPJ
        const updateData: UpdateMotoristaData = {
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email || undefined,
        };
        await onSubmit(updateData);
      } else {
        // Criando novo
        const createData: CreateMotoristaData = {
          nome: formData.nome,
          cpfCnpj: formData.cpfCnpj,
          telefone: formData.telefone,
          email: formData.email || undefined,
        };
        await onSubmit(createData);
      }
    } catch (error) {
      console.error("Erro no formulário:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === "cpfCnpj") {
      setFormData(prev => ({ ...prev, [field]: cpfCnpjMask(value) }));
    } else if (field === "telefone") {
      setFormData(prev => ({ ...prev, [field]: phoneMask(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {motorista ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpfCnpj">CPF/CNPJ *</Label>
            <Input
              id="cpfCnpj"
              value={formData.cpfCnpj}
              onChange={(e) => handleChange("cpfCnpj", e.target.value)}
              required
              disabled={!!motorista}
              placeholder="000.000.000-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleChange("telefone", e.target.value)}
              required
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}