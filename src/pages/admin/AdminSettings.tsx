import { useEffect, useState } from "react";
import { useAdminConfigs, useUpdateConfig, useAdminPlans, useUpdatePlan } from "@/hooks/api/adminHooks";
import { useLayout } from "@/contexts/LayoutContext";
import { Save, Loader2, Settings, Bell, DollarSign, Gift, CreditCard, Landmark, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ConfigKey } from "@/types/enums";

interface ConfigFieldDef {
  chave: ConfigKey;
  label: string;
  descricao: string;
  tipo: "number" | "boolean" | "text" | "textarea";
  sufixo?: string;
  step?: string;
  grupo: string;
}

const CONFIG_DEFS: ConfigFieldDef[] = [
  {
    chave: ConfigKey.TAXA_COBRANCA_AUTOMATICA_PADRAO,
    label: "Taxa Padrão Cobrança Automática (Pix BaaS)",
    descricao: "Valor padrão em reais retido pela plataforma por cobrança Pix emitida/paga (usado quando o motorista não possui taxa personalizada).",
    tipo: "number",
    step: "0.01",
    sufixo: "R$",
    grupo: "Financeiro",
  },
  {
    chave: ConfigKey.PASSAGEIRO_DIAS_AVISO_VENCIMENTO,
    label: "Dias Aviso Vencimento",
    descricao: "Antecedência (dias) para aviso de vencimento ao aluno.",
    tipo: "number",
    sufixo: "dias",
    grupo: "Notificações",
  },
  {
    chave: ConfigKey.SAAS_DIAS_VENCIMENTO,
    label: "Dias de Validade do Pix / Fatura",
    descricao: "Quantidade de dias para expiração do Pix gerado ou vencimento da fatura emitida a partir de sua criação.",
    tipo: "number",
    sufixo: "dias",
    grupo: "Financeiro",
  },
  {
    chave: ConfigKey.SAAS_DIAS_ANTECEDENCIA_RENOVACAO,
    label: "Antecedência de Renovação",
    descricao: "Quantidade de dias de antecedência antes do vencimento do plano atual para o robô emitir e cobrar a próxima fatura.",
    tipo: "number",
    sufixo: "dias",
    grupo: "Financeiro",
  },
  {
    chave: ConfigKey.SAAS_DIAS_CARENCIA,
    label: "Dias de Carência",
    descricao: "Tolerância em dias antes de bloquear o acesso por atraso.",
    tipo: "number",
    sufixo: "dias",
    grupo: "Financeiro",
  },
  {
    chave: ConfigKey.SAAS_DIAS_AVISO_TRIAL,
    label: "Aviso Fim de Trial",
    descricao: "Antecedência em dias para avisar o fim do período de teste.",
    tipo: "number",
    sufixo: "dias",
    grupo: "Notificações",
  },
  {
    chave: ConfigKey.SAAS_PROMOCAO_ATIVA,
    label: "Preço Promocional",
    descricao: "Habilita o preço promocional para novas assinaturas.",
    tipo: "boolean",
    grupo: "Financeiro",
  },
  {
    chave: ConfigKey.SAAS_MAX_TENTATIVAS_CARTAO,
    label: "Tentativas de Cartão",
    descricao: "Máximo de tentativas automáticas de cobrança via cartão.",
    tipo: "number",
    sufixo: "vezes",
    grupo: "Financeiro",
  },
  {
    chave: ConfigKey.SAAS_REFERRAL_BONUS_DAYS,
    label: "Bônus por Indicação",
    descricao: "Dias de bônus adicionados ao indicador quando a indicação é concluída.",
    tipo: "number",
    sufixo: "dias",
    grupo: "Indicações",
  },
  {
    chave: ConfigKey.SAAS_REFERRAL_DISCOUNT_PCT,
    label: "Desconto ao Convidado",
    descricao: "Percentual de desconto na primeira mensalidade do convidado.",
    tipo: "number",
    sufixo: "%",
    grupo: "Indicações",
  },
  {
    chave: ConfigKey.APP_ANDROID_MIN_VERSION,
    label: "Versão Mínima do App (Android)",
    descricao: "Versão mínima obrigatória na Play Store. Usuários abaixo desta versão serão bloqueados até atualizarem.",
    tipo: "text",
    grupo: "Aplicativo Mobile",
  },
  {
    chave: ConfigKey.APP_ANDROID_LATEST_VERSION,
    label: "Versão Mais Recente (Android)",
    descricao: "Versão mais nova aprovada na Play Store (exibe aviso opcional de atualização se o app estiver entre a mínima e a mais recente).",
    tipo: "text",
    grupo: "Aplicativo Mobile",
  },
  {
    chave: ConfigKey.APP_ANDROID_UPDATE_TITLE,
    label: "Título da Atualização (Android)",
    descricao: "Título exibido no modal de nova versão no aplicativo Android.",
    tipo: "text",
    grupo: "Aplicativo Mobile",
  },
  {
    chave: ConfigKey.APP_ANDROID_UPDATE_MESSAGE,
    label: "Mensagem da Atualização (Android)",
    descricao: "Texto com as novidades ou explicação do update exibido no modal Android.",
    tipo: "textarea",
    grupo: "Aplicativo Mobile",
  },
  {
    chave: ConfigKey.APP_IOS_MIN_VERSION,
    label: "Versão Mínima do App (iOS)",
    descricao: "Versão mínima obrigatória na App Store. Usuários abaixo desta versão serão bloqueados até atualizarem.",
    tipo: "text",
    grupo: "Aplicativo Mobile",
  },
  {
    chave: ConfigKey.APP_IOS_LATEST_VERSION,
    label: "Versão Mais Recente (iOS)",
    descricao: "Versão mais nova aprovada na App Store (exibe aviso opcional de atualização se o app estiver entre a mínima e a mais recente).",
    tipo: "text",
    grupo: "Aplicativo Mobile",
  },
  {
    chave: ConfigKey.APP_IOS_UPDATE_TITLE,
    label: "Título da Atualização (iOS)",
    descricao: "Título exibido no modal de nova versão no aplicativo iOS.",
    tipo: "text",
    grupo: "Aplicativo Mobile",
  },
  {
    chave: ConfigKey.APP_IOS_UPDATE_MESSAGE,
    label: "Mensagem da Atualização (iOS)",
    descricao: "Texto com as novidades ou explicação do update exibido no modal iOS.",
    tipo: "textarea",
    grupo: "Aplicativo Mobile",
  },
];

export default function AdminSettings() {
  const { setPageTitle } = useLayout();
  const { data: configs, isLoading: isLoadingConfigs } = useAdminConfigs();
  const { data: plans, isLoading: isLoadingPlans } = useAdminPlans();
  const updateConfig = useUpdateConfig();
  const updatePlan = useUpdatePlan();

  const [values, setValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [savingConfigs, setSavingConfigs] = useState<Set<string>>(new Set());

  const [planValues, setPlanValues] = useState<Record<string, { valor: string; valor_promocional: string }>>({});
  const [planDirty, setPlanDirty] = useState<Set<string>>(new Set());
  const [savingPlans, setSavingPlans] = useState<Set<string>>(new Set());

  useEffect(() => {
    setPageTitle("Configurações");
  }, [setPageTitle]);

  useEffect(() => {
    if (configs) {
      const initial: Record<string, string> = {};
      configs.forEach((c) => {
        initial[c.chave] = c.valor;
      });
      setValues(initial);
      setDirty(new Set());
    }
  }, [configs]);

  useEffect(() => {
    if (plans) {
      const initial: Record<string, { valor: string; valor_promocional: string }> = {};
      plans.forEach((p) => {
        initial[p.id] = {
          valor: p.valor !== null && p.valor !== undefined ? moneyMask((p.valor * 100).toString()) : "",
          valor_promocional: p.valor_promocional !== null && p.valor_promocional !== undefined ? moneyMask((p.valor_promocional * 100).toString()) : "",
        };
      });
      setPlanValues(initial);
      setPlanDirty(new Set());
    }
  }, [plans]);

  const handleChange = (chave: string, val: string) => {
    setValues((prev) => ({ ...prev, [chave]: val }));
    setDirty((prev) => new Set(prev).add(chave));
  };

  const handlePlanChange = (planId: string, field: "valor" | "valor_promocional", raw: string) => {
    const masked = moneyMask(raw.replace(/\D/g, ""));
    setPlanValues((prev) => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [field]: masked,
      },
    }));
    setPlanDirty((prev) => new Set(prev).add(planId));
  };

  const handleSave = async (chave: string) => {
    setSavingConfigs((prev) => new Set(prev).add(chave));
    try {
      await updateConfig.mutateAsync({ chave, valor: values[chave] ?? "" });
      setDirty((prev) => {
        const next = new Set(prev);
        next.delete(chave);
        return next;
      });
    } catch {
      // toast error handled by hook
    } finally {
      setSavingConfigs((prev) => {
        const next = new Set(prev);
        next.delete(chave);
        return next;
      });
    }
  };

  const handleSavePlan = async (planId: string) => {
    setSavingPlans((prev) => new Set(prev).add(planId));
    try {
      const pv = planValues[planId];
      const valorNum = pv.valor ? moneyToNumber(pv.valor) : 0;
      const valorPromoNum = pv.valor_promocional ? moneyToNumber(pv.valor_promocional) : null;

      await updatePlan.mutateAsync({
        id: planId,
        data: {
          valor: valorNum,
          valor_promocional: valorPromoNum,
        },
      });
      setPlanDirty((prev) => {
        const next = new Set(prev);
        next.delete(planId);
        return next;
      });
    } catch {
      // handled
    } finally {
      setSavingPlans((prev) => {
        const next = new Set(prev);
        next.delete(planId);
        return next;
      });
    }
  };

  const handleSaveAll = async () => {
    const configKeysToSave = Array.from(dirty);
    const planIdsToSave = Array.from(planDirty);

    for (const key of configKeysToSave) {
      await handleSave(key);
    }
    for (const pid of planIdsToSave) {
      await handleSavePlan(pid);
    }
  };

  const isLoading = isLoadingConfigs || isLoadingPlans;
  const isPending = updateConfig.isPending || updatePlan.isPending;
  const totalDirtyCount = dirty.size + planDirty.size;

  const financeiroFields = CONFIG_DEFS.filter((d) => d.grupo === "Financeiro" && d.tipo !== "boolean");
  const notificacaoFields = CONFIG_DEFS.filter((d) => d.grupo === "Notificações");
  const indicacaoFields = CONFIG_DEFS.filter((d) => d.grupo === "Indicações");
  const mobileFields = CONFIG_DEFS.filter((d) => d.grupo === "Aplicativo Mobile");

  const renderConfigField = (def: ConfigFieldDef) => {
    const currentVal = values[def.chave] ?? "";
    const isDirty = dirty.has(def.chave);

    if (def.tipo === "boolean") {
      return (
        <div key={def.chave} className="flex items-center justify-between py-3 border-b border-border last:border-0">
          <div>
            <p className="text-xs font-medium text-foreground">{def.label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{def.descricao}</p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={currentVal === "true"}
              onCheckedChange={(val) => handleChange(def.chave, val ? "true" : "false")}
            />
            {isDirty && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSave(def.chave)}
                disabled={savingConfigs.has(def.chave)}
                className="rounded-lg text-primary hover:bg-secondary px-2 h-8"
              >
                {savingConfigs.has(def.chave) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (def.tipo === "textarea") {
      return (
        <div key={def.chave} className="space-y-1.5 text-left">
          <div>
            <Label className="text-xs font-medium text-foreground">{def.label}</Label>
            <p className="text-[11px] text-muted-foreground mt-0.5">{def.descricao}</p>
          </div>
          <div className="flex items-start gap-2">
            <Textarea
              rows={4}
              value={currentVal}
              onChange={(e) => handleChange(def.chave, e.target.value)}
              className="rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground text-sm focus-visible:ring-0 focus:border-primary resize-y"
            />
            {isDirty && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSave(def.chave)}
                disabled={savingConfigs.has(def.chave)}
                className="rounded-lg text-primary hover:bg-secondary h-9 px-3 mt-1"
              >
                {savingConfigs.has(def.chave) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div key={def.chave} className="space-y-1.5 text-left">
        <div>
          <Label className="text-xs font-medium text-foreground">{def.label}</Label>
          <p className="text-[11px] text-muted-foreground mt-0.5">{def.descricao}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type={def.tipo === "number" ? "number" : "text"}
              step={def.step || (def.tipo === "number" ? "1" : undefined)}
              value={currentVal}
              onChange={(e) => handleChange(def.chave, e.target.value)}
              className="h-9 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground text-sm focus-visible:ring-0 focus:border-primary pr-14"
            />
            {def.sufixo && (
              <span className="absolute right-3 top-2.5 text-[10px] font-medium text-muted-foreground">
                {def.sufixo}
              </span>
            )}
          </div>
          {isDirty && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSave(def.chave)}
              disabled={savingConfigs.has(def.chave)}
              className="rounded-lg text-primary hover:bg-secondary h-9 px-3"
            >
              {savingConfigs.has(def.chave) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Configurações
          </h1>
          <p className="text-xs text-muted-foreground">
            Parâmetros globais do ecossistema Van360.
          </p>
        </div>
        {totalDirtyCount > 0 && (
          <Button
            onClick={handleSaveAll}
            disabled={isPending}
            className="rounded-lg h-9 bg-primary text-primary-foreground text-xs font-medium shadow-xs hover:bg-primary/90"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Salvar todas ({totalDirtyCount})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* COLUNA 1 - PLANOS E VALORES */}
        <Card className="border border-border shadow-xs rounded-xl overflow-hidden bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Landmark className="h-4 w-4 text-primary" />
              Planos e valores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {plans?.map((plan) => {
              const vals = planValues[plan.id] || { valor: "", valor_promocional: "" };
              const isDirty = planDirty.has(plan.id);

              return (
                <div key={plan.id} className="space-y-3 pb-5 border-b border-border last:border-0 last:pb-0 text-left">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">{plan.nome}</p>
                    {isDirty && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSavePlan(plan.id)}
                        disabled={savingPlans.has(plan.id)}
                        className="rounded-lg text-primary hover:bg-secondary h-8 px-2.5 text-xs font-medium"
                      >
                        {savingPlans.has(plan.id) ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : (
                          <Save className="h-3.5 w-3.5 mr-1" />
                        )}
                        Salvar
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Valor normal
                      </Label>
                      <Input
                        type="text"
                        value={vals.valor}
                        onChange={(e) => handlePlanChange(plan.id, "valor", e.target.value)}
                        className="h-9 rounded-lg bg-background border-border text-foreground text-sm focus-visible:ring-0 focus:border-primary px-3"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Valor promocional
                      </Label>
                      <Input
                        type="text"
                        value={vals.valor_promocional}
                        placeholder="Sem promoção"
                        onChange={(e) => handlePlanChange(plan.id, "valor_promocional", e.target.value)}
                        className="h-9 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground text-sm focus-visible:ring-0 focus:border-primary px-3"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {configs?.find(c => c.chave === ConfigKey.SAAS_PROMOCAO_ATIVA) && (
              <div className="pt-2 flex items-center justify-between text-left">
                <div>
                  <p className="text-xs font-medium text-foreground">Preço promocional ativo</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Habilita globalmente os preços promocionais configurados acima para novos motoristas.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={values[ConfigKey.SAAS_PROMOCAO_ATIVA] === "true"}
                    onCheckedChange={(val) => handleChange(ConfigKey.SAAS_PROMOCAO_ATIVA, val ? "true" : "false")}
                  />
                  {dirty.has(ConfigKey.SAAS_PROMOCAO_ATIVA) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSave(ConfigKey.SAAS_PROMOCAO_ATIVA)}
                      disabled={savingConfigs.has(ConfigKey.SAAS_PROMOCAO_ATIVA)}
                      className="rounded-lg text-primary hover:bg-secondary h-8 px-2"
                    >
                      {savingConfigs.has(ConfigKey.SAAS_PROMOCAO_ATIVA) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-6 space-y-5">
              {financeiroFields.map(renderConfigField)}
            </div>
          </CardContent>
        </Card>

        {/* COLUNA 2 - NOTIFICAÇÕES E INDICAÇÕES */}
        <div className="space-y-6">
          <Card className="border border-border shadow-xs rounded-xl overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Bell className="h-4 w-4 text-primary" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              {notificacaoFields.map(renderConfigField)}
            </CardContent>
          </Card>

          <Card className="border border-border shadow-xs rounded-xl overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Gift className="h-4 w-4 text-purple-400" />
                Indicações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              {indicacaoFields.map(renderConfigField)}
            </CardContent>
          </Card>

          <Card className="border border-border shadow-xs rounded-xl overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Smartphone className="h-4 w-4 text-emerald-400" />
                Aplicativo Mobile (Play Store & App Store)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              {mobileFields.map(renderConfigField)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
