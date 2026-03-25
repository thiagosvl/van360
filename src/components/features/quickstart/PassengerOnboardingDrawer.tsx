import { ActionSheet, ActionSheetItem } from "@/components/common/ActionSheet";
import { Usuario } from "@/types/usuario";
import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import { toast } from "@/utils/notifications/toast";
import { Copy, CopyCheck, UserPlus, Users } from "lucide-react";
import { useState } from "react";

interface PassengerOnboardingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManualRegistration: () => void;
  profile?: Usuario | null;
}

export function PassengerOnboardingDrawer({
  open,
  onOpenChange,
  onManualRegistration,
  profile,
}: PassengerOnboardingDrawerProps) {
  const [copied, setCopied] = useState(false);

  const handleShareLink = () => {
    if (!profile?.id) return;

    const link = buildPrepassageiroLink(profile.id);

    // Copia silenciosamente, apenas feedback visual no ícone
    navigator.clipboard.writeText(link).then(() => {
        setCopied(true);
        toast.success("sistema.sucesso.linkCopiado", {
          description: "sistema.sucesso.linkCopiadoDescricao",
        });
        // Reset visual state after 2s
        setTimeout(() => setCopied(false), 2000);
    });
  };

  const actions: ActionSheetItem[] = [
    {
      label: copied ? "Link Copiado!" : "Copiar Link de Cadastro",
      description: "Copie o link e envie para o responsável preencher.",
      icon: copied ? <CopyCheck className="h-5 w-5" /> : <Copy className="h-5 w-5" />,
      onClick: handleShareLink,
    },
    {
      label: "Cadastrar Manualmente",
      description: "Preencha você mesmo os dados do passageiro e do responsável.",
      icon: <UserPlus className="h-5 w-5" />,
      onClick: onManualRegistration,
    }
  ];

  return (
    <ActionSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Cadastrar Passageiro"
      actions={actions}
    >
        <div className="flex flex-col items-center justify-center pt-2 pb-6 px-6 text-center">
             <div className="h-16 w-16 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 mb-4 shadow-sm border border-blue-100/50 dark:border-blue-800/30 transition-transform active:scale-95">
               <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-[260px] leading-relaxed">
                Escolha como você prefere adicionar seu primeiro passageiro.
            </p>
        </div>
    </ActionSheet>
  );
}
