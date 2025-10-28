import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cleanString } from "@/utils/formatters";
import { cpfMask, phoneMask } from "@/utils/masks";
import { clearLoginStorageResponsavel } from "@/utils/responsavelUtils";
import { isValidCPF } from "@/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const registerSchema = z
  .object({
    nome: z.string().min(3, "Nome completo é obrigatório"),
    cpfcnpj: z
      .string()
      .min(1, "Campo obrigatório")
      .refine((val) => isValidCPF(val), "CPF inválido"),
    email: z.string().min(1, "Campo obrigatório").email("E-mail inválido"),
    telefone: z
      .string()
      .min(1, "Campo obrigatório")
      .refine((val) => {
        const cleaned = val.replace(/\D/g, "");
        return cleaned.length === 11;
      }, "O formato aceito é (00) 00000-0000"),
    senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmarSenha: z.string().min(1, "Confirmação obrigatória"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const inDevelopment = import.meta.env.MODE === "development";

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "Thiago Barros Abilio",
      cpfcnpj: "395.423.918-38",
      email: "thiago-svl@hotmail.com",
      telefone: "(11) 95118-6951",
      senha: "Ogaiht+1",
      confirmarSenha: "Ogaiht+1",
    },
  });

  const handleRegister = async (data: RegisterFormData) => {
    setLoading(true);

    // 🔹 Limpeza e padronização
    const cpfcnpjDigits = data.cpfcnpj.replace(/\D/g, "");
    const nome = cleanString(data.nome, true);
    const email = cleanString(data.email).toLowerCase();
    const telefone = data.telefone.replace(/\D/g, ""); // apenas números

    let createdUsuario: any = null;
    let createdAuthUid: string | null = null;

    try {
      // 1️⃣ Verificar duplicidades (CPF, email, telefone)
      const { data: existingUsers, error: existingError } = await supabase
        .from("usuarios")
        .select("cpfcnpj, email, telefone")
        .or(
          `cpfcnpj.eq.${cpfcnpjDigits},email.eq.${email},telefone.eq.${telefone}`
        );

      if (existingError) throw existingError;

      if (existingUsers && existingUsers.length > 0) {
        const existing = existingUsers[0];
        let msg = "Já existe um cadastro com os mesmos dados.";

        if (existing.cpfcnpj === cpfcnpjDigits)
          msg =
            "Já existe um cadastro com o CPF informado. Entre em contato com o suporte.";
        else if (existing.email === email)
          msg =
            "Já existe um cadastro com o email informado. Entre em contato com o suporte.";
        else if (existing.telefone === telefone)
          msg =
            "Já existe um cadastro com o telefone informado. Entre em contato com o suporte.";

        toast({
          title: "Erro ao cadastrar",
          description: msg,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // 2️⃣ Criar registro na tabela 'usuarios' (auth_uid = null)
      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuarios")
        .insert({
          nome,
          cpfcnpj: cpfcnpjDigits,
          email,
          telefone,
          role: "motorista",
          auth_uid: null,
        })
        .select()
        .single();

      if (usuarioError) throw usuarioError;
      createdUsuario = usuarioData;

      // 3️⃣ Criar usuário no Supabase Auth (sem confirmação de email)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: data.senha,
        options: { emailRedirectTo: undefined },
      });

      if (authError || !authData.user) {
        // rollback do usuario
        await supabase.from("usuarios").delete().eq("id", createdUsuario.id);
        throw authError || new Error("Erro ao criar usuário no Auth");
      }

      createdAuthUid = authData.user.id;

      // 4️⃣ Atualizar auth_uid no usuario
      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ auth_uid: createdAuthUid })
        .eq("id", createdUsuario.id);

      if (updateError) {
        // rollback total
        await supabase.from("usuarios").delete().eq("id", createdUsuario.id);
        await supabase.auth.admin.deleteUser(createdAuthUid);
        throw updateError;
      }

      // ✅ Sucesso
      toast({
        title: "Cadastro realizado com sucesso!",
        description:
          "Seu cadastro foi criado e você já está logado no sistema.",
      });

      // Seta role e limpa possíveis logins de responsável
      localStorage.setItem("app_role", "motorista");
      clearLoginStorageResponsavel();

      // Redireciona direto para o sistema
      navigate("/inicio", { replace: true });
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      toast({
        title: "Erro no cadastro",
        description:
          "Ocorreu um problema ao tentar criar seu cadastro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-background dark:to-muted p-6">
      <img
        src="/assets/logo-van360.png"
        alt="Van360"
        className="h-16 w-auto mb-4 select-none"
      />
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <CardContent className="mt-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Crie sua conta
          </h1>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleRegister)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nome completo <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Digite seu nome completo"
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpfcnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      CPF <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        onChange={(e) =>
                          field.onChange(cpfMask(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Digite seu email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      WhatsApp <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="(00) 00000-0000"
                        onChange={(e) =>
                          field.onChange(phoneMask(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Senha <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Crie uma senha"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmarSenha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Confirmar senha <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Repita a senha"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? "Cadastrando..." : "Criar conta"}
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Já tem conta?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-primary font-semibold hover:underline"
                  >
                    Acesse aqui
                  </button>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
