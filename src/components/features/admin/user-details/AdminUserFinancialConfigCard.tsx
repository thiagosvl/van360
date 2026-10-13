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
import { ModoCobrancaEnum } from "@/types/enums";
import {
  useAdminMotoristaFinanceiro,
  useAdminUpdateMotoristaFinanceiro,
} from "@/hooks/api/admin/useAdminMotoristaFinanceiroHooks";

interface AdminUserFinancialConfigCardProps {
  userId: string;
  initialConfig?: MotoristaConfiguracaoFinanceira | null;
}

export function AdminUserFinancialConfigCard({
  userId,
  initialConfig,
}: AdminUserFinancialConfigCardProps) {
  const { data: configFromQuery, isLoading } = useAdminMotoristaFinanceiro(userId);
  const updateMutation = useAdminUpdateMotoristaFinanceiro();

  const config = configFromQuery || initialConfig;

  const [formData, setFormData] = useState({
    chave_pix_repasse: "",
    tipo_chave_pix: "CPF",
    modo_cobranca: ModoCobrancaEnum.DESATIVADO,
    taxa_personalizada: "",
    enviar_recibo_automatico: true,
    cobrar_multa_atraso: false,
    multa_atraso_tipo: "percentual",
    multa_atraso_valor: "",
    cobrar_juros_atraso: false,
    juros_atraso_tipo: "percentual",
    juros_atraso_valor: "",
  });

  useEffect(() => {
    if (config) {
      setFormData({
        chave_pix_repasse: config.chave_pix_repasse || "",
        tipo_chave_pix: config.tipo_chave_pix || "CPF",
        modo_cobranca: (config.modo_cobranca as ModoCobrancaEnum) || ModoCobrancaEnum.DESATIVADO,
        taxa_personalizada:
          config.taxa_personalizada !== null && config.taxa_personalizada !== undefined
            ? String(config.taxa_personalizada)
            : "",
        enviar_recibo_automatico:
          config.enviar_recibo_automatico !== undefined
            ? Boolean(config.enviar_recibo_automatico)
            : true,
        cobrar_multa_atraso: Boolean(config.cobrar_multa_atraso),
        multa_atraso_tipo: config.multa_atraso_tipo || "percentual",
        multa_atraso_valor:
          config.multa_atraso_valor !== null && config.multa_atraso_valor !== undefined
            ? String(config.multa_atraso_valor)
            : "",
        cobrar_juros_atraso: Boolean(config.cobrar_juros_atraso),
        juros_atraso_tipo: config.juros_atraso_tipo || "percentual",
        juros_atraso_valor:
          config.juros_atraso_valor !== null && config.juros_atraso_valor !== undefined
            ? String(config.juros_atraso_valor)
            : "",
      });
    }
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taxaNum = formData.taxa_personalizada.trim()
      ? Number(formData.taxa_personalizada.replace(",", "."))
      : null;

    const multaNum = formData.multa_atraso_valor.trim()
      ? Number(formData.multa_atraso_valor.replace(",", "."))
      : null;

    const jurosNum = formData.juros_atraso_valor.trim()
      ? Number(formData.juros_atraso_valor.replace(",", "."))
      : null;

    updateMutation.mutate({
      userId,
      data: {
        chave_pix_repasse: formData.chave_pix_repasse.trim() || null,
        tipo_chave_pix: formData.tipo_chave_pix || null,
        modo_cobranca: formData.modo_cobranca,
        taxa_personalizada: taxaNum,
        enviar_recibo_automatico: formData.enviar_recibo_automatico,
        cobrar_multa_atraso: formData.cobrar_multa_atraso,
        multa_atraso_tipo: formData.multa_atraso_tipo,
        multa_atraso_valor: multaNum,
        cobrar_juros_atraso: formData.cobrar_juros_atraso,
        juros_atraso_tipo: formData.juros_atraso_tipo,
        juros_atraso_valor: jurosNum,
      },
    });
  };

  return (
    <Card className="border border-border shadow-sm rounded-3xl overflow-hidden bg-card text-foreground flex flex-col justify-between">
      <div>
        <CardHeader className="p-6 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span>Cobrança automática & repasse Pix (Woovi)</span>
            </CardTitle>
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
              Split automático
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {config?.modo_cobranca === "AUTOMATICA" ? (
            <Banner
              variant="success"
              title="Cobrança automática ativa"
              description="Motorista configurado com Split Pix instantâneo pela Woovi."
            />
          ) : config?.modo_cobranca === "LEMBRETES" ? (
            <Banner
              variant="info"
              title="Lembretes com Pix próprio"
              description="Motorista envia avisos com sua chave Pix e dá baixa manual."
            />
          ) : (
            <Banner
              variant="neutral"
              title="Cobrança desativada"
              description="Motorista com avisos de cobrança desligados."
            />
          )}

          {isLoading && !config ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : (
            <form id="financial-config-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-foreground">
                  Chave Pix para recebimento
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-foreground">Tipo de chave</Label>
                    <Select
                      value={formData.tipo_chave_pix}
                      onValueChange={(val) => setFormData((p) => ({ ...p, tipo_chave_pix: val }))}
                    >
                      <SelectTrigger className="h-10 rounded-xl bg-secondary/50 border-input text-foreground text-xs focus:ring-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="CPF">CPF</SelectItem>
                        <SelectItem value="CNPJ">CNPJ</SelectItem>
                        <SelectItem value="TELEFONE">Telefone</SelectItem>
                        <SelectItem value="EMAIL">E-mail</SelectItem>
                        <SelectItem value="ALEATORIA">Chave aleatória (EVP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-xs font-medium text-foreground">Chave Pix de repasse</Label>
                    <Input
                      value={formData.chave_pix_repasse}
                      onChange={(e) => setFormData((p) => ({ ...p, chave_pix_repasse: e.target.value }))}
                      placeholder="Ex: 11999998888 ou chave@email.com"
                      className="h-10 rounded-xl bg-secondary/50 border-input text-foreground text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-5">
                <h4 className="text-xs font-semibold text-foreground">
                  Parâmetros de cobrança e taxa
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-foreground">
                      Taxa personalizada da plataforma (R$)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.taxa_personalizada}
                      onChange={(e) => setFormData((p) => ({ ...p, taxa_personalizada: e.target.value }))}
                      placeholder="Padrão global: R$ 4,00"
                      className="h-10 rounded-xl bg-secondary/50 border-input text-foreground text-xs"
                    />
                    <span className="text-xs text-muted-foreground block">
                      Deixe em branco para usar o valor padrão global do sistema (R$ 4,00).
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-semibold text-foreground block">Cobrança automática ativa</Label>
                        <span className="text-xs text-muted-foreground block">
                          Habilita geração automática de Pix dinâmico com split
                        </span>
                      </div>
                      <Switch
                        checked={formData.modo_cobranca === ModoCobrancaEnum.AUTOMATICA}
                        onCheckedChange={(val) =>
                          setFormData((p) => ({
                            ...p,
                            modo_cobranca: val ? ModoCobrancaEnum.AUTOMATICA : ModoCobrancaEnum.DESATIVADO,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-semibold text-foreground block">Envio de recibo automático</Label>
                        <span className="text-xs text-muted-foreground block">
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

              <div className="space-y-4 border-t border-border pt-5">
                <h4 className="text-xs font-semibold text-foreground">
                  Multa e juros por atraso (QR Code Pix)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3 p-3.5 rounded-2xl bg-secondary/30 border border-border">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-semibold text-foreground block">Multa por atraso</Label>
                        <span className="text-xs text-muted-foreground block">
                          Incide uma única vez após o vencimento
                        </span>
                      </div>
                      <Switch
                        checked={formData.cobrar_multa_atraso}
                        onCheckedChange={(val) => setFormData((p) => ({ ...p, cobrar_multa_atraso: val }))}
                      />
                    </div>
                    {formData.cobrar_multa_atraso && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">Formato</Label>
                          <Select
                            value={formData.multa_atraso_tipo}
                            onValueChange={(val) => setFormData((p) => ({ ...p, multa_atraso_tipo: val }))}
                          >
                            <SelectTrigger className="h-9 rounded-xl bg-background border-input text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentual" className="text-xs">Percentual (%)</SelectItem>
                              <SelectItem value="fixo" className="text-xs">Fixo (R$)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">Valor</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.multa_atraso_valor}
                            onChange={(e) => setFormData((p) => ({ ...p, multa_atraso_valor: e.target.value }))}
                            placeholder={formData.multa_atraso_tipo === "percentual" ? "Ex: 2 (%)" : "Ex: 10 (R$)"}
                            className="h-9 rounded-xl bg-background border-input text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-3.5 rounded-2xl bg-secondary/30 border border-border">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-semibold text-foreground block">Juros de mora</Label>
                        <span className="text-xs text-muted-foreground block">
                          Incide por dia de atraso
                        </span>
                      </div>
                      <Switch
                        checked={formData.cobrar_juros_atraso}
                        onCheckedChange={(val) => setFormData((p) => ({ ...p, cobrar_juros_atraso: val }))}
                      />
                    </div>
                    {formData.cobrar_juros_atraso && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">Formato</Label>
                          <Select
                            value={formData.juros_atraso_tipo}
                            onValueChange={(val) => setFormData((p) => ({ ...p, juros_atraso_tipo: val }))}
                          >
                            <SelectTrigger className="h-9 rounded-xl bg-background border-input text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentual" className="text-xs">% ao mês</SelectItem>
                              <SelectItem value="fixo" className="text-xs">R$ ao dia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">Valor</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.juros_atraso_valor}
                            onChange={(e) => setFormData((p) => ({ ...p, juros_atraso_valor: e.target.value }))}
                            placeholder={formData.juros_atraso_tipo === "percentual" ? "Ex: 1 (%)" : "Ex: 0.50 (R$)"}
                            className="h-9 rounded-xl bg-background border-input text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </div>

      <div className="p-6 border-t border-border bg-card flex justify-end">
        <Button
          type="submit"
          form="financial-config-form"
          disabled={updateMutation.isPending || isLoading}
          className="h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center gap-2 shadow-sm"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>Salvar configurações financeiras</span>
        </Button>
      </div>
    </Card>
  );
}
