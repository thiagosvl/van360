import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Motorista, CreateMotoristaData, UpdateMotoristaData } from "@/types/motorista";
import { cpfCnpjMask, phoneMask } from "@/utils/masks";
import { useFormValidation } from "@/hooks/useFormValidation";

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

  const { errors, validate, validateAll, clearErrors } = useFormValidation({
    nome: { required: true },
    cpfCnpj: { required: true },
    telefone: { required: true },
    email: { email: true },
  });

  useEffect(() => {
    if (motorista) {
      setFormData({
        nome: motorista.nome,
        cpfCnpj: cpfCnpjMask(motorista.cpfCnpj),
        telefone: phoneMask(motorista.telefone),
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
    clearErrors();
  }, [motorista, clearErrors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll(formData)) {
      return;
    }
    
    setLoading(true);

    try {
      if (motorista) {
        // Editando - não pode alterar CPF/CNPJ
        const updateData: UpdateMotoristaData = {
          nome: formData.nome,
          telefone: formData.telefone.replace(/\D/g, ""),
          email: formData.email || undefined,
        };
        await onSubmit(updateData);
      } else {
        // Criando novo
        const createData: CreateMotoristaData = {
          nome: formData.nome,
          cpfCnpj: formData.cpfCnpj.replace(/\D/g, ""),
          telefone: formData.telefone.replace(/\D/g, ""),
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
    let maskedValue = value;
    if (field === "cpfCnpj") {
      maskedValue = cpfCnpjMask(value);
    } else if (field === "telefone") {
      maskedValue = phoneMask(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: maskedValue }));
    validate(field, maskedValue);
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
              onBlur={() => validate("nome", formData.nome)}
              className={errors.nome ? "border-destructive" : ""}
              aria-invalid={!!errors.nome}
              required
            />
            {errors.nome && (
              <p className="text-sm text-destructive mt-1">{errors.nome}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpfCnpj">CPF/CNPJ *</Label>
            <Input
              id="cpfCnpj"
              value={formData.cpfCnpj}
              onChange={(e) => handleChange("cpfCnpj", e.target.value)}
              onBlur={() => validate("cpfCnpj", formData.cpfCnpj)}
              className={errors.cpfCnpj ? "border-destructive" : ""}
              aria-invalid={!!errors.cpfCnpj}
              required
              disabled={!!motorista}
              placeholder="000.000.000-00"
            />
            {errors.cpfCnpj && (
              <p className="text-sm text-destructive mt-1">{errors.cpfCnpj}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleChange("telefone", e.target.value)}
              onBlur={() => validate("telefone", formData.telefone)}
              className={errors.telefone ? "border-destructive" : ""}
              aria-invalid={!!errors.telefone}
              required
              placeholder="(00) 00000-0000"
            />
            {errors.telefone && (
              <p className="text-sm text-destructive mt-1">{errors.telefone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => validate("email", formData.email)}
              className={errors.email ? "border-destructive" : ""}
              aria-invalid={!!errors.email}
              placeholder="email@exemplo.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
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