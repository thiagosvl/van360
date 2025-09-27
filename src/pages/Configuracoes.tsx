import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ConfiguracoesMotorista } from "@/types/configuracoesMotorista";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Configuracoes() {
  const [configuracoes, setConfiguracoes] =
    useState<ConfiguracoesMotorista | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const userId = localStorage.getItem("app_user_id");

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  const fetchConfiguracoes = async () => {
    setLoadingPage(true);
    try {
      const { data, error } = await supabase
        .from("configuracoes_motoristas")
        .select("*")
        .eq("usuario_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (!data) {
        const { data: created, error: insertError } = await supabase
          .from("configuracoes_motoristas")
          .insert([{ usuario_id: userId }])
          .select()
          .single();
        if (insertError) throw insertError;
        setConfiguracoes(created);
      } else {
        setConfiguracoes(data);
      }
    } catch (error) {
      console.error("Erro ao buscar/criar configurações:", error);
    } finally {
      setLoadingPage(false);
    }
  };

  const handleChange = (field: keyof ConfiguracoesMotorista, value: any) => {
    if (!configuracoes) return;
    setConfiguracoes({ ...configuracoes, [field]: value });
  };

  const handleSave = async () => {
    if (!configuracoes) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("configuracoes_motoristas")
        .update({
          horario_envio: configuracoes.horario_envio,
          mensagem_lembrete_antecipada:
            configuracoes.mensagem_lembrete_antecipada,
          mensagem_lembrete_dia: configuracoes.mensagem_lembrete_dia,
          mensagem_lembrete_atraso: configuracoes.mensagem_lembrete_atraso,
          dias_antes_vencimento: configuracoes.dias_antes_vencimento,
          dias_apos_vencimento: configuracoes.dias_apos_vencimento,
          updated_at: new Date().toISOString(),
        })
        .eq("id", configuracoes.id);

      if (error) {
        console.error("Erro ao salvar configurações:", error);
        toast({
          title: "Erro ao salvar",
          description:
            "Não foi possível salvar as configurações. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um problema ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Configurações
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configurações do Motorista</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="horario_envio">
                Horário de envio dos lembretes
              </Label>
              <Input
                id="horario_envio"
                type="time"
                value={configuracoes?.horario_envio || ""}
                onChange={(e) => handleChange("horario_envio", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dias_antes_vencimento">
                Dias antes do vencimento
              </Label>
              <Input
                id="dias_antes_vencimento"
                type="number"
                min="0"
                value={configuracoes?.dias_antes_vencimento ?? 0}
                onChange={(e) =>
                  handleChange("dias_antes_vencimento", Number(e.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dias_apos_vencimento">
                Dias após o vencimento
              </Label>
              <Input
                id="dias_apos_vencimento"
                type="number"
                min="0"
                value={configuracoes?.dias_apos_vencimento ?? 0}
                onChange={(e) =>
                  handleChange("dias_apos_vencimento", Number(e.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem_lembrete_antecipada">
                Mensagem Lembrete Antecipada
              </Label>
              <Textarea
                id="mensagem_lembrete_antecipada"
                value={configuracoes?.mensagem_lembrete_antecipada || ""}
                onChange={(e) =>
                  handleChange("mensagem_lembrete_antecipada", e.target.value)
                }
              />
              <p className="text-xs text-muted-foreground">
                Use variáveis como {"{{nome_responsavel}}"},{" "}
                {"{{nome_passageiro}}"}, {"{{valor}}"}, {"{{vencimento}}"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem_lembrete_dia">
                Mensagem Dia de Vencimento
              </Label>
              <Textarea
                id="mensagem_lembrete_dia"
                value={configuracoes?.mensagem_lembrete_dia || ""}
                onChange={(e) =>
                  handleChange("mensagem_lembrete_dia", e.target.value)
                }
              />
              <p className="text-xs text-muted-foreground">
                Use variáveis como {"{{nome_responsavel}}"},{" "}
                {"{{nome_passageiro}}"}, {"{{valor}}"}, {"{{vencimento}}"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem_lembrete_atraso">
                Mensagem Mensalidade Atrasada
              </Label>
              <Textarea
                id="mensagem_lembrete_atraso"
                value={configuracoes?.mensagem_lembrete_atraso || ""}
                onChange={(e) =>
                  handleChange("mensagem_lembrete_atraso", e.target.value)
                }
              />
              <p className="text-xs text-muted-foreground">
                Use variáveis como {"{{nome_responsavel}}"},{" "}
                {"{{nome_passageiro}}"}, {"{{valor}}"}, {"{{vencimento}}"}
              </p>
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
