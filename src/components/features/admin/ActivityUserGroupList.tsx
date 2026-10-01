import { Users, Loader2 } from "lucide-react";
import type { AdminUserGroupLogItem, AdminUserLogItem } from "@/services/api/admin/admin-log.api";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { ActivityUserGroupCard } from "./ActivityUserGroupCard";

interface ActivityUserGroupListProps {
  userGroups: AdminUserGroupLogItem[];
  isLoading?: boolean;
  onInspectLog: (log: AdminUserLogItem) => void;
  onOpenDetails: (userGroup: AdminUserGroupLogItem) => void;
}

export function ActivityUserGroupList({
  userGroups,
  isLoading,
  onInspectLog,
  onOpenDetails,
}: ActivityUserGroupListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!userGroups || userGroups.length === 0) {
    return (
      <AdminEmptyState
        icon={Users}
        title="Nenhum usuário com atividade encontrado"
        description="Nenhum usuário realizou ações no período selecionado ou com os filtros aplicados."
      />
    );
  }

  return (
    <div className="space-y-4">
      {userGroups.map((group, index) => (
        <ActivityUserGroupCard
          key={group.usuario_id}
          userGroup={group}
          onInspectLog={onInspectLog}
          onOpenDetails={onOpenDetails}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
}
