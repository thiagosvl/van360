import { LoadingOverlay } from "@/components/LoadingOverlay";
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
import { responsavelService } from "@/services/responsavelService";
import { cpfMask } from "@/utils/masks";
import { clearLoginStorageMotorista } from "@/utils/motoristaUtils";
import { clearLoginStorageResponsavel } from "@/utils/responsavelUtils";
import { isValidCPF } from "@/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

export default function Login() {
  const [tab, setTab] = useState("motorista");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const appDomain = import.meta.env.VITE_PUBLIC_APP_DOMAIN;

  const formMotoristaSchema = z.object({
    cpfcnpj: z
      .string()
      .min(1, "Campo obrigatório")
      .refine((val) => isValidCPF(val), "CPF inválido"),
    senha: z.string().min(1, "Senha obrigatória"),
  });

  const formResponsavelSchema = z.object({
    cpf_responsavel: z
      .string()
      .min(1, "Campo obrigatório")
      .refine((val) => isValidCPF(val), "CPF inválido"),
    email_responsavel: z
      .string()
      .min(1, "Campo obrigatório")
      .email("E-mail inválido"),
  });

  const formMotorista = useForm<z.infer<typeof formMotoristaSchema>>({
    resolver: zodResolver(formMotoristaSchema),
    defaultValues: {
      cpfcnpj: "",
      senha: "",
    },
  });

  const formResponsavel = useForm<z.infer<typeof formResponsavelSchema>>({
    resolver: zodResolver(formResponsavelSchema),
    defaultValues: {
      cpf_responsavel: "",
      email_responsavel: "",
    },
  });

  const handleForgotPassword = useCallback(async () => {
    const cpfDigits = formMotorista.getValues("cpfcnpj")?.replace(/\D/g, "");
    if (!cpfDigits) {
      toast({
        title: "Informe seu CPF",
        description:
          "Digite o CPF cadastrado para receber o link de redefinição em seu e-mail.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRefreshing(true);

      const { data: usuario, error } = await supabase
        .from("usuarios")
        .select("email")
        .eq("cpfcnpj", cpfDigits)
        .single();

      if (error || !usuario?.email) {
        toast({
          title: "CPF não encontrado",
          description:
            "Verifique o número informado. Caso tenha dúvidas, fale com o suporte.",
          variant: "destructive",
        });
        return;
      }

      // Gera versão mascarada do e-mail para exibir no toast
      const maskedEmail = (() => {
        const [user, domain] = usuario.email.split("@");
        const maskedUser =
          user.length <= 3
            ? user[0] + "*".repeat(user.length - 1)
            : user.slice(0, 3) + "*".repeat(user.length - 3);
        const domainParts = domain.split(".");
        const maskedDomain =
          domainParts[0].slice(0, 3) +
          "*".repeat(Math.max(0, domainParts[0].length - 3));
        return `${maskedUser}@${maskedDomain}.${domainParts
          .slice(1)
          .join(".")}`;
      })();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        usuario.email,
        { redirectTo: `${appDomain}/nova-senha` }
      );

      if (resetError) throw resetError;

      toast({
        title: "Link de redefinição enviado",
        description: `Enviamos o link para ${maskedEmail}. Verifique sua caixa de entrada e o spam. O link é válido por tempo limitado.`,
      });
    } catch (err: any) {
      toast({
        title: "Não foi possível enviar o link",
        description:
          "Tente novamente em alguns minutos ou entre em contato com o suporte.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  }, [formMotorista, toast]);

  const handleLoginMotorista = async (data: any) => {
    setLoading(true);

    try {
      const cpfcnpjDigits = data.cpfcnpj.replace(/\D/g, "");
      const { data: usuario, error: usuarioError } = await supabase
        .from("usuarios")
        .select("email, role")
        .eq("cpfcnpj", cpfcnpjDigits)
        .single();

      if (usuarioError || !usuario) {
        formMotorista.setError("cpfcnpj", {
          type: "manual",
          message: "CPF não encontrado",
        });
        setLoading(false);
        return;
      }

      const usuarioData = usuario;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: usuarioData.email,
        password: data.senha,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          formMotorista.setError("senha", {
            type: "manual",
            message: "Senha incorreta",
          });
        } else {
          formMotorista.setError("root", {
            type: "manual",
            message: "Erro inesperado: " + signInError.message,
          });
        }
        setLoading(false);
        return;
      }

      const role = (usuarioData.role as string | undefined) || undefined;
      if (role) {
        localStorage.setItem("app_role", role);
      }
      clearLoginStorageResponsavel();
      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/inicio", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      formMotorista.setError("root", {
        type: "manual",
        message: "Erro inesperado",
      });
      setLoading(false);
    }
  };

  const handleLoginResponsavel = async (
    data: z.infer<typeof formResponsavelSchema>
  ) => {
    const cpf = data.cpf_responsavel.replace(/\D/g, "");
    const email = data.email_responsavel.trim();

    setLoading(true);
    try {
      const passageiros = await responsavelService.loginPorCpfEmail(cpf, email);
      if (!passageiros || passageiros.length === 0) {
        toast({
          title: "Erro ao fazer login",
          description: "Nenhum passageiro foi encontrado.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      localStorage.setItem("responsavel_cpf", cpf);
      localStorage.setItem("responsavel_email", email);
      localStorage.setItem("responsavel_is_logged", "true");

      clearLoginStorageMotorista();

      if (passageiros.length === 1) {
        const p = passageiros[0];
        localStorage.setItem("responsavel_id", p.id);
        localStorage.setItem("responsavel_usuario_id", p.usuario_id);
        navigate("/responsavel/carteirinha");
      } else {
        navigate("/responsavel/selecionar", { state: { passageiros } });
      }
    } catch {
      toast({
        title: "Erro ao fazer login",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-background dark:to-muted p-6">
        <img
          src="/assets/logo-van360.png"
          alt="Van360"
          className="h-16 w-auto mb-4 select-none"
        />

        {/* <Tabs value={tab} onValueChange={setTab} className="w-full max-w-md mb-4">
        <TabsList className="grid w-full grid-cols-2 border">
          <TabsTrigger
            value="motorista"
            className="data-[state=inactive]:text-gray-600 
            data-[state=active]:bg-primary 
            data-[state=active]:text-white"
          >
            Sou Condutor
          </TabsTrigger>
          <TabsTrigger
            value="responsavel"
            className="data-[state=inactive]:text-gray-600 
            data-[state=active]:bg-primary 
            data-[state=active]:text-white 
            hover:bg-gray-100"
          >
            Sou Responsável
          </TabsTrigger>
        </TabsList>
      </Tabs> */}

        {tab === "motorista" && (
          <Card className="w-full max-w-md shadow-lg border border-gray-200">
            <CardContent className="mt-6">
              <Form {...formMotorista}>
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
                  Acesse sua conta
                </h1>
                <form
                  onSubmit={formMotorista.handleSubmit(handleLoginMotorista)}
                  className="space-y-4"
                >
                  <FormField
                    control={formMotorista.control}
                    name="cpfcnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          CPF <span className="text-red-600">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            autoFocus
                            placeholder="000.000.000-00"
                            autoComplete="username"
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
                    control={formMotorista.control}
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
                            placeholder="Digite sua senha"
                            autoComplete="current-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {formMotorista.formState.errors.root && (
                    <div className="text-sm text-destructive">
                      {formMotorista.formState.errors.root.message}
                    </div>
                  )}

                  <div className="pt-6">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Acessando..." : "Acessar"}
                    </Button>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                      Ainda não tem conta?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/cadastro")}
                        className="text-primary font-semibold hover:underline"
                      >
                        Cadastre-se
                      </button>
                    </p>
                  </div>
                  <div className="text-center mt-4">
                    <p
                      className="text-sm text-primary font-semibold hover:underline cursor-pointer"
                      onClick={handleForgotPassword}
                    >
                      Esqueci minha senha
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {tab === "responsavel" && (
          <Card className="w-full max-w-md shadow-lg border border-gray-200">
            <CardContent className="mt-6">
              <Form {...formResponsavel}>
                <form
                  onSubmit={formResponsavel.handleSubmit(
                    handleLoginResponsavel
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={formResponsavel.control}
                    name="cpf_responsavel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          CPF <span className="text-red-600">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000.000.000-00"
                            maxLength={14}
                            value={cpfMask(field.value || "")}
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
                    control={formResponsavel.control}
                    name="email_responsavel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className="text-red-600">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Digite o email do responsável"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-6">
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Acessando..." : "Acessar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>

      <LoadingOverlay active={refreshing} text="Aguarde..." />
    </>
  );
}
