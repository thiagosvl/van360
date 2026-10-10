import { useState } from "react";
import { Monitor, Smartphone, Globe, Copy, Check, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { copyToClipboard } from "@/utils/browser";
import { toast } from "sonner";
import { DISPOSITIVO_CADASTRO_CONFIG } from "@/utils/dispositivo-cadastro.utils";
import { DispositivoCadastro } from "@/types/enums";

interface AdminSolicitacaoAccessDetailsProps {
  dispositivoCadastro?: string | null;
  metadadosCadastro?: Record<string, unknown> | null;
  createdAt: string;
  variant?: "table" | "mobile";
}

export function AdminSolicitacaoAccessDetails({
  dispositivoCadastro,
  metadadosCadastro,
  createdAt,
  variant = "table",
}: AdminSolicitacaoAccessDetailsProps) {
  const [copiedIp, setCopiedIp] = useState(false);
  const [copiedUa, setCopiedUa] = useState(false);

  const hasAccessData = Boolean(
    dispositivoCadastro ||
    (metadadosCadastro && Object.keys(metadadosCadastro).length > 0)
  );

  if (!hasAccessData) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-[11px] text-muted-foreground italic cursor-default select-none">
            Não registrado
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-popover border-border text-popover-foreground text-xs">
          Solicitação anterior à implementação do rastreamento de acesso.
        </TooltipContent>
      </Tooltip>
    );
  }

  const dispKey = (dispositivoCadastro as DispositivoCadastro) || "NAO_INFORMADO";
  const dispConfig =
    DISPOSITIVO_CADASTRO_CONFIG[dispKey] ||
    DISPOSITIVO_CADASTRO_CONFIG.NAO_INFORMADO;

  const isMobileDisp =
    dispKey === DispositivoCadastro.APP_ANDROID ||
    dispKey === DispositivoCadastro.APP_IOS ||
    dispKey === DispositivoCadastro.WEB_MOBILE_ANDROID ||
    dispKey === DispositivoCadastro.WEB_MOBILE_IOS;

  const DispIcon = isMobileDisp ? Smartphone : dispKey === DispositivoCadastro.WEB_DESKTOP ? Monitor : Globe;

  const ip = typeof metadadosCadastro?.ip === "string" ? metadadosCadastro.ip : null;
  const userAgent = typeof metadadosCadastro?.user_agent === "string" ? metadadosCadastro.user_agent : null;
  const so = typeof metadadosCadastro?.so === "string" ? metadadosCadastro.so : null;
  const navegador = typeof metadadosCadastro?.navegador === "string" ? metadadosCadastro.navegador : null;
  const screen = typeof metadadosCadastro?.screen === "string" ? metadadosCadastro.screen : null;
  const referrer = typeof metadadosCadastro?.referrer === "string" ? metadadosCadastro.referrer : null;
  const utm = typeof metadadosCadastro?.utm === "object" && metadadosCadastro?.utm !== null
    ? (metadadosCadastro.utm as Record<string, string>)
    : null;

  const handleCopyIp = async () => {
    if (!ip) return;
    const success = await copyToClipboard(ip);
    if (success) {
      setCopiedIp(true);
      toast.success("IP copiado para a área de transferência!");
      setTimeout(() => setCopiedIp(false), 2000);
    }
  };

  const handleCopyUa = async () => {
    if (!userAgent) return;
    const success = await copyToClipboard(userAgent);
    if (success) {
      setCopiedUa(true);
      toast.success("User-Agent copiado!");
      setTimeout(() => setCopiedUa(false), 2000);
    }
  };

  const formattedDateTime = new Date(createdAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={
            variant === "mobile"
              ? "flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-foreground transition-colors text-left"
              : "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-secondary/50 hover:bg-secondary border border-border text-foreground transition-colors group cursor-pointer"
          }
          title="Clique para ver os detalhes técnicos de acesso"
        >
          <DispIcon
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: dispConfig.color }}
          />
          <span className="text-xs font-medium text-foreground truncate max-w-[130px]">
            {dispConfig.label}
          </span>
          <Info className="h-3 w-3 text-muted-foreground group-hover:text-primary shrink-0 ml-0.5 transition-colors" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={variant === "mobile" ? "start" : "end"}
        className="w-80 p-4 bg-popover border-border text-popover-foreground rounded-2xl shadow-xl space-y-3.5 text-left"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border border-border"
              style={{ backgroundColor: `${dispConfig.color}20` }}
            >
              <DispIcon className="h-4 w-4" style={{ color: dispConfig.color }} />
            </div>
            <div className="min-w-0">
              <h5 className="text-xs font-semibold text-foreground truncate">
                Detalhes do acesso
              </h5>
              <p className="text-[10px] text-muted-foreground">
                {formattedDateTime}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-semibold px-2 py-0.5 border"
            style={{
              color: dispConfig.color,
              borderColor: `${dispConfig.color}40`,
              backgroundColor: `${dispConfig.color}15`,
            }}
          >
            {dispConfig.label}
          </Badge>
        </div>

        {ip && (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-secondary/50 border border-border">
            <div className="min-w-0">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
                Endereço IP
              </span>
              <span className="text-xs font-mono font-bold text-primary truncate block">
                {ip}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyIp}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg shrink-0"
              title="Copiar IP"
            >
              {copiedIp ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-secondary/40 border border-border">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
              Sistema operacional
            </span>
            <span className="font-medium text-foreground truncate block mt-0.5">
              {so || "Não detectado"}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-secondary/40 border border-border">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
              Navegador
            </span>
            <span className="font-medium text-foreground truncate block mt-0.5">
              {navegador || "Não detectado"}
            </span>
          </div>
        </div>

        {screen && (
          <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-secondary/30 border border-border/60">
            <span className="text-[10px] text-muted-foreground">Resolução de tela:</span>
            <span className="font-mono text-[10px] text-foreground font-medium">{screen}</span>
          </div>
        )}

        {(referrer || utm) && (
          <div className="p-2 rounded-xl bg-secondary/40 border border-border space-y-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
              Origem da visita
            </span>
            {referrer && (
              <p className="text-[10px] text-foreground font-mono truncate" title={referrer}>
                <span className="text-muted-foreground">Ref: </span>
                {referrer}
              </p>
            )}
            {utm && Object.keys(utm).length > 0 && (
              <p className="text-[10px] text-emerald-500 font-mono">
                {utm.source && <span className="font-bold">{utm.source}</span>}
                {utm.medium && <span className="text-muted-foreground"> / {utm.medium}</span>}
                {utm.campaign && <span className="text-muted-foreground"> ({utm.campaign})</span>}
              </p>
            )}
          </div>
        )}

        {userAgent && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                User-Agent
              </span>
              <button
                type="button"
                onClick={handleCopyUa}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedUa ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2 rounded-xl bg-background border border-border text-[10px] font-mono text-muted-foreground max-h-20 overflow-y-auto break-all select-all leading-tight">
              {userAgent}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
