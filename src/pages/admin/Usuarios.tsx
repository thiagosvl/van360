import { UsuarioForm, UsuarioFormData } from "@/components/admin/UsuarioForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Usuario } from "@/types/usuario";
import { formatDateTimeToBR, formatProfile } from "@/utils/formatters";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const fetchUsuarios = async () => {
    // A lógica de fetch permanece a mesma
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const closeForm = () => {
    setShowForm(false);
    setSelectedUsuario(null);
  };

  const handleCreateUsuario = async (data: UsuarioFormData) => {
    const cpfcnpjDigits = data.cpfcnpj.replace(/\D/g, "");

    // 1. Verificar se usuário já existe
    const { data: existingUsers, error: existingError } = await supabase
      .from("usuarios")
      .select("cpfcnpj,email")
      .or(
        `cpfcnpj.eq.${cpfcnpjDigits},email.eq.${encodeURIComponent(data.email)}`
      );

    if (existingError) throw new Error(existingError.message);
    if (existingUsers && existingUsers.length > 0) {
      const existing = existingUsers[0];
      if (existing.cpfcnpj === cpfcnpjDigits) {
        throw new Error("CPF/CNPJ já existe.");
      }
      if (existing.email === data.email) {
        throw new Error("Email já existe.");
      }
    }

    // 2. Inserir na tabela 'usuarios' (sem o auth_uid ainda)
    const { data: usuarioData, error: usuarioError } = await supabase
      .from("usuarios")
      .insert({
        cpfcnpj: cpfcnpjDigits,
        email: data.email,
        telefone: data.telefone,
        nome: data.nome,
        role: data.role,
      })
      .select()
      .single();

    if (usuarioError) throw new Error(usuarioError.message);

    try {
      // 3. Criar usuário no Auth via Edge Function
      const { data: authData, error: authError } =
        await supabase.functions.invoke("adminCreateUser", {
          body: {
            email: data.email,
            role: data.role,
            usuario_id: usuarioData.id,
          },
        });

      if (authError) throw new Error(authError.message);

      // 4. Atualizar a tabela 'usuarios' com o auth_uid
      await supabase
        .from("usuarios")
        .update({ auth_uid: authData.auth_uid })
        .eq("id", usuarioData.id);

      toast({ title: "Sucesso", description: "Usuário criado com sucesso!" });
      // TODO: Implementar um modal para exibir a senha `authData.senha` se desejar
    } catch (error) {
      // Rollback: se a criação no Auth falhar, deleta o usuário da tabela pública
      await supabase.from("usuarios").delete().eq("id", usuarioData.id);
      throw error; // Re-lança o erro para ser pego pelo formulário
    }

    await fetchUsuarios();
    closeForm();
  };

  const handleUpdateUsuario = async (data: UsuarioFormData) => {
    if (!selectedUsuario || !selectedUsuario.auth_uid) {
      toast({
        title: "Erro",
        description:
          "Usuário selecionado é inválido ou não possui um ID de autenticação.",
        variant: "destructive",
      });
      return;
    }

    // 1. Atualiza a tabela pública 'usuarios'
    const { error: profileError } = await supabase
      .from("usuarios")
      .update({
        nome: data.nome,
        telefone: data.telefone,
        role: data.role,
      })
      .eq("id", selectedUsuario.id);

    if (profileError) {
      throw new Error(`Erro ao atualizar perfil: ${profileError.message}`);
    }

    try {
      // 2. Invoca a Edge Function para atualizar a role no Auth
      const { error: authError } = await supabase.functions.invoke(
        "adminUpdateUser",
        {
          body: {
            auth_uid: selectedUsuario.auth_uid,
            role: data.role,
          },
        }
      );

      if (authError) {
        // Se a atualização do Auth falhar, idealmente deveríamos reverter a atualização do perfil.
        // Por simplicidade aqui, apenas notificamos o erro.
        throw new Error(
          `Perfil atualizado, mas falha ao atualizar permissões: ${authError.message}`
        );
      }

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });

      await fetchUsuarios();
      closeForm();
    } catch (error: any) {
      // Este catch vai pegar erros de ambas as operações
      toast({
        title: "Erro na Atualização",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // ALTERAÇÃO: Lógica de exclusão corrigida e aprimorada
  const handleDelete = async (usuario: Usuario) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`)) {
      return;
    }

    try {
      // 1. Deletar o usuário do Supabase Auth via Edge Function
      // É necessário criar uma função 'adminDeleteUser' que receba o auth_uid
      if (usuario.auth_uid) {
        const { error: authError } = await supabase.functions.invoke(
          "adminDeleteUser",
          {
            body: { auth_uid: usuario.auth_uid },
          }
        );
        // Não bloqueamos a exclusão se o usuário do auth não for encontrado
        if (authError && !authError.message.includes("User not found")) {
          throw authError;
        }
      }

      // 2. Deletar da tabela 'usuarios'
      const { error } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", usuario.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!",
      });

      await fetchUsuarios();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir usuário: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (data: UsuarioFormData) => {
    if (selectedUsuario) {
      return handleUpdateUsuario(data);
    }
    return handleCreateUsuario(data);
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setShowForm(true);
  };

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.cpfcnpj.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestão de Usuários</CardTitle>
              <CardDescription>
                Gerencie os usuarios e seus acessos ao sistema
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setSelectedUsuario(null);
                setShowForm(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
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

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Pefil</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum usuario encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">
                        {usuario.nome}
                      </TableCell>
                      <TableCell>{usuario.cpfcnpj}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.telefone}</TableCell>
                      <TableCell>{formatProfile(usuario.role)}</TableCell>
                      <TableCell>
                        {formatDateTimeToBR(usuario.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(usuario)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(usuario)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
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
        </CardContent>
      </Card>

      {showForm && (
        <UsuarioForm
          usuario={selectedUsuario}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}
    </div>
  );
}
