import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pagesItems } from "@/utils/domain/pages/pagesUtils";
import { NavLink } from "react-router-dom";

interface AppSidebarProps {
  role: "motorista";
  onLinkClick?: () => void;
  plano?: any;
}

import { useUpsellContent } from "@/hooks/ui/useUpsellContent";

export function AppSidebar({ role, onLinkClick, plano }: AppSidebarProps) {
  const upsellContent = useUpsellContent(plano);

  return (
    <div className="flex h-full flex-col gap-6">
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 md:space-y-1">
        {pagesItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors md:py-2.5",
                isActive
                  ? "bg-blue-600 text-white shadow-[0_12px_35px_-25px_rgba(59,130,246,0.7)]"
                  : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-base",
                    isActive ? "bg-white/20 text-white" : "hover:text-blue-600"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-white" : "text-inherit"
                    )}
                  />
                </span>
                <span>{item.title}</span>

                {/* Badge inside render prop */}
                {/* @ts-ignore */}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(item as any).badge !== undefined &&
                  (item as any).badge > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">
                      {(item as any).badge}
                    </span>
                  )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="hidden sm:block rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-500 p-5 text-white shadow-lg">
        <p className="text-sm font-semibold">{upsellContent.title}</p>
        <p className="text-xs text-white/80">{upsellContent.description}</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            upsellContent.action();
            onLinkClick?.();
          }}
          className="mt-4 w-full rounded-full border-white/30 bg-white/20 text-white hover:bg-white/30 font-semibold"
        >
          {upsellContent.buttonText}
        </Button>
      </div>
    </div>
  );
}
