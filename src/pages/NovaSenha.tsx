import { useState } from "react";
import { useForm } from "react-hook-form";

import { ROUTES } from "@/constants/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

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
import { ArrowLeft, Lock } from "lucide-react";

import { apiClient } from "@/services/api/client";

import { useSEO } from "@/hooks/useSEO";
import { toast } from "@/utils/notifications/toast";

export default function NovaSenha() {
  useSEO({
    noindex: true,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formSchema = z
    .object({
      senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
      confirmarSenha: z.string().min(1, "Confirme sua senha"),
    })
    .refine((data) => data.senha === data.confirmarSenha, {
      message: "As senhas não coincidem",
      path: ["confirmarSenha"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      senha: "",
      confirmarSenha: "",
    },
  });

  const handleRedefinir = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      // We assume the user is already logged in (via magic link/recovery link handling by Supabase Client or manual session)
      // Actually, when a user clicks the recovery link, Supabase Auto-login works on client-side to set the session.
      // So 'apiClient' will automatically attach the Bearer token.
      
      const { data: response } = await apiClient.post("/auth/update-password", {
          password: data.senha
      });

      setLoading(false);

      if (!response.success) throw new Error(response.message || "Erro desconhecido");

      toast.success("auth.sucesso.senhaRedefinida", {
        description: "auth.sucesso.redirecionando",
      });

      setTimeout(
        () => navigate(ROUTES.PRIVATE.MOTORISTA.HOME, { replace: true }),
        1200
      );
    } catch (err: any) {
      setLoading(false);
      const msg = err.userMessage || err.message || "Tente novamente mais tarde.";
      
      if (msg.includes("same_password")) {
          toast.error("erro.operacao", {
            description: "A nova senha deve ser diferente da senha atual.",
          });
      } else {
        toast.error("erro.generico", {
            description: msg,
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-blue-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-8">
      <div className="w-full max-w-md mb-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <img
          src="/assets/logo-van360.png"
          alt="Van360"
          className="h-20 w-auto mb-4 select-none drop-shadow-sm"
        />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500">
        <CardContent className="p-8 sm:p-10 bg-white/80 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Redefinir senha
            </h1>
            <p className="text-gray-500 text-sm">
              Crie uma nova senha segura para sua conta
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleRedefinir)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium ml-1">
                      Nova senha
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                          {...field}
                        />
                      </div>
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
                    <FormLabel className="text-gray-700 font-medium ml-1">
                      Confirmar nova senha
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Redefinir senha"}
                </Button>
              </div>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.PUBLIC.LOGIN)}
                  className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
                >
                  <ArrowLeft className="h-4 w-4" /> Voltar ao login
                </button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
