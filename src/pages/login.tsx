import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useSessionContext } from "@/hooks/useSessionContext";
import { supabase } from "@/integrations/supabase/client";
import { cpfCnpjMask } from "@/utils/masks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, motorista, admin, loading: sessionLoading } = useSessionContext();

  useEffect(() => {
    // Only redirect motoristas who are already logged in
    if (!sessionLoading && user && motorista) {
      navigate("/", { replace: true });
    }
  }, [sessionLoading, user, motorista, navigate]);

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
      const cpfCnpjSemMascara = cpfCnpj.replace(/\D/g, "");
      
      // Find the motorista by CPF/CNPJ to get their email
      const { data: motoristaData, error: motoristaError } = await supabase
        .from("motoristas")
        .select("email, auth_uid")
        .eq("cpfCnpj", cpfCnpjSemMascara)
        .maybeSingle();

      if (motoristaError || !motoristaData) {
        toast({
          title: "Erro",
          description: "Motorista não encontrado com este CPF/CNPJ",
          variant: "destructive",
        });
        return;
      }

      // Sign in with email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: motoristaData.email,
        password,
      });

      if (authError) {
        toast({
          title: "Erro",
          description: "CPF/CNPJ ou senha incorretos",
          variant: "destructive",
        });
        return;
      }

      // Verify if the authenticated user matches the motorista record
      if (motoristaData.auth_uid && motoristaData.auth_uid !== authData.user.id) {
        await supabase.auth.signOut();
        toast({
          title: "Erro",
          description: "Este usuário não está associado ao motorista encontrado",
          variant: "destructive",
        });
        return;
      }

      // If auth_uid is null, update it
      if (!motoristaData.auth_uid) {
        const { error: updateError } = await supabase
          .from("motoristas")
          .update({ auth_uid: authData.user.id })
          .eq("cpfCnpj", cpfCnpjSemMascara);

        if (updateError) {
          console.error("Error updating motorista auth_uid:", updateError);
        }
      }

      // Final verification - check if user has motorista record
      const { data: verifyMotorista, error: verifyError } = await supabase
        .from("motoristas")
        .select("*")
        .eq("auth_uid", authData.user.id)
        .maybeSingle();

      if (verifyError || !verifyMotorista) {
        await supabase.auth.signOut();
        toast({
          title: "Erro",
          description: "Usuário não autorizado como motorista",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!",
      });

      navigate("/dashboard");
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