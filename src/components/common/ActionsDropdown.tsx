import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ActionItem } from "@/types/actions";
import { MoreVertical } from "lucide-react";

interface ActionsDropdownProps {
  actions: ActionItem[];
  triggerClassName?: string;
  triggerSize?: "sm" | "icon" | "default" | "lg";
  align?: "end" | "center" | "start";
  disabled?: boolean;
}

export function ActionsDropdown({
  actions,
  triggerClassName = "h-8 w-8 p-0",
  triggerSize = "sm",
  align = "end",
  disabled = false,
}: ActionsDropdownProps) {
  // Filter out hidden actions
  const visibleActions = actions.filter((a) => !a.hidden);

  if (visibleActions.length === 0 || disabled) {
    return (
      <Button
        variant="ghost"
        size={triggerSize}
        className={cn("text-gray-300 cursor-not-allowed", triggerClassName)}
        disabled
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={triggerSize}
          className={cn("h-8 w-8 rounded-full text-gray-400 hover:text-gray-600", triggerClassName)}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56 rounded-xl border-gray-100 shadow-xl p-1">
        {visibleActions.map((action, idx) => (
          <div key={`${action.label}-${idx}`}>
            <DropdownMenuItem
              onClick={(e) => {
                 e.stopPropagation();
                 action.onClick();
              }}
              disabled={action.disabled}
              className={cn(
                "flex items-center gap-2 p-2.5 rounded-lg cursor-pointer font-medium",
                action.isDestructive || action.variant === "destructive" ? "text-red-600 focus:text-red-600" : "text-gray-700",
                action.className // Custom classes (e.g. text-blue-600)
              )}
              title={action.title}
            >
              {action.icon && (
                <span className={cn("h-4 w-4", 
                   (action.isDestructive || action.variant === 'destructive') ? "text-red-600" : "text-current"
                )}>
                   {action.icon}
                </span>
              )}
              {action.label}
            </DropdownMenuItem>
            {action.hasSeparatorAfter && (
                <DropdownMenuSeparator className="bg-gray-50 my-1" />
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
