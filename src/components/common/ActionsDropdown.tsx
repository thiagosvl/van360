import { Button } from "@/components/ui/button";
import { ActionItem } from "@/types/actions";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import React, { useState } from "react";
import { ActionSheet } from "./ActionSheet";

interface ActionsDropdownProps {
  actions: ActionItem[];
  triggerClassName?: string;
  triggerSize?: "sm" | "icon" | "default" | "lg";
  align?: "end" | "center" | "start";
  disabled?: boolean;
  title?: string;
  description?: string;
  header?: React.ReactNode;
  customTrigger?: React.ReactNode;
}

export function ActionsDropdown({
  actions,
  triggerClassName = "h-8 w-8 p-0",
  triggerSize = "sm",
  disabled = false,
  title,
  description,
  header,
  customTrigger,
}: ActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const visibleActions = actions.filter((a) => !a.hidden);

  if (visibleActions.length === 0 || disabled) {
    if (customTrigger) {
      return (
        <div className="opacity-30 pointer-events-none">
          {customTrigger}
        </div>
      );
    }
    return (
      <Button
        variant="ghost"
        size={triggerSize}
        className={cn(
          "h-8 w-8 rounded-[18px] text-[#737373] cursor-not-allowed opacity-30 border border-transparent",
          triggerClassName
        )}
        disabled
        aria-label="Abrir menu de ações"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      {customTrigger ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="cursor-pointer"
        >
          {customTrigger}
        </div>
      ) : (
        <Button
          variant="ghost"
          size={triggerSize}
          className={cn(
            "h-8 w-8 rounded-[18px] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] opacity-100 transition-all border border-transparent hover:border-[#e5e5e5] cursor-pointer",
            triggerClassName
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          aria-label="Abrir menu de ações"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      )}

      <ActionSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        title={title}
        description={description}
        actions={visibleActions.map((action) => ({
          label: action.label,
          title: action.title,
          description: action.description,
          icon: action.icon,
          onClick: action.onClick,
          disabled: action.disabled,
          isLoading: action.isLoading,
          isLink: action.isLink,
          href: action.href,
          isDestructive: action.isDestructive || action.variant === "destructive",
          className: action.className,
          hasSeparatorAfter: action.hasSeparatorAfter,
        }))}
      >
        {header}
      </ActionSheet>
    </>
  );
}
