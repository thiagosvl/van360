import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Motorista } from "@/types/motorista";
import { MotorisstaForm } from "@/components/admin/MotorisstaForm";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDateToBR } from '@/utils/formatters';

export default function MotoristasAdmin() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMotorista, setSelectedMotorista] = useState<Motorista | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const fetchMotoristas = async () => {
    try {
      const { data, error } = await supabase
        .from('motoristas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMotoristas(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar motoristas: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotoristas();
  }, []);

  const handleCreateMotorista = async (data: any) => {
    try {
      await fetchMotoristas(); // Refresh list
      setShowForm(false);
      setSelectedMotorista(null);
    } catch (error) {
      console.error("Error creating motorista:", error);
    }
  };

  const handleUpdateMotorista = async (data: any) => {
    try {
      if (!selectedMotorista) return;

      const { error } = await supabase
        .from('motoristas')
        .update(data)
        .eq('id', selectedMotorista.id);

      if (error) throw error;

      // Also update email in usuarios table
      if (data.email) {
        await supabase
          .from('usuarios')
          .update({ email: data.email })
          .eq('motorista_id', selectedMotorista.id);
      }

      toast({
        title: "Sucesso",
        description: "Motorista atualizado com sucesso!",
      });

      await fetchMotoristas();
      setShowForm(false);
      setSelectedMotorista(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar motorista: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (motorista: Motorista) => {
    setSelectedMotorista(motorista);
    setShowForm(true);
  };

  const handleDelete = async (motorista: Motorista) => {
    if (!confirm(`Tem certeza que deseja excluir o motorista ${motorista.nome}?`)) {
      return;
    }

    try {
      // Delete from usuarios first (if exists)
      await supabase
        .from('usuarios')
        .delete()
        .eq('motorista_id', motorista.id);

      // Delete from motoristas
      const { error } = await supabase
        .from('motoristas')
        .delete()
        .eq('id', motorista.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Motorista excluído com sucesso!",
      });

      await fetchMotoristas();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir motorista: " + error.message,
        variant: "destructive",
      });
    }
  };

  const filteredMotoristas = motoristas.filter(motorista =>
    motorista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    motorista.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    motorista.cpfCnpj.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestão de Motoristas</CardTitle>
              <CardDescription>
                Gerencie os motoristas e seus acessos ao sistema
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Motorista
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Buscar por nome, email ou CPF/CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMotoristas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum motorista encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMotoristas.map((motorista) => (
                      <TableRow key={motorista.id}>
                        <TableCell className="font-medium">{motorista.nome}</TableCell>
                        <TableCell>{motorista.cpfCnpj}</TableCell>
                        <TableCell>{motorista.email}</TableCell>
                        <TableCell>{motorista.telefone}</TableCell>
                        <TableCell>{formatDateToBR(motorista.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(motorista)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(motorista)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <MotorisstaForm
          motorista={selectedMotorista}
          onSubmit={selectedMotorista ? handleUpdateMotorista : handleCreateMotorista}
          onClose={() => {
            setShowForm(false);
            setSelectedMotorista(null);
          }}
        />
      )}
    </div>
  );
}