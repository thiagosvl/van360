import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Banner } from "@/components/ui/Banner";
import { DollarSign, Loader2, Save, ArrowUpRight } from "lucide-react";
import { MotoristaConfiguracaoFinanceira } from "@/types/admin-repasse";
import {
  useAdminMotoristaFinanceiro,
  useAdminUpdateMotoristaFinanceiro,
} from "@/hooks/api/admin/useAdminMotoristaFinanceiroHooks";

import { isUserInBaaSWhitelist } from "@/utils/featureFlagUtils";

interface AdminUserFinancialConfigCardProps {
  userId: string;
  initialConfig?: MotoristaConfiguracaoFinanceira | null;
  userEmail?: string | null;
  userPhone?: string | null;
}

export function AdminUserFinancialConfigCard({
  userId,
  initialConfig,
  userEmail,
  userPhone,
}: AdminUserFinancialConfigCardProps) {
  const { data: configFromQuery, isLoading } = useAdminMotoristaFinanceiro(userId);
  const updateMutation = useAdminUpdateMotoristaFinanceiro();

  const config = configFromQuery || initialConfig;

  const [formData, setFormData] = useState({
    chave_pix_repasse: "",
    tipo_chave_pix: "CPF",
    cobranca_automatica_ativa: false,
    taxa_personalizada: "",
    repassar_taxa_pais_padrao: false,
    enviar_recibo_automatico: true,
  });

  useEffect(() => {
    if (config) {
      setFormData({
        chave_pix_repasse: config.chave_pix_repasse || "",
        tipo_chave_pix: config.tipo_chave_pix || "CPF",
        cobranca_automatica_ativa: Boolean(config.cobranca_automatica_ativa),
        taxa_personalizada:
          config.taxa_personalizada !== null && config.taxa_personalizada !== undefined
            ? String(config.taxa_personalizada)
            : "",
        repassar_taxa_pais_padrao: Boolean(config.repassar_taxa_pais_padrao),
        enviar_recibo_automatico:
          config.enviar_recibo_automatico !== undefined
            ? Boolean(config.enviar_recibo_automatico)
            : true,
      });
    }
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taxaNum = formData.taxa_personalizada.trim()
      ? Number(formData.taxa_personalizada.replace(",", "."))
      : null;

    updateMutation.mutate({
      userId,
      data: {
        chave_pix_repasse: formData.chave_pix_repasse.trim() || null,
        tipo_chave_pix: formData.tipo_chave_pix || null,
        cobranca_automatica_ativa: formData.cobranca_automatica_ativa,
        taxa_personalizada: taxaNum,
        repassar_taxa_pais_padrao: formData.repassar_taxa_pais_padrao,
        enviar_recibo_automatico: formData.enviar_recibo_automatico,
      },
    });
  };

  const isWhitelisted = isUserInBaaSWhitelist({
    email: userEmail,
    telefone: userPhone,
  });

  return (
    <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e] text-slate-100 flex flex-col justify-between">
      <div>
        <CardHeader className="p-6 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-headline font-black text-white uppercase tracking-tight flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              Cobrança Inteligente & Repasse Pix (BaaS)
            </CardTitle>
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5 text-blue-400" />
              Split Automático
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {isWhitelisted ? (
            <Banner
              variant="success"
              title="Piloto BaaS Ativo"
              description="Motorista autorizado na Whitelist para cobrança inteligente e repasse Pix."
            />
          ) : (
            <Banner
              variant="info"
              title="Modo Financeiro Padrão"
              description="Motorista em fluxo tradicional. Para ativar o piloto de repasse Pix BaaS, inclua seu e-mail ou telefone na whitelist."
            />
          )}

          {isLoading && !config ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
            </div>
          ) : (
            <form id="financial-config-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Chave Pix para Recebimento
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-semibold text-slate-200">Tipo de Chave</Label>
                    <Select
                      value={formData.tipo_chave_pix}
                      onValueChange={(val) => setFormData((p) => ({ ...p, tipo_chave_pix: val }))}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                        <SelectItem value="CPF">CPF</SelectItem>
                        <SelectItem value="CNPJ">CNPJ</SelectItem>
                        <SelectItem value="TELEFONE">Telefone</SelectItem>
                        <SelectItem value="EMAIL">E-mail</SelectItem>
                        <SelectItem value="ALEATORIA">Chave Aleatória (EVP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-xs sm:text-sm font-semibold text-slate-200">Chave Pix de Repasse</Label>
                    <Input
                      value={formData.chave_pix_repasse}
                      onChange={(e) => setFormData((p) => ({ ...p, chave_pix_repasse: e.target.value }))}
                      placeholder="Ex: 11999998888 ou chave@email.com"
                      className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-800/80 pt-5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Parâmetros de Cobrança e Taxa
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-semibold text-slate-200">
                      Taxa Personalizada da Plataforma (R$)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.taxa_personalizada}
                      onChange={(e) => setFormData((p) => ({ ...p, taxa_personalizada: e.target.value }))}
                      placeholder="Padrão Global: R$ 4,00"
                      className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm"
                    />
                    <span className="text-[11px] text-slate-400 block">
                      Deixe em branco para usar o valor padrão global do sistema (R$ 4,00).
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold text-slate-200 block">Cobrança Automática Ativa</Label>
                        <span className="text-[10px] text-slate-400 block">
                          Habilita geração automática de Pix dinâmico com split
                        </span>
                      </div>
                      <Switch
                        checked={formData.cobranca_automatica_ativa}
                        onCheckedChange={(val) => setFormData((p) => ({ ...p, cobranca_automatica_ativa: val }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold text-slate-200 block">Repassar Taxa aos Pais</Label>
                        <span className="text-[10px] text-slate-400 block">
                          Soma o valor da taxa na cobrança emitida ao responsável
                        </span>
                      </div>
                      <Switch
                        checked={formData.repassar_taxa_pais_padrao}
                        onCheckedChange={(val) => setFormData((p) => ({ ...p, repassar_taxa_pais_padrao: val }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold text-slate-200 block">Envio de Recibo Automático</Label>
                        <span className="text-[10px] text-slate-400 block">
                          Envia comprovante oficial no WhatsApp após baixa confirmada
                        </span>
                      </div>
                      <Switch
                        checked={formData.enviar_recibo_automatico}
                        onCheckedChange={(val) => setFormData((p) => ({ ...p, enviar_recibo_automatico: val }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </div>

      <div className="p-6 border-t border-slate-800/80 bg-slate-900/40 flex justify-end">
        <Button
          type="submit"
          form="financial-config-form"
          disabled={updateMutation.isPending || isLoading}
          className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-900/20"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>Salvar Configurações Financeiras</span>
        </Button>
      </div>
    </Card>
  );
}
