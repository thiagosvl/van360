import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
      onClick: () => setIsDrawerOpen(true),
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

      {/* Drawer for Secondary Actions */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left pb-0">
            <DrawerTitle className="text-lg font-bold text-gray-900">
              Opções
            </DrawerTitle>
            <DrawerDescription>Selecione uma ação</DrawerDescription>
          </DrawerHeader>

          <div className="p-4 flex flex-col gap-3">
            {drawerActions.map((action, idx) => (
              <Button
                key={idx}
                variant={action.isDestructive ? 'destructive' : 'outline'}
                disabled={action.disabled}
                className={cn(
                    "w-full justify-start h-14 text-base font-medium transition-transform active:scale-[0.98]",
                    action.drawerClass,
                    !action.isDestructive && !action.disabled && "text-gray-700" 
                )}
                onClick={() => {
                  setIsDrawerOpen(false);
                  action.onClick();
                }}
              >
                 <span className="mr-3">{action.icon}</span>
                {action.label}
              </Button>
            ))}
          </div>


          <DrawerFooter className="pt-0">
            <DrawerClose asChild>
              <Button variant="ghost" className="h-12 text-gray-500 font-normal">
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
