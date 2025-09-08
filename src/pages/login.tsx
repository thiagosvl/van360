import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cpfCnpjMask } from "@/utils/masks";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useSessionContext } from "@/hooks/useSessionContext";

export default function Login() {
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, motorista, admin, loading: sessionLoading } = useSessionContext();

  useEffect(() => {
    if (!sessionLoading && user) {
      if (admin) {
        navigate("/admin", { replace: true });
      } else if (motorista) {
        navigate("/", { replace: true });
      }
    }
  }, [sessionLoading, user, motorista, admin, navigate]);

  const { errors, validate, validateAll } = useFormValidation({
    cpfCnpj: { required: true },
    password: { required: true, minLength: 6 },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll({ cpfCnpj, password })) {
      return;
    }

    setLoading(true);

    try {
      // First, find the motorista by CPF/CNPJ to get their email
      const { data: motoristaData, error: motoristaError } = await supabase
        .from("motoristas")
        .select("email")
        .eq("cpfCnpj", cpfCnpj.replace(/\D/g, ""))
        .maybeSingle();

      if (motoristaError || !motoristaData) {
        toast({
          title: "Erro",
          description: "CPF/CNPJ não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Try to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: motoristaData.email,
        password,
      });

      if (error) {
        toast({
          title: "Erro",
          description: "Credenciais inválidas",
          variant: "destructive",
        });
        return;
      }

      // Check if the authenticated user is indeed a motorista
      const { data: authMotorista, error: authError } = await supabase
        .from("motoristas")
        .select("*")
        .eq("auth_uid", data.user.id)
        .maybeSingle();

      if (authError || !authMotorista) {
        await supabase.auth.signOut();
        toast({
          title: "Erro",
          description: "Conta de motorista não encontrada",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!",
      });

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login - Motorista</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
              <Input
                id="cpfCnpj"
                type="text"
                value={cpfCnpj}
                onChange={(e) => {
                  const masked = cpfCnpjMask(e.target.value);
                  setCpfCnpj(masked);
                  validate("cpfCnpj", masked);
                }}
                onBlur={() => validate("cpfCnpj", cpfCnpj)}
                placeholder="000.000.000-00"
                className={errors.cpfCnpj ? "border-destructive" : ""}
                aria-invalid={!!errors.cpfCnpj}
              />
              {errors.cpfCnpj && (
                <p className="text-sm text-destructive mt-1">{errors.cpfCnpj}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validate("password", e.target.value);
                }}
                onBlur={() => validate("password", password)}
                placeholder="Digite sua senha"
                className={errors.password ? "border-destructive" : ""}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}