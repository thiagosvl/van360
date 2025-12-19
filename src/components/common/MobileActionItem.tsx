import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
import { SwipeableItem } from "./SwipeableItem";

export interface MobileAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  /** Background color for Swipe action (e.g., 'bg-red-500') */
  swipeColor?: string;
  /** Text color/Class for Drawer item (e.g., 'text-red-600') */
  drawerClass?: string;
  /** Variant for the Drawer button */
  variant?: "default" | "destructive" | "outline" | "ghost" | "secondary";
  /** If true, action is disabled */
  disabled?: boolean;
  /** If true, action is destructive (Delete, etc) - useful for Drawer styling */
  isDestructive?: boolean;
}

interface MobileActionItemProps {
  children: ReactNode;
  /** List of actions in priority order */
  actions: MobileAction[];
  /** Optional visual hint on mount */
  showHint?: boolean;
}

export function MobileActionItem({
  children,
  actions,
  showHint = false,
}: MobileActionItemProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Filter actions that should be visible? Or keep all?
  // We keep disabled actions visible but non-interactive
  const { swipeActions, drawerActions } = useMemo(() => {
    // Logic: Rule of 3
    // If <= 3 actions, show all in swipe.
    // If > 3 actions, show 2 in swipe + "More" (which opens drawer with the rest).
    
    // Note: If an action is disabled, we might want to visually indicate it in Swipe too.
    const transformSwipeAction = (a: MobileAction) => ({
      ...a,
      color: a.disabled 
        ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
        : cn("text-white", a.swipeColor || "bg-gray-400"),
      onClick: () => {
         if (!a.disabled) a.onClick();
      },
      // We can pass opacity or specific classes if SwipeableItem supports it
    });

    if (actions.length <= 3) {
      return {
        swipeActions: actions.map(transformSwipeAction),
        drawerActions: [],
      };
    }

    const primary = actions.slice(0, 2);
    const secondary = actions.slice(2);

    const moreAction = {
      label: "Mais...",
      icon: <MoreVertical className="h-5 w-5" />,
      color: "bg-gray-100 !text-gray-600",
      onClick: () => setIsSheetOpen(true),
    };

    return {
      swipeActions: [
        ...primary.map(transformSwipeAction),
        moreAction,
      ],
      drawerActions: secondary,
    };
  }, [actions]);

  return (
    <>
      <SwipeableItem
        showHint={showHint}
        rightActions={swipeActions}
        className="touch-manipulation"
      >
        {children}
      </SwipeableItem>

      {/* Sheet for Secondary Actions */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="bottom"
          className="h-auto max-h-[90vh] rounded-t-[20px] flex flex-col px-0 bg-gray-50 outline-none"
        >
          <SheetHeader className="text-left px-6">
            <SheetTitle className="text-xl font-bold text-gray-900">
              Opções
            </SheetTitle>
            <SheetDescription>Selecione uma ação</SheetDescription>
          </SheetHeader>

          <div className="px-6 pt-4 pb-8 flex flex-col gap-3 overflow-y-auto">
            {drawerActions.map((action, idx) => (
              <Button
                key={idx}
                variant={action.isDestructive ? 'ghost' : 'ghost'} // Usamos ghost para aplicar estilos customizados de "card"
                disabled={action.disabled}
                className={cn(
                    "w-full justify-start h-14 text-base font-medium transition-all active:scale-[0.98] rounded-xl shadow-sm border",
                    // Estilo Base (Card Branco)
                    "bg-white border-gray-200 hover:bg-gray-50",
                    // Estilo Destrutivo override
                    action.isDestructive && "border-red-100 bg-red-50/50 text-red-600 hover:bg-red-100/50 hover:border-red-200",
                    // Disabled style (Enhanced for visibility)
                    action.disabled && "text-gray-400 cursor-not-allowed hover:bg-gray-50 disabled:bg-gray-50 disabled:opacity-60 disabled:grayscale border-gray-100",
                    // Estilo Customizado
                    action.drawerClass,
                    // Cor padrão se não for destrutivo/disabled
                    !action.isDestructive && !action.disabled && "text-gray-700"
                )}
                onClick={() => {
                  setIsSheetOpen(false);
                  action.onClick();
                }}
              >
                 <span className={cn("mr-3", action.isDestructive ? "text-red-600" : (action.disabled ? "text-gray-300" : "text-gray-500"))}>
                    {action.icon}
                 </span>
                {action.label}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
