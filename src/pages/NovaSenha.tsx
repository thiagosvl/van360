// React
import { useState } from "react";

// React Router
import { useNavigate } from "react-router-dom";

// Components - UI
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Services
import { supabase } from "@/integrations/supabase/client";

// Utils
import { toast } from "@/utils/notifications/toast";
import { useSEO } from "@/hooks/useSEO";

export default function NovaSenha() {
  // Bloquear indexação da página de redefinição de senha
  useSEO({
    noindex: true,
  });
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRedefinir = async () => {
    if (!senha || !confirmarSenha) {
      toast.error("validacao.campoObrigatorio", {
        description: "Digite e confirme a nova senha.",
      });
      return;
    }

    if (senha !== confirmarSenha) {
      toast.error("validacao.senhasNaoCoincidem", {
        description: "Verifique os campos e tente novamente.",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: senha });
      setLoading(false);

      if (error) {
        if (error.code === "same_password") {
          toast.error("erro.operacao", {
            description: "A nova senha deve ser diferente da senha atual.",
          });
          return;
        }

        toast.error("erro.operacao", {
          description: error.message,
        });
        return;
      }

      toast.success("auth.sucesso.senhaRedefinida", {
        description: "Redirecionando para o sistema...",
      });

      setTimeout(() => navigate("/inicio", { replace: true }), 1200);
    } catch (err: any) {
      setLoading(false);
      toast.error("erro.generico", {
        description: err.message || "Tente novamente mais tarde.",
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
