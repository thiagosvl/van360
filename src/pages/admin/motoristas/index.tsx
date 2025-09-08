import { useState, useEffect } from "react";
import { Plus, Search, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MotorisstaForm } from "@/components/admin/MotorisstaForm";
import { supabase } from "@/integrations/supabase/client";
import { Motorista } from "@/types/motorista";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MotoristasAdmin() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [filteredMotoristas, setFilteredMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showForm, setShowForm] = useState(false);
  const [editingMotorista, setEditingMotorista] = useState<Motorista | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    loadMotoristas();
  }, []);

  useEffect(() => {
    filterMotoristas();
  }, [motoristas, searchTerm, statusFilter]);

  const loadMotoristas = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("motoristas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMotoristas(data || []);
    } catch (error) {
      console.error("Erro ao carregar motoristas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de motoristas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMotoristas = () => {
    let filtered = motoristas.filter((motorista) =>
      motorista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorista.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorista.cpfCnpj.includes(searchTerm)
    );

    // Por enquanto, todos os motoristas são considerados "ativos"
    if (statusFilter === "ativo") {
      filtered = filtered.filter(() => true);
    } else if (statusFilter === "bloqueado") {
      filtered = filtered.filter(() => false);
    }

    setFilteredMotoristas(filtered);
    setCurrentPage(1);
  };

  const handleCreateMotorista = async (data: any) => {
    try {
      const { error } = await (supabase as any)
        .from("motoristas")
        .insert([data]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Motorista criado com sucesso!",
      });

      setShowForm(false);
      loadMotoristas();
    } catch (error) {
      console.error("Erro ao criar motorista:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o motorista.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMotorista = async (data: any) => {
    if (!editingMotorista) return;

    try {
      const { error } = await (supabase as any)
        .from("motoristas")
        .update(data)
        .eq("id", editingMotorista.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Motorista atualizado com sucesso!",
      });

      setEditingMotorista(null);
      setShowForm(false);
      loadMotoristas();
    } catch (error) {
      console.error("Erro ao atualizar motorista:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o motorista.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (motorista: Motorista) => {
    setEditingMotorista(motorista);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMotorista(null);
  };

  // Paginação
  const totalPages = Math.ceil(filteredMotoristas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMotoristas = filteredMotoristas.slice(startIndex, endIndex);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo cliente
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome, email ou CPF/CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="bloqueado">Bloqueado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentMotoristas.map((motorista) => (
              <TableRow key={motorista.id}>
                <TableCell className="font-medium">{motorista.nome}</TableCell>
                <TableCell>{motorista.cpfCnpj}</TableCell>
                <TableCell>{motorista.email}</TableCell>
                <TableCell>{motorista.telefone}</TableCell>
                <TableCell>
                  {format(new Date(motorista.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(motorista)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-3 text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Modal do formulário */}
      {showForm && (
        <MotorisstaForm
          motorista={editingMotorista}
          onSubmit={editingMotorista ? handleUpdateMotorista : handleCreateMotorista}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}