import { useEffect, useState } from "react";
import { useAdminConfigs, useUpdateConfig, useAdminPlans, useUpdatePlan } from "@/hooks/api/adminHooks";
import { useLayout } from "@/contexts/LayoutContext";
import { Save, Loader2, Settings, Bell, DollarSign, Gift, CreditCard, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ConfigKey } from "@/types/enums";

interface ConfigFieldDef {
  chave: ConfigKey;
  label: string;
  descricao: string;
  tipo: "number" | "boolean" | "text";
  sufixo?: string;
  grupo: string;
}

const GROUP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Notificações": Bell,
  "Financeiro": DollarSign,
  "Indicações": Gift,
};

const CONFIG_DEFS: ConfigFieldDef[] = [
  {
    chave: ConfigKey.PASSAGEIRO_DIAS_AVISO_VENCIMENTO,
    label: "Dias Aviso Vencimento",
    descricao: "Antecedência (dias) para aviso de vencimento ao passageiro.",
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
];

export default function AdminSettings() {
  const { setPageTitle } = useLayout();
  const { data: configs, isLoading: isConfigsLoading } = useAdminConfigs();
  const updateConfig = useUpdateConfig();
  const [values, setValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [savingConfigs, setSavingConfigs] = useState<Set<string>>(new Set());

  const { data: plans, isLoading: isPlansLoading } = useAdminPlans();
  const updatePlan = useUpdatePlan();
  const [planValues, setPlanValues] = useState<Record<string, { valor: string; valor_promocional: string }>>({});
  const [planDirty, setPlanDirty] = useState<Set<string>>(new Set());
  const [savingPlans, setSavingPlans] = useState<Set<string>>(new Set());

  useEffect(() => {
    setPageTitle("Configurações");
  }, [setPageTitle]);

  useEffect(() => {
    if (configs) {
      const map: Record<string, string> = {};
      for (const c of configs) {
        map[c.chave] = c.valor;
      }
      setValues(map);
      setDirty(new Set());
    }
  }, [configs]);

  useEffect(() => {
    if (plans) {
      const map: Record<string, { valor: string; valor_promocional: string }> = {};
      for (const p of plans) {
        map[p.id] = {
          valor: moneyMask(p.valor),
          valor_promocional: p.valor_promocional !== null ? moneyMask(p.valor_promocional) : "",
        };
      }
      setPlanValues(map);
      setPlanDirty(new Set());
    }
  }, [plans]);

  const handleChange = (chave: string, valor: string) => {
    setValues(p => ({ ...p, [chave]: valor }));
    setDirty(p => new Set(p).add(chave));
  };

  const handlePlanChange = (id: string, field: "valor" | "valor_promocional", val: string) => {
    const formatted = moneyMask(val);
    setPlanValues(p => ({
      ...p,
      [id]: {
        ...p[id],
        [field]: formatted,
      },
    }));
    setPlanDirty(p => new Set(p).add(id));
  };

  const handleSave = (chave: string) => {
    setSavingConfigs(p => new Set(p).add(chave));
    updateConfig.mutate(
      { chave, valor: values[chave] },
      {
        onSuccess: () => {
          setDirty(p => {
            const next = new Set(p);
            next.delete(chave);
            return next;
          });
        },
        onSettled: () => {
          setSavingConfigs(p => {
            const next = new Set(p);
            next.delete(chave);
            return next;
          });
        }
      }
    );
  };

  const handleSavePlan = (id: string) => {
    const vals = planValues[id];
    const normalVal = moneyToNumber(vals?.valor);
    if (!vals?.valor || normalVal <= 0) {
      toast.error("O valor normal do plano é obrigatório e deve ser maior que zero.");
      return;
    }

    const promoVal = vals.valor_promocional ? moneyToNumber(vals.valor_promocional) : 0;

    setSavingPlans(p => new Set(p).add(id));
    updatePlan.mutate(
      {
        id,
        data: {
          valor: normalVal,
          valor_promocional: promoVal > 0 ? promoVal : null,
        },
      },
      {
        onSuccess: () => {
          setPlanDirty(p => {
            const next = new Set(p);
            next.delete(id);
            return next;
          });
        },
        onSettled: () => {
          setSavingPlans(p => {
            const next = new Set(p);
            next.delete(id);
            return next;
          });
        }
      }
    );
  };

  const handleSaveAll = () => {
    for (const id of planDirty) {
      const vals = planValues[id];
      const normalVal = moneyToNumber(vals?.valor);
      if (!vals?.valor || normalVal <= 0) {
        toast.error("O valor normal de todos os planos editados deve ser maior que zero.");
        return;
      }
    }

    for (const chave of dirty) {
      updateConfig.mutate({ chave, valor: values[chave] });
    }
    setDirty(new Set());

    for (const id of planDirty) {
      const vals = planValues[id];
      const promoVal = vals.valor_promocional ? moneyToNumber(vals.valor_promocional) : 0;
      updatePlan.mutate({
        id,
        data: {
          valor: moneyToNumber(vals.valor),
          valor_promocional: promoVal > 0 ? promoVal : null,
        },
      });
    }
    setPlanDirty(new Set());
  };

  const totalDirtyCount = dirty.size + planDirty.size;
  const isPending = updateConfig.isPending || updatePlan.isPending;
  const isLoading = isConfigsLoading || isPlansLoading;

  const notificacaoFields = CONFIG_DEFS.filter(f => f.grupo === "Notificações");
  const indicacaoFields = CONFIG_DEFS.filter(f => f.grupo === "Indicações");
  const financeiroFields = CONFIG_DEFS.filter(f => f.grupo === "Financeiro" && f.chave !== ConfigKey.SAAS_PROMOCAO_ATIVA);

  const renderConfigField = (def: ConfigFieldDef) => {
    const currentVal = values[def.chave] ?? "";
    const isDirty = dirty.has(def.chave);

    if (def.tipo === "boolean") {
      return (
        <div key={def.chave} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
          <div>
            <p className="text-xs font-bold text-slate-700">{def.label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{def.descricao}</p>
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
                className="rounded-lg text-[#1a3a5c] hover:bg-[#1a3a5c]/10 px-2"
              >
                {savingConfigs.has(def.chave) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div key={def.chave} className="space-y-2">
        <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          {def.label}
        </Label>
        <p className="text-[10px] text-slate-400 -mt-1">{def.descricao}</p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type={def.tipo === "number" ? "number" : "text"}
              value={currentVal}
              onChange={(e) => handleChange(def.chave, e.target.value)}
              className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] pr-14"
            />
            {def.sufixo && (
              <span className="absolute right-3 top-3 text-[10px] font-bold text-slate-400 uppercase">
                {def.sufixo}
              </span>
            )}
          </div>
          {isDirty && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleSave(def.chave)}
              disabled={savingConfigs.has(def.chave)}
              className="rounded-lg text-[#1a3a5c] hover:bg-[#1a3a5c]/10 h-11 px-3"
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
        <Loader2 className="h-8 w-8 animate-spin text-[#1a3a5c]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <h1 className="text-2xl sm:text-3xl font-headline font-black text-[#1a3a5c] tracking-tight uppercase">
            Configurações
          </h1>
          <p className="text-sm font-semibold text-slate-400">
            Parâmetros globais do ecossistema Van360.
          </p>
        </div>
        {totalDirtyCount > 0 && (
          <Button
            onClick={handleSaveAll}
            disabled={isPending}
            className="rounded-xl h-11 bg-[#1a3a5c] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1a3a5c]/20 hover:bg-[#1a3a5c]/95"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Todas ({totalDirtyCount})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* COLUNA 1 - PLANOS E VALORES */}
        <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight">
              <Landmark className="h-4 w-4" />
              Planos e Valores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {plans?.map((plan) => {
              const vals = planValues[plan.id] || { valor: "", valor_promocional: "" };
              const isDirty = planDirty.has(plan.id);

              return (
                <div key={plan.id} className="space-y-3 pb-5 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-700">{plan.nome}</p>
                    {isDirty && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSavePlan(plan.id)}
                        disabled={savingPlans.has(plan.id)}
                        className="rounded-lg text-[#1a3a5c] hover:bg-[#1a3a5c]/10 h-8 px-2"
                      >
                        {savingPlans.has(plan.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Save className="h-4 w-4 mr-1" />
                        )}
                        Salvar
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Valor Normal
                      </Label>
                      <Input
                        type="text"
                        value={vals.valor}
                        onChange={(e) => handlePlanChange(plan.id, "valor", e.target.value)}
                        className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] px-4"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Valor Promocional
                      </Label>
                      <Input
                        type="text"
                        value={vals.valor_promocional}
                        placeholder="Sem promoção"
                        onChange={(e) => handlePlanChange(plan.id, "valor_promocional", e.target.value)}
                        className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] px-4"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {configs?.find(c => c.chave === ConfigKey.SAAS_PROMOCAO_ATIVA) && (
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700">Preço Promocional Ativo</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
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
                      variant="ghost"
                      onClick={() => handleSave(ConfigKey.SAAS_PROMOCAO_ATIVA)}
                      disabled={savingConfigs.has(ConfigKey.SAAS_PROMOCAO_ATIVA)}
                      className="rounded-lg text-[#1a3a5c] hover:bg-[#1a3a5c]/10 px-2"
                    >
                      {savingConfigs.has(ConfigKey.SAAS_PROMOCAO_ATIVA) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-6 space-y-5">
              {financeiroFields.map(renderConfigField)}
            </div>
          </CardContent>
        </Card>

        {/* COLUNA 2 - NOTIFICAÇÕES E INDICAÇÕES */}
        <div className="space-y-8">
          <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight">
                <Bell className="h-4 w-4" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              {notificacaoFields.map(renderConfigField)}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight">
                <Gift className="h-4 w-4" />
                Indicações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              {indicacaoFields.map(renderConfigField)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
