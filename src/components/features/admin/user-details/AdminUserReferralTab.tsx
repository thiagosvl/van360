import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import {
  Share2,
  CheckCircle2,
  Gift,
  UserPlus,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { toast } from "sonner";
import { openBrowserLink, copyToClipboard } from "@/utils/browser";
import { buildReferralShareMessage, buildWhatsAppUrl } from "@/utils/whatsappTemplates";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { cn } from "@/lib/utils";
import { phoneMask } from "@/utils/masks";
import { IndicacaoStatus } from "@/types/enums";
import { formatSafeBrazilianDate } from "@/utils/dateUtils";

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
  referredUsers?: Array<{
    id: string;
    status: IndicacaoStatus;
    created_at: string;
    indicado: {
      id: string;
      nome: string;
      telefone: string;
      email: string;
    } | null;
  }>;
}

export function AdminUserReferralTab({
  user,
  referralSummary,
  referredUsers = [],
}: AdminUserReferralTabProps) {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const siteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || "https://van360.com.br";
  const referralLink = referralSummary?.referralLink || `${siteUrl}/?ref=${user.id}`;

  const total = referralSummary?.total ?? 0;
  const completed = referralSummary?.completed ?? 0;
  const pending = referralSummary?.pending ?? 0;
  const taxaConversao = total > 0 ? Math.round((completed / total) * 100) : 0;
  const diasBonusConcedidos = completed * 30;

  const handleCopyMessage = async () => {
    const message = buildReferralShareMessage(referralLink);
    const success = await copyToClipboard(message);
    if (success) {
      setCopiedMessage(true);
      toast.success("Mensagem completa de indicação copiada!");
      setTimeout(() => setCopiedMessage(false), 2000);
    } else {
      toast.error("Não foi possível copiar a mensagem.");
    }
  };

  const handleCopyOnlyUrl = async () => {
    const success = await copyToClipboard(referralLink);
    if (success) {
      setCopiedUrl(true);
      toast.success("Link copiado com sucesso!");
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      toast.error("Não foi possível copiar o link.");
    }
  };

  const handleShareWhatsApp = () => {
    const message = buildReferralShareMessage(referralLink);
    const url = buildWhatsAppUrl(null, message);
    openBrowserLink(url);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="space-y-6 text-left">
      <Card className="border border-border shadow-sm rounded-3xl overflow-hidden bg-card">
        <CardHeader className="p-6 pb-2 border-b border-border bg-card">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Share2 className="h-4 w-4 text-purple-500" />
            <span>Link de indicação deste motorista</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Link exclusivo do motorista para cópia rápida e envio pelo WhatsApp.
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full flex-1">
              <Input
                readOnly
                value={referralLink}
                className="bg-secondary/50 border-input text-foreground font-mono text-xs h-11 pr-10 rounded-xl focus-visible:ring-primary"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyOnlyUrl}
                className="absolute right-1 top-1 bottom-1 h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                title="Copiar apenas o link"
              >
                {copiedUrl ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <Button
              onClick={handleShareWhatsApp}
              className="w-full sm:w-auto h-11 px-4 rounded-xl bg-[#25D366] hover:bg-[#20b858] text-white font-semibold text-xs flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <WhatsAppIcon className="h-4 w-4 fill-current" />
              <span>WhatsApp</span>
            </Button>

            <Button
              onClick={handleCopyMessage}
              className={cn(
                "w-full sm:w-auto h-11 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer active:scale-95 shadow-sm",
                copiedMessage
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
            >
              {copiedMessage ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copiar mensagem</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm rounded-3xl overflow-hidden bg-card">
        <CardHeader className="p-6 pb-2 border-b border-border bg-card">
          <CardTitle className="text-base font-semibold text-foreground">
            Métricas de indicações feitas por este motorista
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Resumo de conversões e bônus acumulados por {user.nome}
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-4 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <AdminKpiCard
              title="Cadastros via indicação"
              value={total}
              subtext={`${pending} em teste (trial)`}
              cardBorder="border-border hover:border-purple-500/50"
              iconBg="bg-purple-500/10 text-purple-500 border-purple-500/20"
              icon={<Share2 className="h-5 w-5" />}
            />

            <AdminKpiCard
              title="Convertidos em assinantes"
              value={completed}
              subtext="Pagaram a 1ª mensalidade"
              cardBorder="border-border hover:border-emerald-500/50"
              iconBg="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              icon={<CheckCircle2 className="h-5 w-5" />}
            />

            <AdminKpiCard
              title="Taxa de conversão"
              value={`${taxaConversao}%`}
              subtext={`${completed} de ${total} indicados convertidos`}
              cardBorder="border-border hover:border-primary/50"
              iconBg="bg-primary/10 text-primary border-primary/20"
              icon={<UserPlus className="h-5 w-5" />}
            />

            <AdminKpiCard
              title="Bônus gerado"
              value={`${diasBonusConcedidos} Dias`}
              subtext={
                diasBonusConcedidos === 0
                  ? "0 meses grátis acumulados"
                  : `~${Math.round(diasBonusConcedidos / 30)} meses grátis ao motorista`
              }
              cardBorder="border-border hover:border-amber-500/50"
              iconBg="bg-amber-500/10 text-amber-500 border-amber-500/20"
              icon={<Gift className="h-5 w-5" />}
            />
          </div>

          {referredUsers.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h4 className="text-xs font-semibold text-foreground">
                Motoristas indicados por ele ({referredUsers.length})
              </h4>
              <div className="grid gap-2">
                {referredUsers.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-border bg-card flex items-center justify-between text-xs shadow-sm"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      {item.indicado?.id ? (
                        <Link
                          to={`${ROUTES.PRIVATE.ADMIN.USERS}/${item.indicado.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors truncate block"
                        >
                          {item.indicado.nome}
                        </Link>
                      ) : (
                        <p className="font-semibold text-foreground truncate">
                          {item.indicado?.nome || "Motorista indicado"}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {item.indicado?.telefone && (
                          <span className="font-mono">{phoneMask(item.indicado.telefone)}</span>
                        )}
                        <span>•</span>
                        <span>{formatSafeBrazilianDate(item.created_at)}</span>
                      </div>
                    </div>
                    <div>
                      {item.status === IndicacaoStatus.COMPLETED ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          Convertido
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          Em teste
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
