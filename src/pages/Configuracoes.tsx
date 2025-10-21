import { Badge } from "@/components/ui/badge";
import { configuracoesMotoristaService } from "@/services/configuracoesMotoristaService";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLayout } from "@/contexts/LayoutContext";
import { PullToRefreshWrapper } from "@/hooks/PullToRefreshWrapper";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ConfiguracoesMotorista } from "@/types/configuracoesMotorista";
import { Eye, Loader2, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MessageEditor = ({
  id,
  label,
  value,
  onChange,
  variables,
  error,
  onPreview,
}: {
  id: keyof ConfiguracoesMotorista;
  label: string;
  value: string;
  onChange: (field: keyof ConfiguracoesMotorista, value: string) => void;
  variables: string[];
  error?: string;
  onPreview: () => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleVariableClick = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const charBefore = text.substring(start - 1, start);
    const prefix =
      start > 0 && charBefore !== " " && charBefore !== "\n" ? " " : "";
    const newText =
      text.substring(0, start) + prefix + variable + "" + text.substring(end);
    onChange(id, newText);
    setTimeout(() => {
      textarea.focus();
      const newCursorPosition = start + prefix.length + variable.length + 1;
      textarea.selectionStart = textarea.selectionEnd = newCursorPosition;
    }, 0);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={id} className="font-semibold">
          {label}
        </Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={onPreview}
          className="text-xs h-8"
        >
          <Eye className="w-4 h-4 mr-2" />
          Pré-visualizar
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {variables.map((variable) => (
          <Badge
            key={variable}
            variant={isFocused ? "default" : "secondary"}
            className="cursor-pointer hover:opacity-80"
            onClick={() => handleVariableClick(variable)}
          >
            {variable}
          </Badge>
        ))}
      </div>
      <Textarea
        id={id}
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        rows={5}
        className={cn(error && "border-red-500 focus-visible:ring-red-500")}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <div className="flex justify-between items-center">
        {error ? <p className="text-sm text-red-500">{error}</p> : <div />}
        <p className="text-xs text-muted-foreground">
          {value.length} / 300 caracteres
        </p>
      </div>
    </div>
  );
};

type FormErrors = Partial<Record<keyof ConfiguracoesMotorista, string>>;

export default function Configuracoes() {
  const { setPageTitle, setPageSubtitle } = useLayout();
  const [configuracoes, setConfiguracoes] =
    useState<ConfiguracoesMotorista | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [previewData, setPreviewData] = useState({
    isOpen: false,
    title: "",
    content: "",
  });
  const { toast } = useToast();
  const userId = localStorage.getItem("app_user_id");

  const commonVariables = [
    "{{nome_responsavel}}",
    "{{nome_passageiro}}",
    "{{valor}}",
    "{{vencimento}}",
  ];

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  useEffect(() => {
    setPageTitle("Configurações");
    setPageSubtitle("Ajustes de notificações e sistema");
  }, [setPageTitle, setPageSubtitle]);

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
      toast({
        title: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoadingPage(false);
    }
  };

  const handleChange = (field: keyof ConfiguracoesMotorista, value: any) => {
    if (!configuracoes) return;
    let processedValue = value;
    if (field === "dias_antes_vencimento" || field === "dias_apos_vencimento") {
      let numValue = Number(value);
      if (numValue > 7) numValue = 7;
      if (numValue < 0) numValue = 0;
      processedValue = numValue;
    }
    setConfiguracoes({ ...configuracoes, [field]: processedValue });
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    if (!configuracoes) return false;
    const newErrors: FormErrors = {};
    if (!configuracoes.horario_envio) {
      newErrors.horario_envio = "O horário é obrigatório.";
    }
    if ((configuracoes.dias_antes_vencimento ?? 0) <= 0) {
      newErrors.dias_antes_vencimento = "O valor deve ser no mínimo 1.";
    }
    if ((configuracoes.dias_apos_vencimento ?? 0) <= 0) {
      newErrors.dias_apos_vencimento = "O valor deve ser no mínimo 1.";
    }
    if (!configuracoes.mensagem_lembrete_antecipada?.trim()) {
      newErrors.mensagem_lembrete_antecipada = "A mensagem é obrigatória.";
    }
    if (!configuracoes.mensagem_lembrete_dia?.trim()) {
      newErrors.mensagem_lembrete_dia = "A mensagem é obrigatória.";
    }
    if (!configuracoes.mensagem_lembrete_atraso?.trim()) {
      newErrors.mensagem_lembrete_atraso = "A mensagem é obrigatória.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !configuracoes) {
      toast({
        title: "Corrija os erros no formulário.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    setErrors({});
    try {
      await configuracoesMotoristaService.saveConfiguracoes(configuracoes);
      toast({
        title: "Configurações atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = (title: string, messageText: string) => {
    const exampleData = {
      "{{nome_responsavel}}": "Ana Souza",
      "{{nome_passageiro}}": "Júnior",
      "{{valor}}": (250).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      "{{vencimento}}": new Date(
        new Date().setDate(new Date().getDate() + 5)
      ).toLocaleDateString("pt-BR"),
    };
    let processedText = messageText;
    for (const [variable, exampleValue] of Object.entries(exampleData)) {
      processedText = processedText.replaceAll(variable, exampleValue);
    }
    setPreviewData({
      isOpen: true,
      title: `Pré-visualização: ${title}`,
      content: processedText,
    });
  };

  if (loadingPage) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const pullToRefreshReload = async () => {
    fetchConfiguracoes();
  };

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Configurações
            </h1>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Escolas
                </CardTitle>
                <CardDescription>
                  Defina quando e com que frequência as notificações automáticas
                  serão enviadas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="horario_envio">
                    Horário de envio dos lembretes
                  </Label>
                  <Input
                    id="horario_envio"
                    type="time"
                    value={configuracoes?.horario_envio || ""}
                    onChange={(e) =>
                      handleChange("horario_envio", e.target.value)
                    }
                    className={cn(
                      errors.horario_envio &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {errors.horario_envio && (
                    <p className="text-sm text-red-500">
                      {errors.horario_envio}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dias_antes_vencimento">
                    Lembrete antecipado (dias antes)
                  </Label>
                  <Input
                    id="dias_antes_vencimento"
                    type="number"
                    min="1"
                    max="7"
                    value={configuracoes?.dias_antes_vencimento ?? 1}
                    onChange={(e) =>
                      handleChange("dias_antes_vencimento", e.target.value)
                    }
                    className={cn(
                      errors.dias_antes_vencimento &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {errors.dias_antes_vencimento ? (
                    <p className="text-sm text-red-500">
                      {errors.dias_antes_vencimento}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Mínimo de 1 e máximo de 7 dias.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dias_apos_vencimento">
                    Lembrete de atraso (dias após)
                  </Label>
                  <Input
                    id="dias_apos_vencimento"
                    type="number"
                    min="1"
                    max="7"
                    value={configuracoes?.dias_apos_vencimento ?? 1}
                    onChange={(e) =>
                      handleChange("dias_apos_vencimento", e.target.value)
                    }
                    className={cn(
                      errors.dias_apos_vencimento &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {errors.dias_apos_vencimento ? (
                    <p className="text-sm text-red-500">
                      {errors.dias_apos_vencimento}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Mínimo de 1 e máximo de 7 dias.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Modelos de Mensagem
                </CardTitle>
                <CardDescription>
                  Personalize o texto que será enviado aos seus clientes em cada
                  etapa da cobrança.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <MessageEditor
                  id="mensagem_lembrete_antecipada"
                  label="Mensagem Notificação Antecipada"
                  value={configuracoes?.mensagem_lembrete_antecipada || ""}
                  onChange={handleChange}
                  variables={commonVariables}
                  error={errors.mensagem_lembrete_antecipada}
                  onPreview={() =>
                    handlePreview(
                      "Notificação Antecipada",
                      configuracoes?.mensagem_lembrete_antecipada || ""
                    )
                  }
                />
                <MessageEditor
                  id="mensagem_lembrete_dia"
                  label="Mensagem Dia de Vencimento"
                  value={configuracoes?.mensagem_lembrete_dia || ""}
                  onChange={handleChange}
                  variables={commonVariables}
                  error={errors.mensagem_lembrete_dia}
                  onPreview={() =>
                    handlePreview(
                      "Dia de Vencimento",
                      configuracoes?.mensagem_lembrete_dia || ""
                    )
                  }
                />
                <MessageEditor
                  id="mensagem_lembrete_atraso"
                  label="Mensagem Cobrança Atrasada"
                  value={configuracoes?.mensagem_lembrete_atraso || ""}
                  onChange={handleChange}
                  variables={commonVariables}
                  error={errors.mensagem_lembrete_atraso}
                  onPreview={() =>
                    handlePreview(
                      "Cobrança Atrasada",
                      configuracoes?.mensagem_lembrete_atraso || ""
                    )
                  }
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog
          open={previewData.isOpen}
          onOpenChange={(isOpen) => setPreviewData({ ...previewData, isOpen })}
        >
          <DialogContent className="sm:max-w-md max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewData.title}</DialogTitle>
            </DialogHeader>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md border bg-muted p-4 text-sm">
              <p>{previewData.content}</p>
            </div>
          </DialogContent>
        </Dialog>
      </PullToRefreshWrapper>
    </>
  );
}
