import {
  Send,
  MessageSquare,
  User,
  Phone,
  DollarSign,
  Calendar,
  Sparkles,
  QrCode,
  GraduationCap,
} from "lucide-react";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { useDispatchDriverCobrancaDemoAdmin } from "@/hooks/api/adminHooks";
import { phoneMask } from "@/utils/masks";
import { formatCurrency } from "@/utils/formatters/currency";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

export interface AdminDriverCobrancaDemoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userPhone?: string;
  userApelido?: string;
  userChavePix?: string;
  userTipoChavePix?: string;
}

export function AdminDriverCobrancaDemoDialog({
  isOpen,
  onClose,
  userId,
  userName,
  userPhone,
  userApelido,
  userChavePix,
  userTipoChavePix,
}: AdminDriverCobrancaDemoDialogProps) {
  const dispatchDemo = useDispatchDriverCobrancaDemoAdmin(userId);

  const primeiroNome = userName?.trim().split(/\s+/)[0] || "Motorista";
  const alunoTesteNome = `TESTE ${primeiroNome}`;
  const dataHojeStr = new Date().toLocaleDateString("pt-BR");

  const handleConfirm = async () => {
    try {
      await dispatchDemo.mutateAsync(userId);
      safeCloseDialog(onClose);
    } catch {
    }
  };

  return (
    <AdminBaseDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          safeCloseDialog(onClose);
        }
      }}
      maxWidth="md"
      description="Disparo de demonstração da notificação oficial de cobrança dos pais via WhatsApp"
    >
      <AdminBaseDialog.Header
        title="Cobrança teste (WhatsApp)"
        subtitle="Demonstração do template oficial de cobrança dos pais"
        icon={<Sparkles className="h-5 w-5 text-emerald-400" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <AdminBaseDialog.Body className="space-y-4">
        <Banner
          variant="info"
          title="Simulação direta sem resíduos no banco"
          description="Dispara a mensagem oficial diretamente para o WhatsApp do motorista, simulando a visão dos pais. Não cria alunos ou parcelas fictícias no banco de dados."
        />

        <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/30 border border-border text-left space-y-3">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
            Parâmetros da demonstração (WABA)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-card border border-border">
              <span className="text-[10px] font-medium text-muted-foreground block">
                Destinatário (WhatsApp)
              </span>
              <span className="text-xs font-semibold text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {userPhone ? phoneMask(userPhone) : "Telefone não informado"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-card border border-border">
              <span className="text-[10px] font-medium text-muted-foreground block">
                Nome no cabeçalho
              </span>
              <span className="text-xs font-semibold text-foreground mt-0.5 block truncate">
                {userApelido || userName}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-card border border-border">
              <span className="text-[10px] font-medium text-muted-foreground block">
                Aluno simulado
              </span>
              <span className="text-xs font-semibold text-foreground mt-0.5 flex items-center gap-1">
                <GraduationCap className="h-3 w-3 text-purple-400" />
                {alunoTesteNome}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-card border border-border">
              <span className="text-[10px] font-medium text-muted-foreground block">
                Responsável simulado
              </span>
              <span className="text-xs font-semibold text-foreground mt-0.5 flex items-center gap-1 truncate">
                <User className="h-3 w-3 text-primary" />
                {userName}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-card border border-border">
              <span className="text-[10px] font-medium text-muted-foreground block">
                Valor da parcela
              </span>
              <span className="text-sm font-bold text-emerald-400 font-headline mt-0.5 flex items-center gap-0.5">
                <DollarSign className="h-3.5 w-3.5" />
                {formatCurrency(300)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-card border border-border">
              <span className="text-[10px] font-medium text-muted-foreground block">
                Vencimento
              </span>
              <span className="text-xs font-semibold text-foreground mt-0.5 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-amber-400" />
                {dataHojeStr} (Hoje)
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <QrCode className="h-3.5 w-3.5 text-primary" />
              Botão copiar chave Pix:
            </span>
            {userChavePix ? (
              <span className="text-emerald-400 font-semibold text-[11px]">
                Ativo ({userTipoChavePix || "Pix"}: {userChavePix})
              </span>
            ) : (
              <span className="text-amber-400 font-medium text-[11px]">
                Template sem Pix (chave não cadastrada)
              </span>
            )}
          </div>
        </div>
      </AdminBaseDialog.Body>

      <AdminBaseDialog.Footer>
        <AdminBaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={() => safeCloseDialog(onClose)}
          disabled={dispatchDemo.isPending}
        />
        <AdminBaseDialog.Action
          label={dispatchDemo.isPending ? "Disparando..." : "Disparar teste agora"}
          variant="primary"
          icon={<Send className="h-4 w-4" />}
          onClick={handleConfirm}
          isLoading={dispatchDemo.isPending}
          disabled={dispatchDemo.isPending || !userPhone}
        />
      </AdminBaseDialog.Footer>
    </AdminBaseDialog>
  );
}

export default AdminDriverCobrancaDemoDialog;