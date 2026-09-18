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

export default function AdminDriverCobrancaDemoDialog({
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
        title="Cobrança Teste (WhatsApp)"
        subtitle="Demonstração do template oficial de cobrança dos pais"
        icon={<Sparkles className="h-5 w-5 text-emerald-400" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <AdminBaseDialog.Body className="space-y-4">
        <Banner
          variant="info"
          title="Simulação Direta sem Sujeira no Banco"
          description="Dispara a mensagem oficial diretamente para o WhatsApp do motorista, simulando a visão dos pais. Não cria alunos ou parcelas fictícias no banco de dados."
        />

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-3">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
            Parâmetros da Demonstração (WABA)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                Destinatário (WhatsApp)
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {userPhone ? phoneMask(userPhone) : "Telefone não informado"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                Nome no Cabeçalho
              </span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block truncate">
                {userApelido || userName}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                Aluno Simulado
              </span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                <GraduationCap className="h-3 w-3 text-purple-400" />
                {alunoTesteNome}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                Responsável Simulado
              </span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 flex items-center gap-1 truncate">
                <User className="h-3 w-3 text-blue-400" />
                {userName}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                Valor da Parcela
              </span>
              <span className="text-sm font-black text-emerald-400 font-headline mt-0.5 flex items-center gap-0.5">
                <DollarSign className="h-3.5 w-3.5" />
                {formatCurrency(300)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                Vencimento
              </span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-amber-400" />
                {dataHojeStr} (Hoje)
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <QrCode className="h-3.5 w-3.5 text-blue-400" />
              Botão Copiar Chave PIX:
            </span>
            {userChavePix ? (
              <span className="text-emerald-400 font-bold">
                Ativo ({userTipoChavePix || "PIX"}: {userChavePix})
              </span>
            ) : (
              <span className="text-amber-400 font-medium">
                Template sem PIX (chave não cadastrada)
              </span>
            )}
          </div>
        </div>
      </AdminBaseDialog.Body>

      <AdminBaseDialog.Footer>
        <Button
          type="button"
          variant="ghost"
          onClick={() => safeCloseDialog(onClose)}
          disabled={dispatchDemo.isPending}
          className="rounded-xl text-slate-400 hover:text-white"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={dispatchDemo.isPending || !userPhone}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Send className="h-4 w-4" />
          {dispatchDemo.isPending ? "Disparando..." : "Disparar Teste Agora"}
        </Button>
      </AdminBaseDialog.Footer>
    </AdminBaseDialog>
  );
}