import { useState } from "react";
import { Share2, CheckCircle2, Gift, UserPlus, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { toast } from "sonner";

interface AdminUserReferralTabProps {
  user: {
    id: string;
    nome: string;
    telefone: string;
  };
  referralSummary?: {
    total: number;
    completed: number;
    pending: number;
    referralCode?: string;
    referralLink?: string;
    bonusDays?: number;
  };
}

export function AdminUserReferralTab({ user, referralSummary }: AdminUserReferralTabProps) {
  const [copied, setCopied] = useState(false);

  // Link derivado ou fallback
  const linkBase = window.location.origin;
  const referralLink = referralSummary?.referralLink || `${linkBase}/cadastro?ref=${user.id}`;

  const total = referralSummary?.total ?? 0;
  const completed = referralSummary?.completed ?? 0;
  const pending = referralSummary?.pending ?? 0;
  const taxaConversao = total > 0 ? Math.round((completed / total) * 100) : 0;
  const diasBonusConcedidos = completed * 30;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Link de indicação copiado com sucesso!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* CARD 1: LINK DE INDICAÇÃO E AÇÃO DE CÓPIA */}
      <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <Share2 className="h-4 w-4 text-purple-400" />
            LINK DE INDICAÇÃO DO MOTORISTA
          </CardTitle>
          <p className="text-[11px] font-medium text-slate-400 mt-1">
            Link exclusivo do motorista para cópia rápida pelo administrador.
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full flex-1">
              <Input
                readOnly
                value={referralLink}
                className="bg-slate-900/90 border-slate-800 text-slate-200 font-mono text-xs h-11 pr-10 rounded-xl focus-visible:ring-blue-500"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="absolute right-1 top-1 bottom-1 h-9 w-9 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Copiar link"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <Button
              onClick={handleCopy}
              className="w-full sm:w-auto h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition-colors shadow-lg shadow-blue-600/20"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copiar Link</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: KPIS INDIVIDUAIS DO MOTORISTA */}
      <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest">
            MÉTRICAS DE INDICAÇÃO DESTE MOTORISTA
          </CardTitle>
          <p className="text-[11px] font-medium text-slate-400 mt-1">
            Resumo de conversões e bônus acumulados por {user.nome}
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <AdminKpiCard
              title="CADASTROS VIA INDICAÇÃO"
              value={total}
              subtext={`${pending} em teste (trial)`}
              cardBorder="border-purple-500/40 shadow-purple-500/10"
              iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
              icon={<Share2 className="h-5 w-5" />}
            />

            <AdminKpiCard
              title="CONVERTIDOS EM ASSINANTES"
              value={completed}
              subtext="Pagaram a 1ª mensalidade"
              cardBorder="border-emerald-500/40 shadow-emerald-500/10"
              iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              icon={<CheckCircle2 className="h-5 w-5" />}
            />

            <AdminKpiCard
              title="TAXA DE CONVERSÃO"
              value={`${taxaConversao}%`}
              subtext={`${completed} de ${total} indicados convertidos`}
              cardBorder="border-blue-500/40 shadow-blue-500/10"
              iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
              icon={<UserPlus className="h-5 w-5" />}
            />

            <AdminKpiCard
              title="BÔNUS GERADO"
              value={`${diasBonusConcedidos} Dias`}
              subtext={
                diasBonusConcedidos === 0
                  ? "0 meses grátis aos indicadores"
                  : `~${Math.round(diasBonusConcedidos / 30)} meses grátis ao motorista`
              }
              cardBorder="border-amber-500/40 shadow-amber-500/10"
              iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
              icon={<Gift className="h-5 w-5" />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
