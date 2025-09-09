import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cpfCnpjMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const loginSchema = z.object({
  cpfCnpj: z
    .string()
    .min(1, "Campo obrigatório")
    .refine(
      (value) => {
        const digits = value.replace(/\D/g, "");
        return digits.length === 11 || digits.length === 14;
      },
      {
        message: "CPF 11 dígitos ou CNPJ 14 dígitos",
      }
    ),
  senha: z.string().min(6, "Mínimo de 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      cpfCnpj: "",
      senha: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      const cpfCnpjDigits = data.cpfCnpj.replace(/\D/g, "");
      const response = await fetch(
        `${supabaseUrl}/rest/v1/usuarios?cpfcnpj=eq.${cpfCnpjDigits}&select=email,role`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const usuarios = await response.json();

      if (!usuarios || usuarios.length === 0) {
        form.setError("cpfCnpj", {
          type: "manual",
          message: "Usuário não encontrado",
        });
        setLoading(false);
        return;
      }

      const usuario = usuarios[0];

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: usuario.email,
        password: data.senha,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          form.setError("senha", {
            type: "manual",
            message: "Senha incorreta",
          });
        } else {
          form.setError("root", {
            type: "manual",
            message: "Erro inesperado: " + signInError.message,
          });
        }
        setLoading(false);
        return;
      }

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo!",
      });
    } catch (error) {
      console.error("Login error:", error);
      form.setError("root", {
        type: "manual",
        message: "Erro inesperado",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Login
          </CardTitle>
          <CardDescription className="text-center">
            Entre com seu CPF/CNPJ e senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cpfCnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="000.000.000-00"
                        autoComplete="username"
                        onChange={(e) => {
                          const masked = cpfCnpjMask(e.target.value);
                          field.onChange(masked);
                        }}
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
                    <FormLabel>Senha *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Digite sua senha"
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <div className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
