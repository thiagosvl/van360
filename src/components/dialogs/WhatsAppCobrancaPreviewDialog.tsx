import { BaseDialog } from "@/components/ui/BaseDialog";
import { safeCloseDialog } from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useLayout } from "@/contexts/LayoutContext";
import { getDriverDisplayName } from "@/utils/formatters/user";
import { KeyRound } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { WhatsAppMessageContainer, WhatsAppActionButton } from "@/components/ui/WhatsAppMessageContainer";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const PREVIEW_COBRANCA_MODALIDADE = {
  LEMBRETE: "lembrete",
  AUTOMATICA: "automatica",
} as const;

export type PreviewCobrancaModalidade =
  (typeof PREVIEW_COBRANCA_MODALIDADE)[keyof typeof PREVIEW_COBRANCA_MODALIDADE];

export interface WhatsAppCobrancaPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
  passageiroNome?: string;
  userChavePix?: string | null;
  showPixSetupAction?: boolean;
  modalidade?: PreviewCobrancaModalidade;
}

export function WhatsAppCobrancaPreviewDialog({
  isOpen,
  onClose,
  driverName: customDriverName,
  passageiroNome = "Bianca",
  userChavePix: customChavePix,
  showPixSetupAction = false,
  modalidade = PREVIEW_COBRANCA_MODALIDADE.LEMBRETE,
}: WhatsAppCobrancaPreviewDialogProps) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { openEditarPixDialog } = useLayout();
  const [activeTab, setActiveTab] = useState<"com_pix" | "sem_pix">("sem_pix");

  const isModoAutomatica = modalidade === PREVIEW_COBRANCA_MODALIDADE.AUTOMATICA;
  const studentFirstName = passageiroNome.trim().split(" ")[0] || "Bianca";

  const activeDriverName =
    customDriverName ||
    getDriverDisplayName(profile, { fallback: "Tio(a) da Van" });

  const activeChavePix = customChavePix !== undefined ? customChavePix : profile?.chave_pix;

  const dialogTitle = isModoAutomatica
    ? "Cobrança com Baixa Automática"
    : "Lembrete de Vencimento";

  const dialogSubtitle = isModoAutomatica
    ? "Exemplo de cobrança enviada aos responsáveis"
    : "Exemplo de aviso enviado no WhatsApp";

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && safeCloseDialog(onClose)}
      maxWidth="md"
    >
      <BaseDialog.Header
        title={dialogTitle}
        subtitle={dialogSubtitle}
        icon={<WhatsAppIcon className="w-5 h-5 text-emerald-600" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <BaseDialog.Body className="p-2.5 min-[360px]:p-3 sm:p-4 bg-[#f5f5f5]/60 flex flex-col items-center overflow-y-auto">
        {!isModoAutomatica && (
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "com_pix" | "sem_pix")}
            className="w-full max-w-sm mb-2 min-[360px]:mb-3 sm:mb-4"
          >
            <TabsList className="grid grid-cols-2 w-full bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5] min-h-[38px] sm:min-h-[42px]">
              <TabsTrigger
                value="sem_pix"
                className="text-xs sm:text-sm font-medium py-2 px-4 rounded-[18px] transition-all data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 cursor-pointer"
              >
                Sem Chave Pix
              </TabsTrigger>
              <TabsTrigger
                value="com_pix"
                className="text-xs sm:text-sm font-medium py-2 px-4 rounded-[18px] transition-all data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 cursor-pointer"
              >
                Com Chave Pix
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <WhatsAppMessageContainer
          driverName={activeDriverName}
          time="16:22"
          actionButton={
            isModoAutomatica ? (
              <WhatsAppActionButton
                label="Copiar código Pix"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="w-[18px] h-[18px] stroke-[#00a884] fill-none stroke-[1.6]"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                }
              />
            ) : activeTab === "com_pix" ? (
              <WhatsAppActionButton
                label="Copiar chave Pix"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="w-[18px] h-[18px] stroke-[#00a884] fill-none stroke-[1.6]"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                }
              />
            ) : undefined
          }
          footerNote={
            isModoAutomatica
              ? "Ao pagar via Pix, a baixa na parcela é dada instantaneamente e o valor é repassado para sua conta."
              : activeTab === "com_pix"
                ? "Com a chave Pix informada, os pais copiam com 1 toque no WhatsApp para transferir direto para você."
                : "Sem chave Pix cadastrada, os pais recebem apenas o lembrete em texto com valor e vencimento."
          }
        >
          {isModoAutomatica ? (
            <>
              <p>
                Olá Thiago, a cobrança do transporte escolar de {studentFirstName} no valor de R$ 140,00 vence HOJE.
              </p>
              <p>
                Pague com Pix através do botão abaixo para confirmação e baixa instantânea da parcela.
              </p>
              <p className="italic text-[#54656f] text-[11px] leading-[18px]">
                Caso já tenha efetuado o pagamento, por favor desconsidere esta mensagem.
              </p>
            </>
          ) : activeTab === "com_pix" ? (
            <>
              <p>
                Olá Thiago, a parcela do transporte escolar de {studentFirstName} no valor de R$ 140,00 vence HOJE.
              </p>
              <p>
                Por favor, realize a transferência para manter o transporte em dia.
              </p>
              <p className="italic text-[#54656f] text-[11px] leading-[18px]">
                Caso já tenha efetuado o pagamento, por favor desconsidere esta mensagem.
              </p>
            </>
          ) : (
            <>
              <p>
                Olá Thiago, a parcela do transporte escolar de {studentFirstName} no valor de R$ 140,00 vence HOJE.
              </p>
              <p>
                Por favor, efetue o pagamento para manter o transporte em dia.
              </p>
              <p className="italic text-[#54656f] text-[11px] leading-[18px]">
                Caso já tenha efetuado o pagamento, por favor desconsidere esta mensagem.
              </p>
            </>
          )}
        </WhatsAppMessageContainer>
      </BaseDialog.Body>

      {!isModoAutomatica && showPixSetupAction && !activeChavePix && activeTab === "com_pix" && (
        <BaseDialog.Footer className="py-2.5 px-4 min-[360px]:p-5 sm:p-6 bg-[#f5f5f5] flex gap-4 border-t border-[#e5e5e5] shrink-0 pb-[max(0.625rem,var(--safe-area-bottom))]">
          <BaseDialog.Action
            label="Cadastrar chave Pix"
            variant="primary"
            icon={<KeyRound className="w-4 h-4 mr-1.5" />}
            onClick={() => {
              safeCloseDialog(() => {
                onClose();
                openEditarPixDialog();
              });
            }}
            className="h-11 min-[360px]:h-12 text-xs min-[360px]:text-sm"
          />
        </BaseDialog.Footer>
      )}
    </BaseDialog>
  );
}
export default WhatsAppCobrancaPreviewDialog;
