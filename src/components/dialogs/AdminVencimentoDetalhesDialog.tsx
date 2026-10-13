import { useState } from "react";
import {
  Users,
  Clock,
  RotateCw,
  Eye,
  Loader2,
  MessageSquare,
  Mail,
  Bell,
  CheckCircle2,
  AlertTriangle,
  UserX,
  PhoneOff,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { Banner } from "@/components/ui/Banner";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { useAdminVencimentoDetalhes } from "@/hooks/api/admin/useAdminVencimentosHooks";
import type { CarteiraDiaResumo } from "@/services/api/admin/admin-user.api";

export interface AdminVencimentoDetalhesDialogProps {
  open: boolean;
  onClose: () => void;
  dia: number;
  mes?: number;
  ano?: number;
}

const formatarBrl = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

export default function AdminVencimentoDetalhesDialog({
  open,
  onClose,
  dia,
  mes,
  ano,
}: AdminVencimentoDetalhesDialogProps) {
  const [activeTab, setActiveTab] = useState<"disparos" | "carteira">("disparos");

  const {
    data: detalhes,
    isLoading,
    refetch,
  } = useAdminVencimentoDetalhes(open && dia > 0 ? dia : null, mes, ano);

  const isDiaHoje = Boolean(detalhes?.isHoje);
  const isPassado = Boolean(detalhes?.isPassado);
  const isFuturo = Boolean(detalhes?.isFuturo);
  const disparos = detalhes?.disparosDia || detalhes?.disparosHoje;

  return (
    <AdminBaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          safeCloseDialog(onClose);
        }
      }}
      maxWidth="3xl"
    >
      <AdminBaseDialog.Header
        title={`Raio-x de notificações — Dia ${dia?.toString().padStart(2, "0")}`}
        subtitle={
          isDiaHoje
            ? "Previsão consolidada de todas as réguas disparadas hoje e carteira de alunos deste dia"
            : isPassado
            ? `Histórico de disparos executados pelo sistema no dia ${dia?.toString().padStart(2, "0")} e carteira de alunos`
            : `Estimativa das réguas de notificação para o dia ${dia?.toString().padStart(2, "0")} e carteira de alunos`
        }
        icon={<Eye className="w-5 h-5 text-primary" />}
        onClose={() => safeCloseDialog(onClose)}
      />
      <AdminBaseDialog.Body>
        <div className="space-y-4 text-left py-1">
          <Banner
            variant="info"
            title="Critérios de envio"
            description="Notificações são enviadas apenas ao responsável principal ativo cadastrado. Envios via WhatsApp (WABA) possuem custo estimado de R$ 0,038 por mensagem."
          />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-semibold text-muted-foreground">
                Carregando raio-x e status de envio das notificações...
              </p>
            </div>
          ) : !detalhes ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Não foi possível carregar os dados detalhados para este dia.
            </div>
          ) : (
            <div>
              {disparos ? (
                <Tabs
                  value={activeTab}
                  onValueChange={(val) => setActiveTab(val as "disparos" | "carteira")}
                  className="w-full"
                >
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <TabsList className="bg-secondary/40 border border-border p-1 rounded-xl">
                      <TabsTrigger
                        value="disparos"
                        className="text-xs font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        {isDiaHoje
                          ? "Disparos de hoje"
                          : isPassado
                          ? `Disparos realizados (${dia?.toString().padStart(2, "0")})`
                          : `Estimativa de disparos (${dia?.toString().padStart(2, "0")})`} ({disparos.totalFaturasHoje} faturas)
                      </TabsTrigger>
                      <TabsTrigger
                        value="carteira"
                        className="text-xs font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5"
                      >
                        <Users className="h-3.5 w-3.5 mr-1.5" />
                        Carteira do dia {dia} ({detalhes.carteira.totalAlunos} {detalhes.carteira.totalAlunos === 1 ? "aluno" : "alunos"})
                      </TabsTrigger>
                    </TabsList>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetch()}
                      className="h-8 px-2.5 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-secondary shrink-0"
                    >
                      <RotateCw className="h-3 w-3 mr-1.5" />
                      Atualizar
                    </Button>
                  </div>

                  <TabsContent value="disparos" className="space-y-4 mt-0 focus-visible:outline-none">
                    <Banner
                      variant="info"
                      title="Critério das notificações"
                      description={
                        isDiaHoje
                          ? "Lista as faturas com data de vencimento efetiva para hoje nas réguas automáticas."
                          : isPassado
                          ? `Lista as faturas que venceram na data ${dia?.toString().padStart(2, "0")} e o histórico de réguas processadas.`
                          : `Projeção das faturas com vencimento agendado para o dia ${dia?.toString().padStart(2, "0")}.`
                      }
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-medium text-primary block">
                            {isDiaHoje
                              ? "Total escopo do job hoje"
                              : isPassado
                              ? `Total processado no job (dia ${dia?.toString().padStart(2, "0")})`
                              : `Total escopo do job (dia ${dia?.toString().padStart(2, "0")})`}
                          </span>
                          <span className="text-2xl font-mono font-bold text-foreground mt-1 block">
                            {disparos.totalFaturasHoje}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {isPassado ? "Executado às 13:30" : "Todas as 5 réguas ativas"}
                          </span>
                        </div>
                        <Send className="h-6 w-6 text-primary shrink-0 opacity-80" />
                      </div>

                      <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-medium text-emerald-400 block">
                            {isDiaHoje ? "Já enviadas hoje" : isPassado ? "Disparos concluídos" : "Já disparadas"}
                          </span>
                          <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block">
                            {disparos.totalJaEnviadasHoje}
                          </span>
                          <span className="text-[10px] text-emerald-400/80 font-medium">
                            {isDiaHoje ? "Disparos concluídos" : isPassado ? "Histórico executado" : "Aguardando data"}
                          </span>
                        </div>
                        <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 opacity-80" />
                      </div>

                      <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-medium text-amber-400 block">
                            {isDiaHoje ? "Aguardando envio" : isPassado ? "Status da execução" : "Previsão de envio"}
                          </span>
                          <span className="text-2xl font-mono font-bold text-amber-400 mt-1 block">
                            {isPassado ? "0" : disparos.totalAguardandoEnvioHoje}
                          </span>
                          <span className="text-[10px] text-amber-400/80 font-medium">
                            {isDiaHoje
                              ? "Próxima execução do job"
                              : isPassado
                              ? "Job do dia finalizado"
                              : "Estimativa para as 13:30"}
                          </span>
                        </div>
                        <Clock className="h-6 w-6 text-amber-400 shrink-0 opacity-80" />
                      </div>
                    </div>

                    <div className="p-4 bg-secondary/30 rounded-2xl border border-border space-y-3">
                      <span className="text-xs font-semibold text-foreground block">
                        {isDiaHoje
                          ? "Consolidação por canal dos disparos de hoje"
                          : isPassado
                          ? `Consolidação por canal — Disparos realizados (dia ${dia?.toString().padStart(2, "0")})`
                          : `Consolidação por canal — Estimativa dia ${dia?.toString().padStart(2, "0")}`}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-card rounded-xl border border-border flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-medium text-muted-foreground block">
                              WhatsApp (WABA)
                            </span>
                            <span className="text-sm sm:text-base font-mono font-bold text-foreground">
                              {disparos.canaisConsolidados.waba} disparos
                            </span>
                            <span className="text-[10px] text-emerald-400 font-semibold block">
                              Custo est.: R$ {disparos.canaisConsolidados.custoEstimadoWabaBrl.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-card rounded-xl border border-border flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-medium text-muted-foreground block">
                              E-mail (Resend)
                            </span>
                            <span className="text-sm sm:text-base font-mono font-bold text-foreground">
                              {disparos.canaisConsolidados.resend} disparos
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              Responsável principal
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-card rounded-xl border border-border flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                            <Bell className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-medium text-muted-foreground block">
                              Push (Firebase)
                            </span>
                            <span className="text-sm sm:text-base font-mono font-bold text-foreground">
                              {disparos.canaisConsolidados.firebase} disparos
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              Responsável principal
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-secondary/30 rounded-2xl border border-border space-y-3">
                      <span className="text-xs font-semibold text-foreground block">
                        {isDiaHoje
                          ? "Detalhamento das 5 réguas de notificação de hoje"
                          : isPassado
                          ? `Detalhamento das réguas disparadas no dia ${dia?.toString().padStart(2, "0")}`
                          : `Detalhamento das 5 réguas de notificação (projeção dia ${dia?.toString().padStart(2, "0")})`}
                      </span>
                      <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
                        {Object.entries(disparos.reguas)
                          .filter(([key]) => key !== "atrasados")
                          .map(([key, regua]) => (
                            <div key={key} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-foreground">{regua.titulo}</span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-secondary text-muted-foreground border border-border">
                                    {regua.totalFaturas} {regua.totalFaturas === 1 ? "fatura" : "faturas"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{regua.descricao}</p>
                              </div>

                              <div className="flex items-center gap-2 text-[10px] font-mono font-medium shrink-0">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <MessageSquare className="h-3 w-3" />
                                  WABA: {regua.canais.waba}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                  <Mail className="h-3 w-3" />
                                  Email: {regua.canais.resend}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  <Bell className="h-3 w-3" />
                                  Push: {regua.canais.firebase}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="carteira" className="space-y-4 mt-0 focus-visible:outline-none">
                    <CarteiraDetalhesView carteira={detalhes.carteira} />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <span className="text-xs font-semibold text-foreground block">
                        Carteira de alunos do dia {dia}
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Cobranças e situação dos responsáveis no mês atual
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetch()}
                      className="h-8 px-2.5 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-secondary"
                    >
                      <RotateCw className="h-3 w-3 mr-1.5" />
                      Atualizar
                    </Button>
                  </div>
                  <CarteiraDetalhesView carteira={detalhes.carteira} />
                </div>
              )}
            </div>
          )}
        </div>
      </AdminBaseDialog.Body>
      <AdminBaseDialog.Footer>
        <AdminBaseDialog.Action
          label="Fechar"
          variant="secondary"
          onClick={() => safeCloseDialog(onClose)}
        />
      </AdminBaseDialog.Footer>
    </AdminBaseDialog>
  );
}

function CarteiraDetalhesView({ carteira }: { carteira: CarteiraDiaResumo }) {
  return (
    <div className="space-y-4">
      {Boolean(carteira.faturasNaoGeradas && carteira.faturasNaoGeradas > 0) && (
        <Banner
          variant="warning"
          title="Faturas pendentes de emissão"
          description={`${carteira.faturasNaoGeradas} aluno(s) possui(em) vencimento contratual no dia ${carteira.dia}, mas o motorista ainda não emitiu a fatura para o mês selecionado.`}
        />
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-secondary/30 rounded-2xl border border-border">
          <span className="text-[10px] font-medium text-muted-foreground block">
            Total alunos
          </span>
          <span className="text-xl font-mono font-bold text-foreground mt-1 block">
            {carteira.totalAlunos}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
            Com vencimento dia {carteira.dia}
          </span>
        </div>

        <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
          <span className="text-[10px] font-medium text-emerald-400 block">
            Faturas pagas
          </span>
          <span className="text-xl font-mono font-bold text-emerald-400 mt-1 block">
            {carteira.faturasPagas}
          </span>
          <span className="text-[10px] text-emerald-400/80 font-medium block mt-0.5">
            {formatarBrl(carteira.valorPagoTotal)}
          </span>
        </div>

        <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20">
          <span className="text-[10px] font-medium text-amber-400 block">
            Faturas pendentes
          </span>
          <span className="text-xl font-mono font-bold text-amber-400 mt-1 block">
            {carteira.faturasPendentes}
          </span>
          <span className="text-[10px] text-amber-400/80 font-medium block mt-0.5">
            {formatarBrl(carteira.valorPendenteTotal)}
          </span>
        </div>

        <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20">
          <span className="text-[10px] font-medium text-primary block">
            Total previsto mês
          </span>
          <span className="text-xl font-mono font-bold text-primary mt-1 block">
            {formatarBrl(carteira.valorPrevistoTotal)}
          </span>
          <span className="text-[10px] text-primary/80 font-medium block mt-0.5">
            Faturas geradas
          </span>
        </div>
      </div>

      <div className="p-4 bg-secondary/30 rounded-2xl border border-border space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-xs font-semibold text-foreground flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            <span>Canais prontos para as faturas pendentes</span>
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {carteira.faturasPendentes} pendentes elegíveis
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-card rounded-xl border border-border flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-medium text-muted-foreground block">WhatsApp (WABA)</span>
              <span className="text-sm font-mono font-bold text-foreground">
                {carteira.canaisDisponiveis.waba} prontos
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold block">
                Custo: R$ {carteira.canaisDisponiveis.custoEstimadoWabaBrl.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-card rounded-xl border border-border flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-medium text-muted-foreground block">E-mail (Resend)</span>
              <span className="text-sm font-mono font-bold text-foreground">
                {carteira.canaisDisponiveis.resend} prontos
              </span>
              <span className="text-[10px] text-muted-foreground font-medium block">E-mail cadastrado</span>
            </div>
          </div>

          <div className="p-3 bg-card rounded-xl border border-border flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-medium text-muted-foreground block">Push (Firebase)</span>
              <span className="text-sm font-mono font-bold text-foreground">
                {carteira.canaisDisponiveis.firebase} prontos
              </span>
              <span className="text-[10px] text-muted-foreground font-medium block">App dos pais</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-secondary/30 rounded-2xl border border-border space-y-3">
        <span className="text-xs font-semibold text-foreground block">
          Diagnóstico de comunicação (responsável principal)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="p-3 bg-card rounded-xl border border-border flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-mono font-semibold text-foreground block">
                {carteira.diagnostico.comTelefoneValido}
              </span>
              <span className="text-[10px] text-muted-foreground">Telefone celular válido</span>
            </div>
          </div>

          <div className="p-3 bg-card rounded-xl border border-border flex items-center gap-2.5">
            <Mail className="h-4 w-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-xs font-mono font-semibold text-foreground block">
                {carteira.diagnostico.comEmailValido}
              </span>
              <span className="text-[10px] text-muted-foreground">E-mail válido</span>
            </div>
          </div>

          <div className="p-3 bg-card rounded-xl border border-border flex items-center gap-2.5">
            <UserX className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-mono font-semibold text-foreground block">
                {carteira.diagnostico.semResponsavelPrincipal}
              </span>
              <span className="text-[10px] text-muted-foreground">Sem resp. principal</span>
            </div>
          </div>

          <div className="p-3 bg-card rounded-xl border border-border flex items-center gap-2.5">
            <PhoneOff className="h-4 w-4 text-rose-400 shrink-0" />
            <div>
              <span className="text-xs font-mono font-semibold text-foreground block">
                {carteira.diagnostico.semContato}
              </span>
              <span className="text-[10px] text-muted-foreground">Incomunicáveis (sem tel/mail)</span>
            </div>
          </div>

          <div className="p-3 bg-card rounded-xl border border-border flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-xs font-mono font-semibold text-foreground block">
                {carteira.diagnostico.notificacoesDesativadasMotorista}
              </span>
              <span className="text-[10px] text-muted-foreground">Desativado no motorista</span>
            </div>
          </div>

          <div className="p-3 bg-card rounded-xl border border-border flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-xs font-mono font-semibold text-foreground block">
                {carteira.diagnostico.lembretesDesativadosAluno}
              </span>
              <span className="text-[10px] text-muted-foreground">Desativado na carteirinha</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
