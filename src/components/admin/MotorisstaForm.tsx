import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Motorista, CreateMotoristaData, UpdateMotoristaData } from "@/types/motorista";
import { cpfCnpjMask, phoneMask } from "@/utils/masks";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const { toast } = useToast();

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
        const cpfCnpjDigits = formData.cpfCnpj.replace(/\D/g, '');
        
        // Check if CPF/CNPJ or email already exists
        const response = await fetch(`https://jztyffakurtekwxurclw.supabase.co/rest/v1/usuarios?or=(cpfcnpj.eq.${cpfCnpjDigits},email.eq.${encodeURIComponent(formData.email)})&select=cpfcnpj,email`, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6dHlmZmFrdXJ0ZWt3eHVyY2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDkwNDMsImV4cCI6MjA3MjQyNTA0M30.n7PD7-FMXJ7ZmBUzpwu5rqHU4ak6g_pKm85pRWr551E',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6dHlmZmFrdXJ0ZWt3eHVyY2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDkwNDMsImV4cCI6MjA3MjQyNTA0M30.n7PD7-FMXJ7ZmBUzpwu5rqHU4ak6g_pKm85pRWr551E',
            'Content-Type': 'application/json'
          }
        });

        const existingUsers = await response.json();

        if (existingUsers && existingUsers.length > 0) {
          const existing = existingUsers[0];
          if (existing.cpfcnpj === cpfCnpjDigits) {
            toast({
              title: "Erro",
              description: "CPF/CNPJ já existe no sistema",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          if (existing.email === formData.email) {
            toast({
              title: "Erro", 
              description: "Email já existe no sistema",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        }

        // Create in usuarios first
        const { data: usuarioData, error: usuarioError } = await supabase
          .from('usuarios')
          .insert({
            cpfcnpj: cpfCnpjDigits, // Note: lowercase to match database
            email: formData.email,
            role: 'motorista'
          })
          .select()
          .single();

        if (usuarioError) {
          toast({
            title: "Erro",
            description: "Erro ao criar usuário: " + usuarioError.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Create in motoristas
        const motoristaToCreate = {
          nome: formData.nome,
          cpfCnpj: cpfCnpjDigits,
          telefone: formData.telefone,
          email: formData.email, // Required field now
        };
        
        const { data: motoristaData, error: motoristaError } = await supabase
          .from('motoristas')
          .insert(motoristaToCreate)
          .select()
          .single();

        if (motoristaError) {
          // Rollback usuario creation
          await supabase.from('usuarios').delete().eq('id', usuarioData.id);
          toast({
            title: "Erro",
            description: "Erro ao criar motorista: " + motoristaError.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Update usuarios with motorista_id
        await supabase
          .from('usuarios')
          .update({ motorista_id: motoristaData.id })
          .eq('id', usuarioData.id);

        // Call Edge Function to create auth user
        const { data: authData, error: authError } = await supabase.functions.invoke('adminCreateUser', {
          body: {
            email: formData.email,
            role: 'motorista',
            motorista_id: motoristaData.id
          }
        });

        if (authError) {
          toast({
            title: "Erro",
            description: "Erro ao criar acesso: " + authError.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Update usuarios with auth_uid
        await supabase
          .from('usuarios')
          .update({ auth_uid: authData.auth_uid })
          .eq('id', usuarioData.id);

        // Show generated password
        setGeneratedPassword(authData.senha);
        setShowPassword(true);
        
        toast({
          title: "Sucesso",
          description: "Motorista criado com sucesso!",
        });
      }
    } catch (error) {
      console.error("Erro no formulário:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive",
      });
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

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast({
      title: "Copiado!",
      description: "Senha copiada para a área de transferência",
    });
  };

  if (showPassword) {
    return (
      <Dialog open onOpenChange={() => { setShowPassword(false); onClose(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Motorista Criado com Sucesso!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">
                Senha gerada para {formData.email}:
              </p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-white rounded border text-green-900 font-mono">
                  {generatedPassword}
                </code>
                <Button size="sm" onClick={copyPassword}>
                  Copiar
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Anote esta senha, ela não será exibida novamente.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => { setShowPassword(false); onClose(); }}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

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
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="email@exemplo.com"
              required
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