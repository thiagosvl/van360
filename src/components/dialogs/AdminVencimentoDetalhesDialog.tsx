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
        title={`Raio-X de Notificações — Dia ${dia?.toString().padStart(2, "0")}`}
        subtitle={
          isDiaHoje
            ? "Previsão consolidada de todas as réguas disparadas hoje e carteira de alunos deste dia"
            : isPassado
            ? `Histórico de disparos executados pelo sistema no dia ${dia?.toString().padStart(2, "0")} e carteira de alunos`
            : `Estimativa das réguas de notificação para o dia ${dia?.toString().padStart(2, "0")} e carteira de alunos`
        }
        icon={<Eye className="w-5 h-5 text-blue-400" />}
        onClose={() => safeCloseDialog(onClose)}
      />
      <AdminBaseDialog.Body>
        <div className="space-y-5 text-left py-1">
          <Banner
            variant="info"
            title="Critérios de Envio"
            description="Notificações são enviadas apenas ao responsável principal ativo cadastrado. Envios via WhatsApp (WABA) possuem custo estimado de R$ 0,038 por mensagem."
          />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <p className="text-xs font-bold text-slate-400">
                Carregando raio-x e status de envio das notificações...
              </p>
            </div>
          ) : !detalhes ? (
            <div className="p-6 text-center text-xs text-slate-400">
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
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl">
                      <TabsTrigger
                        value="disparos"
                        className="text-xs font-bold rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white px-3 py-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1.5 text-blue-300" />
                        {isDiaHoje
                          ? "Disparos de Hoje"
                          : isPassado
                          ? `Disparos Realizados (${dia?.toString().padStart(2, "0")})`
                          : `Estimativa de Disparos (${dia?.toString().padStart(2, "0")})`} ({disparos.totalFaturasHoje} faturas)
                      </TabsTrigger>
                      <TabsTrigger
                        value="carteira"
                        className="text-xs font-bold rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white px-3 py-1.5"
                      >
                        <Users className="h-3.5 w-3.5 mr-1.5" />
                        Carteira do Dia {dia} ({detalhes.carteira.totalAlunos} {detalhes.carteira.totalAlunos === 1 ? "aluno" : "alunos"})
                      </TabsTrigger>
                    </TabsList>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetch()}
                      className="h-8 px-2.5 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300 hover:bg-slate-800 shrink-0"
                    >
                      <RotateCw className="h-3 w-3 mr-1.5" />
                      Atualizar
                    </Button>
                  </div>

                  <TabsContent value="disparos" className="space-y-5 mt-0 focus-visible:outline-none">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/30 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-300 block">
                            {isDiaHoje
                              ? "Total Escopo do Job Hoje"
                              : isPassado
                              ? `Total Processado no Job (Dia ${dia?.toString().padStart(2, "0")})`
                              : `Total Escopo do Job (Dia ${dia?.toString().padStart(2, "0")})`}
                          </span>
                          <span className="text-2xl font-mono font-black text-white mt-1 block">
                            {disparos.totalFaturasHoje}
                          </span>
                          <span className="text-[10px] text-blue-300/80 font-medium">
                            {isPassado ? "Executado às 13:30" : "Todas as 5 réguas ativas"}
                          </span>
                        </div>
                        <Send className="h-7 w-7 text-blue-400 shrink-0 opacity-80" />
                      </div>

                      <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                            {isDiaHoje ? "Já Enviadas Hoje" : isPassado ? "Disparos Concluídos" : "Já Disparadas"}
                          </span>
                          <span className="text-2xl font-mono font-black text-emerald-400 mt-1 block">
                            {disparos.totalJaEnviadasHoje}
                          </span>
                          <span className="text-[10px] text-emerald-300/80 font-medium">
                            {isDiaHoje ? "Disparos concluídos" : isPassado ? "Histórico executado" : "Aguardando data"}
                          </span>
                        </div>
                        <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0 opacity-80" />
                      </div>

                      <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                            {isDiaHoje ? "Aguardando Envio" : isPassado ? "Status da Execução" : "Previsão de Envio"}
                          </span>
                          <span className="text-2xl font-mono font-black text-amber-400 mt-1 block">
                            {isPassado ? "0" : disparos.totalAguardandoEnvioHoje}
                          </span>
                          <span className="text-[10px] text-amber-300/80 font-medium">
                            {isDiaHoje
                              ? "Próxima execução do job"
                              : isPassado
                              ? "Job do dia finalizado"
                              : "Estimativa para a execução das 13:30"}
                          </span>
                        </div>
                        <Clock className="h-7 w-7 text-amber-400 shrink-0 opacity-80" />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                      <span className="text-xs font-headline font-black text-slate-200 uppercase tracking-wider block">
                        {isDiaHoje
                          ? "Consolidação por Canal dos Disparos de Hoje"
                          : isPassado
                          ? `Consolidação por Canal — Disparos Realizados (Dia ${dia?.toString().padStart(2, "0")})`
                          : `Consolidação por Canal — Estimativa Dia ${dia?.toString().padStart(2, "0")}`}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-[#131b2e] rounded-xl border border-slate-800 flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 block">
                              WhatsApp (WABA)
                            </span>
                            <span className="text-base font-mono font-black text-white">
                              {disparos.canaisConsolidados.waba} disparos
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold block">
                              Custo est.: R$ {disparos.canaisConsolidados.custoEstimadoWabaBrl.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-[#131b2e] rounded-xl border border-slate-800 flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 block">
                              E-mail (Resend)
                            </span>
                            <span className="text-base font-mono font-black text-white">
                              {disparos.canaisConsolidados.resend} disparos
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold block">
                              Responsável principal
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-[#131b2e] rounded-xl border border-slate-800 flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                            <Bell className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 block">
                              Push (Firebase)
                            </span>
                            <span className="text-base font-mono font-black text-white">
                              {disparos.canaisConsolidados.firebase} disparos
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold block">
                              Responsável principal
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                      <span className="text-xs font-headline font-black text-slate-200 uppercase tracking-wider block">
                        {isDiaHoje
                          ? "Detalhamento das 5 Réguas de Notificação de Hoje"
                          : isPassado
                          ? `Detalhamento das Réguas Disparadas no Dia ${dia?.toString().padStart(2, "0")}`
                          : `Detalhamento das 5 Réguas de Notificação (Projeção Dia ${dia?.toString().padStart(2, "0")})`}
                      </span>
                      <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-[#131b2e]">
                        {Object.entries(disparos.reguas)
                          .filter(([key]) => key !== "atrasados")
                          .map(([key, regua]) => (
                            <div key={key} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-white">{regua.titulo}</span>
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-800 text-slate-300">
                                    {regua.totalFaturas} {regua.totalFaturas === 1 ? "fatura" : "faturas"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5">{regua.descricao}</p>
                              </div>

                              <div className="flex items-center gap-2 text-[10px] font-mono font-bold shrink-0">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                  <MessageSquare className="h-3 w-3" />
                                  WABA: {regua.canais.waba}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                  <Mail className="h-3 w-3" />
                                  Email: {regua.canais.resend}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                  <Bell className="h-3 w-3" />
                                  Push: {regua.canais.firebase}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="carteira" className="space-y-5 mt-0 focus-visible:outline-none">
                    <CarteiraDetalhesView carteira={detalhes.carteira} />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-headline font-black text-slate-200 uppercase tracking-wider block">
                        Carteira de Alunos do Dia {dia}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Cobranças e situação dos responsáveis no mês atual
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetch()}
                      className="h-8 px-2.5 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300 hover:bg-slate-800"
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
        <Button
          variant="ghost"
          onClick={() => safeCloseDialog(onClose)}
          className="text-xs font-bold text-slate-400 hover:text-white"
        >
          Fechar
        </Button>
      </AdminBaseDialog.Footer>
    </AdminBaseDialog>
  );
}

function CarteiraDetalhesView({
  carteira,
}: {
  carteira: {
    dia: number;
    totalAlunos: number;
    faturasPagas: number;
    faturasPendentes: number;
    valorPrevistoTotal: number;
    valorPagoTotal: number;
    valorPendenteTotal: number;
    canaisDisponiveis: {
      waba: number;
      resend: number;
      firebase: number;
      custoEstimadoWabaBrl: number;
    };
    diagnostico: {
      comTelefoneValido: number;
      comEmailValido: number;
      semResponsavelPrincipal: number;
      semContato: number;
      notificacoesDesativadasMotorista: number;
      lembretesDesativadosAluno: number;
    };
  };
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            Total Alunos
          </span>
          <span className="text-xl font-mono font-black text-white mt-1 block">
            {carteira.totalAlunos}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
            Com vencimento dia {carteira.dia}
          </span>
        </div>

        <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
          <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider block">
            Faturas Pagas
          </span>
          <span className="text-xl font-mono font-black text-emerald-400 mt-1 block">
            {carteira.faturasPagas}
          </span>
          <span className="text-[10px] text-emerald-300/80 font-medium block mt-0.5">
            {formatarBrl(carteira.valorPagoTotal)}
          </span>
        </div>

        <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/30">
          <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
            Faturas Pendentes
          </span>
          <span className="text-xl font-mono font-black text-amber-400 mt-1 block">
            {carteira.faturasPendentes}
          </span>
          <span className="text-[10px] text-amber-300/80 font-medium block mt-0.5">
            {formatarBrl(carteira.valorPendenteTotal)}
          </span>
        </div>

        <div className="p-3.5 bg-blue-500/10 rounded-2xl border border-blue-500/30">
          <span className="text-[10px] font-black text-blue-300 uppercase tracking-wider block">
            Total Previsto Mês
          </span>
          <span className="text-xl font-mono font-black text-blue-400 mt-1 block">
            {formatarBrl(carteira.valorPrevistoTotal)}
          </span>
          <span className="text-[10px] text-blue-300/80 font-medium block mt-0.5">
            Faturas geradas
          </span>
        </div>
      </div>

      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-headline font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Send className="h-4 w-4 text-blue-400" />
            <span>Canais Prontos para as Faturas Pendentes</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {carteira.faturasPendentes} pendentes elegíveis
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-[#131b2e] rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block">WhatsApp (WABA)</span>
              <span className="text-sm font-mono font-black text-white">
                {carteira.canaisDisponiveis.waba} prontos
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block">
                Custo: R$ {carteira.canaisDisponiveis.custoEstimadoWabaBrl.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#131b2e] rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block">E-mail (Resend)</span>
              <span className="text-sm font-mono font-black text-white">
                {carteira.canaisDisponiveis.resend} prontos
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block">E-mail cadastrado</span>
            </div>
          </div>

          <div className="p-3 bg-[#131b2e] rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block">Push (Firebase)</span>
              <span className="text-sm font-mono font-black text-white">
                {carteira.canaisDisponiveis.firebase} prontos
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block">App dos pais</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
        <span className="text-xs font-headline font-black text-slate-200 uppercase tracking-wider block">
          Diagnóstico de Comunicação (Responsável Principal)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="p-3 bg-[#131b2e] rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-white block">
                {carteira.diagnostico.comTelefoneValido}
              </span>
              <span className="text-[10px] text-slate-400">Telefone celular válido</span>
            </div>
          </div>

          <div className="p-3 bg-[#131b2e] rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <Mail className="h-4 w-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-white block">
                {carteira.diagnostico.comEmailValido}
              </span>
              <span className="text-[10px] text-slate-400">E-mail válido</span>
            </div>
          </div>

          <div className="p-3 bg-[#131b2e] rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <UserX className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-white block">
                {carteira.diagnostico.semResponsavelPrincipal}
              </span>
              <span className="text-[10px] text-slate-400">Sem resp. principal</span>
            </div>
          </div>

          <div className="p-3 bg-[#131b2e] rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <PhoneOff className="h-4 w-4 text-rose-400 shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-white block">
                {carteira.diagnostico.semContato}
              </span>
              <span className="text-[10px] text-slate-400">Incomunicáveis (sem tel/mail)</span>
            </div>
          </div>

          <div className="p-3 bg-[#131b2e] rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-white block">
                {carteira.diagnostico.notificacoesDesativadasMotorista}
              </span>
              <span className="text-[10px] text-slate-400">Desativado no motorista</span>
            </div>
          </div>

          <div className="p-3 bg-[#131b2e] rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-white block">
                {carteira.diagnostico.lembretesDesativadosAluno}
              </span>
              <span className="text-[10px] text-slate-400">Desativado na carteirinha</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
