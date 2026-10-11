import React, { useEffect, useRef } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface AppTabItem<T extends string = string> {
  value: T;
  label: React.ReactNode;
  badge?: number | string | null;
  badgeLoading?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  title?: string;
  onClick?: () => void;
}

export interface AppTabNavProps<T extends string = string> {
  items: AppTabItem<T>[];
  activeTab?: T;
  layout?: "auto" | "fill" | "scroll";
  className?: string;
  listClassName?: string;
  triggerClassName?: string;
  autoScrollToActive?: boolean;
}

export function AppTabNav<T extends string = string>({
  items,
  activeTab,
  layout = "auto",
  className,
  listClassName,
  triggerClassName,
  autoScrollToActive = true,
}: AppTabNavProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabListRef = useRef<HTMLDivElement>(null);

  const isFillMobile =
    layout === "fill" || (layout === "auto" && items.length <= 2);
  const isScrollable = !isFillMobile;

  useEffect(() => {
    if (!autoScrollToActive || !isScrollable) return;

    const timer = setTimeout(() => {
      const container = containerRef.current;
      const activeEl = tabListRef.current?.querySelector(
        '[data-state="active"]'
      ) as HTMLElement | null;

      if (container && activeEl) {
        const left =
          activeEl.offsetLeft - container.clientWidth / 2 + activeEl.clientWidth / 2;
        container.scrollTo({ left, behavior: "smooth" });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [activeTab, isScrollable, autoScrollToActive]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-[#f5f5f5] p-1 rounded-[20px] sm:rounded-[22px] border border-[#e5e5e5] overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x shrink-0 w-full sm:w-fit",
        className
      )}
    >
      <TabsList
        ref={tabListRef}
        className={cn(
          "bg-transparent min-h-[38px] sm:min-h-[42px] p-0 gap-1.5 border-0 justify-start",
          isFillMobile
            ? "w-full grid grid-cols-2 sm:flex sm:w-auto"
            : "w-max min-w-full flex items-center sm:w-auto",
          listClassName
        )}
      >
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            title={item.title}
            onClick={item.onClick}
            className={cn(
              "group flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4 rounded-[16px] sm:rounded-[18px] text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap text-center select-none",
              isFillMobile ? "w-full sm:w-auto" : "shrink-0",
              "data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs data-[state=active]:font-semibold",
              "data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/40",
              "disabled:pointer-events-none disabled:opacity-40",
              triggerClassName
            )}
          >
            {item.icon && (
              <span className="shrink-0 text-inherit flex items-center justify-center -ml-0.5">
                {item.icon}
              </span>
            )}
            <span className="leading-none whitespace-nowrap">{item.label}</span>

            {item.badgeLoading ? (
              <Skeleton className="ml-1.5 w-5 h-4 rounded-full bg-[#e5e5e5] shrink-0" />
            ) : (
              item.badge !== undefined &&
              item.badge !== null && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] sm:text-[11px] font-medium transition-colors shrink-0 ml-1.5 -mr-0.5",
                    activeTab !== undefined
                      ? activeTab === item.value
                        ? "bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] font-semibold"
                        : "bg-transparent text-[#737373] border border-[#e5e5e5]/80"
                      : "group-data-[state=active]:bg-[#f5f5f5] group-data-[state=active]:text-[#0a0a0a] group-data-[state=active]:border group-data-[state=active]:border-[#e5e5e5] group-data-[state=active]:font-semibold group-data-[state=inactive]:bg-transparent group-data-[state=inactive]:text-[#737373] group-data-[state=inactive]:border group-data-[state=inactive]:border-[#e5e5e5]/80 text-[#737373]"
                  )}
                >
                  {item.badge}
                </span>
              )
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
