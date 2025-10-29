import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NovaSenha() {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRedefinir = async () => {
    if (!senha || !confirmarSenha) {
      toast({
        title: "Preencha todos os campos",
        description: "Digite e confirme a nova senha.",
        variant: "destructive",
      });
      return;
    }

    if (senha !== confirmarSenha) {
      toast({
        title: "As senhas não coincidem",
        description: "Verifique os campos e tente novamente.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: senha });
      setLoading(false);

      if (error) {
        toast({
          title: "Erro ao redefinir senha",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Já existe sessão ativa pelo token da URL, então só redireciona
      toast({
        title: "Senha redefinida com sucesso!",
        description: "Redirecionando para o sistema...",
      });

      // Aguarda um pequeno delay para o toast aparecer
      setTimeout(() => navigate("/inicio", { replace: true }), 1200);
    } catch (err: any) {
      setLoading(false);
      toast({
        title: "Erro inesperado",
        description: err.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
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
            Redefinir senha
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nova senha <span className="text-red-600">*</span>
              </label>
              <Input
                type="password"
                placeholder="Digite sua nova senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar nova senha <span className="text-red-600">*</span>
              </label>
              <Input
                type="password"
                placeholder="Confirme sua nova senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </div>

            <Button
              onClick={handleRedefinir}
              className="w-full mt-4"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Redefinir senha"}
            </Button>

            <div className="text-center mt-4">
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-primary font-semibold hover:underline"
              >
                Voltar ao login
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
