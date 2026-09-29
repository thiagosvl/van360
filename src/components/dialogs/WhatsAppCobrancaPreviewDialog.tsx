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

export interface WhatsAppCobrancaPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
  passageiroNome?: string;
  userChavePix?: string | null;
  showPixSetupAction?: boolean;
}

export function WhatsAppCobrancaPreviewDialog({
  isOpen,
  onClose,
  driverName: customDriverName,
  passageiroNome = "Bianca",
  userChavePix: customChavePix,
  showPixSetupAction = false,
}: WhatsAppCobrancaPreviewDialogProps) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { openEditarPixDialog } = useLayout();
  const [activeTab, setActiveTab] = useState<"com_pix" | "sem_pix">("com_pix");

  const studentFirstName = passageiroNome.trim().split(" ")[0] || "Bianca";

  const activeDriverName =
    customDriverName ||
    getDriverDisplayName(profile, { fallback: "Tio(a) da Van" });

  const activeChavePix = customChavePix !== undefined ? customChavePix : profile?.chave_pix;

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && safeCloseDialog(onClose)}
      maxWidth="md"
    >
      <BaseDialog.Header
        title="Cobrança Automática"
        subtitle="Exemplo de mensagem enviada aos pais"
        icon={<WhatsAppIcon className="w-5 h-5 text-emerald-600" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <BaseDialog.Body className="p-2.5 min-[360px]:p-3 sm:p-4 bg-slate-100/60 flex flex-col items-center overflow-y-auto">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "com_pix" | "sem_pix")}
          className="w-full max-w-sm mb-2 min-[360px]:mb-3 sm:mb-4"
        >
          <TabsList className="grid grid-cols-2 w-full bg-slate-200/90 p-1 rounded-xl h-9 min-[360px]:h-10">
            <TabsTrigger
              value="com_pix"
              className="text-xs font-bold py-1 min-[360px]:py-1.5 rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs cursor-pointer"
            >
              Com Chave Pix
            </TabsTrigger>
            <TabsTrigger
              value="sem_pix"
              className="text-xs font-bold py-1 min-[360px]:py-1.5 rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-xs cursor-pointer"
            >
              Sem Chave Pix
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <WhatsAppMessageContainer
          driverName={activeDriverName}
          time="16:22"
          actionButton={
            activeTab === "com_pix" ? (
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
            ) : undefined
          }
          footerNote={
            activeTab === "com_pix"
              ? "Com o Pix cadastrado, os pais copiam o código com 1 toque no WhatsApp e pagam no banco sem erro de digitação."
              : "Sem chave Pix cadastrada, os pais recebem apenas o lembrete em texto."
          }
        >
          <p>
            Olá Thiago, a parcela do transporte escolar de {studentFirstName} no valor de R$ 140,00 vence HOJE.
          </p>

          <p>
            Por favor, efetue o pagamento para manter o transporte em dia.
          </p>

          <p className="italic text-[#54656f] text-[13.5px] leading-[18px]">
            Caso já tenha efetuado o pagamento, por favor desconsidere esta mensagem.
          </p>
        </WhatsAppMessageContainer>
      </BaseDialog.Body>

      {showPixSetupAction && !activeChavePix && activeTab === "com_pix" && (
        <BaseDialog.Footer className="py-2.5 px-4 min-[360px]:p-5 sm:p-6 bg-slate-50/40 flex gap-4 border-t border-slate-100/60 shrink-0 pb-[max(0.625rem,var(--safe-area-bottom))]">
          <BaseDialog.Action
            label="Ativar botão Pix no WhatsApp"
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
