import { ActionSheet } from "@/components/common/ActionSheet";
import { MobileActionItem, MobileAction } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MembroEquipe } from "@/types/equipe";
import { UserType } from "@/types/enums";
import { formatShortName } from "@/utils/formatters/name";
import { phoneMask } from "@/utils/masks";
import { Car, ChevronRight, Edit, KeyRound, Mail, Phone, Trash2, UserCheck, Users2, XCircle, CheckCircle2 } from "lucide-react";
import { memo, useState } from "react";
import { EquipeSummary } from "./EquipeSummary";
import { cn } from "@/lib/utils";

interface EquipeListProps {
  membros: MembroEquipe[];
  isGestor: boolean;
  onEdit: (membro: MembroEquipe) => void;
  onResetPassword: (membro: MembroEquipe) => void;
  onToggleStatus: (membro: MembroEquipe) => void;
  onDelete: (membro: MembroEquipe) => void;
}

const EquipeMobileCard = memo(function EquipeMobileCard({
  membro,
  index,
  isGestor,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
}: { membro: MembroEquipe; index: number } & Omit<EquipeListProps, "membros">) {
  const isMonitor = membro.tipo === UserType.MONITOR;
  const displayName = membro.apelido || formatShortName(membro.nome, true);

  const actions: MobileAction[] = [
    {
      label: "Editar Dados",
      icon: <Edit className="w-4 h-4" />,
      onClick: () => onEdit(membro),
    },
    {
      label: "Redefinir Senha",
      icon: <KeyRound className="w-4 h-4" />,
      onClick: () => onResetPassword(membro),
    },
    ...(isGestor
      ? [
        {
          label: membro.ativo !== false ? "Desativar" : "Ativar",
          icon: membro.ativo !== false ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />,
          isDestructive: membro.ativo !== false,
          variant: (membro.ativo !== false ? "destructive" : "default") as "destructive" | "default",
          onClick: () => onToggleStatus(membro),
        },
        {
          label: "Excluir",
          icon: <Trash2 className="w-4 h-4" />,
          isDestructive: true,
          variant: "destructive" as const,
          onClick: () => onDelete(membro),
        },
      ]
      : []),
  ];

  const renderHeader = () => <EquipeSummary membro={membro} />;

  return (
    <MobileActionItem
      key={membro.id}
      actions={actions}
      showHint={index === 0}
      showTrigger={false}
      className="bg-transparent"
      renderHeader={renderHeader}
    >
      <div className="bg-white p-3.5 sm:p-4 rounded-[20px] border border-[#e5e5e5] shadow-xs flex items-center justify-between gap-3 active:scale-[0.99] transition-all cursor-pointer group">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a] shrink-0">
            {isMonitor ? <Users2 className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <h4 className="font-semibold text-sm text-[#0a0a0a] tracking-tight line-clamp-1 leading-snug">
              {displayName}
            </h4>

            {membro.veiculos ? (
              <p className="text-xs text-[#737373] font-normal flex items-center gap-1 mt-0.5 truncate">
                <Car className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                <span className="truncate">{membro.veiculos.modelo} ({membro.veiculos.placa})</span>
              </p>
            ) : (
              <p className="text-xs text-[#737373]/70 font-normal mt-0.5">Sem veículo atribuído</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={membro.ativo !== false} />
          <ChevronRight className="w-4 h-4 text-[#737373]/50 group-hover:text-[#0a0a0a] transition-colors" />
        </div>
      </div>
    </MobileActionItem>
  );
});

export const EquipeList = memo(function EquipeList({
  membros,
  isGestor,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
}: EquipeListProps) {
  const [selectedMembro, setSelectedMembro] = useState<MembroEquipe | null>(null);

  return (
    <>
      <ResponsiveDataList
        data={membros}
      mobileContainerClassName="space-y-2.5"
      mobileItemRenderer={(membro, index) => (
        <EquipeMobileCard
          key={membro.id}
          membro={membro}
          index={index}
          isGestor={isGestor}
          onEdit={onEdit}
          onResetPassword={onResetPassword}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      )}
    >
      <div className="rounded-[24px] overflow-hidden bg-white border border-[#e5e5e5] shadow-xs">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="px-6 py-4 text-left text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                Membro
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                Contato
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                Veículo Atribuído
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                Status
              </th>
              <th className="px-6 py-4 text-right text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e5]">
            {membros.map((membro) => {
              const isMonitor = membro.tipo === UserType.MONITOR;
              const displayName = membro.apelido ? `${membro.nome} (${membro.apelido})` : membro.nome;

              const desktopActions = [
                {
                  label: "Editar Dados",
                  icon: <Edit className="w-4 h-4" />,
                  onClick: () => onEdit(membro),
                },
                {
                  label: "Redefinir Senha",
                  icon: <KeyRound className="w-4 h-4" />,
                  onClick: () => onResetPassword(membro),
                },
                ...(isGestor
                  ? [
                    {
                      label: membro.ativo !== false ? "Desativar Acesso" : "Ativar Acesso",
                      icon: membro.ativo !== false ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />,
                      isDestructive: membro.ativo !== false,
                      onClick: () => onToggleStatus(membro),
                    },
                    {
                      label: "Excluir",
                      icon: <Trash2 className="w-4 h-4" />,
                      isDestructive: true,
                      onClick: () => onDelete(membro),
                    },
                  ]
                  : []),
              ];

              return (
                <tr
                  key={membro.id}
                  onClick={() => setSelectedMembro(membro)}
                  className="group hover:bg-[#fafafa]/80 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a] shrink-0">
                        {isMonitor ? <Users2 className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="font-semibold text-[#0a0a0a] text-sm tracking-tight truncate max-w-[220px]">
                          {displayName}
                        </p>
                        <p className="text-xs text-[#737373] font-normal">
                          {isMonitor ? "Monitor" : "Motorista"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-col text-xs space-y-0.5">
                      <span className="text-[#0a0a0a] font-medium flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[#737373]" />
                        {phoneMask(membro.telefone || "")}
                      </span>
                      <span className="text-[#737373] truncate max-w-[200px] flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-[#737373]" />
                        {membro.email}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 align-middle">
                    {membro.veiculos ? (
                      <div className="flex items-center gap-2 text-xs">
                        <Car className="w-4 h-4 text-[#737373] shrink-0" />
                        <span className="text-[#0a0a0a] font-medium">
                          {membro.veiculos.modelo} <span className="text-[#737373]">({membro.veiculos.placa})</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#737373]/70 font-normal">Não atribuído</span>
                    )}
                  </td>

                  <td className="px-6 py-4 align-middle">
                    <StatusBadge status={membro.ativo !== false} />
                  </td>

                  <td className="px-6 py-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                    <ActionsDropdown
                      actions={desktopActions}
                      title="Opções do Membro"
                      description={membro.nome}
                      header={<EquipeSummary membro={membro} />}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ResponsiveDataList>

    {selectedMembro && (
      <ActionSheetWrapper
        membro={selectedMembro}
        open={!!selectedMembro}
        onOpenChange={(open) => !open && setSelectedMembro(null)}
        isGestor={isGestor}
        onEdit={onEdit}
        onResetPassword={onResetPassword}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
      />
    )}
    </>
  );
});

function ActionSheetWrapper({
  membro,
  open,
  onOpenChange,
  isGestor,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
}: {
  membro: MembroEquipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isGestor: boolean;
  onEdit: (membro: MembroEquipe) => void;
  onResetPassword: (membro: MembroEquipe) => void;
  onToggleStatus: (membro: MembroEquipe) => void;
  onDelete: (membro: MembroEquipe) => void;
}) {
  const actions = [
    {
      label: "Editar Dados",
      icon: <Edit className="w-4 h-4" />,
      onClick: () => {
        onOpenChange(false);
        onEdit(membro);
      },
    },
    {
      label: "Redefinir Senha",
      icon: <KeyRound className="w-4 h-4" />,
      onClick: () => {
        onOpenChange(false);
        onResetPassword(membro);
      },
    },
    ...(isGestor
      ? [
        {
          label: membro.ativo !== false ? "Desativar" : "Ativar",
          icon: membro.ativo !== false ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />,
          isDestructive: membro.ativo !== false,
          variant: (membro.ativo !== false ? "destructive" : "default") as "destructive" | "default",
          onClick: () => {
            onOpenChange(false);
            onToggleStatus(membro);
          },
        },
        {
          label: "Excluir",
          icon: <Trash2 className="w-4 h-4" />,
          isDestructive: true,
          variant: "destructive" as const,
          onClick: () => {
            onOpenChange(false);
            onDelete(membro);
          },
        },
      ]
      : []),
  ];

  return (
    <ActionSheet open={open} onOpenChange={onOpenChange} actions={actions}>
      <EquipeSummary membro={membro} />
    </ActionSheet>
  );
}
