import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useSessionContext } from "@/hooks/useSessionContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, admin, loading: sessionLoading } = useSessionContext();

  useEffect(() => {
    if (!sessionLoading && user && admin) {
      navigate("/admin", { replace: true });
    }
  }, [sessionLoading, user, admin, navigate]);

  const { errors, validate, validateAll } = useFormValidation({
    email: { required: true, email: true },
    password: { required: true, minLength: 6 },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll({ email, password })) {
      return;
    }

    setLoading(true);

    try {
      // Try to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
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

      // Check if the authenticated user is indeed an admin
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("auth_uid", data.user.id)
        .maybeSingle();

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        toast({
          title: "Erro",
          description: "Não autorizado (admin)",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!",
      });

      navigate("/admin");
    } catch (error) {
      console.error("Admin login error:", error);
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
          <CardTitle>Login - Administrador</CardTitle>
          <CardDescription>
            Entre com suas credenciais de administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validate("email", e.target.value);
                }}
                onBlur={() => validate("email", email)}
                placeholder="admin@exemplo.com"
                className={errors.email ? "border-destructive" : ""}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
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