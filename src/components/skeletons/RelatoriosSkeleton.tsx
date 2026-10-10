import { Skeleton } from "@/components/ui/skeleton";
import { RelatorioTab } from "@/types/enums";

interface RelatoriosSkeletonProps {
  activeTab?: string;
}

function DateNavigationSkeleton() {
  return (
    <div className="w-full flex items-center gap-2 max-w-full overflow-hidden py-1">
      <Skeleton className="h-8 w-20 rounded-full shrink-0 bg-[#e5e5e5]" />
      <div className="flex gap-2 overflow-hidden w-full">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full shrink-0 bg-[#e5e5e5]" />
        ))}
      </div>
    </div>
  );
}

function TabsBarSkeleton({ activeTab }: { activeTab?: string }) {
  const tabs = [
    { value: RelatorioTab.VISAO_GERAL, label: "Visão Geral" },
    { value: RelatorioTab.ENTRADAS, label: "Entradas" },
    { value: RelatorioTab.SAIDAS, label: "Saídas" },
    { value: RelatorioTab.OPERACIONAL, label: "Operacional" },
  ];

  return (
    <div className="bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5]">
      <div className="flex w-full min-h-[38px] sm:min-h-[42px] gap-1">
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab;
          return (
            <div
              key={tab.value}
              className={`flex-1 rounded-[18px] flex items-center justify-center ${
                isActive ? "bg-white shadow-xs" : ""
              }`}
            >
              <Skeleton
                className={`h-3 w-16 rounded-[6px] ${
                  isActive ? "bg-[#e5e5e5]" : "bg-[#e5e5e5]/50"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KPIPairSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="h-[96px] sm:h-[104px] rounded-[24px] bg-white border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] p-4 sm:p-5 flex flex-col justify-between animate-pulse">
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <Skeleton className="h-3 w-20 rounded-[6px] bg-[#f5f5f5]" />
          <Skeleton className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5]" />
        </div>
        <Skeleton className="h-6 w-24 rounded-[8px] bg-[#f5f5f5]" />
      </div>
      <div className="h-[96px] sm:h-[104px] rounded-[24px] bg-white border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] p-4 sm:p-5 flex flex-col justify-between animate-pulse">
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <Skeleton className="h-3 w-20 rounded-[6px] bg-[#f5f5f5]" />
          <Skeleton className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5]" />
        </div>
        <Skeleton className="h-6 w-24 rounded-[8px] bg-[#f5f5f5]" />
      </div>
    </div>
  );
}

function CardHeaderSkeleton() {
  return (
    <div className="p-4 sm:p-5 pb-0 flex items-center gap-3">
      <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5] shrink-0" />
      <Skeleton className="h-4 w-36 rounded-[6px] bg-[#f5f5f5]" />
    </div>
  );
}

function ProgressRowSkeleton({ labelWidths = ["w-20", "w-24"] }: { labelWidths?: string[] }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <Skeleton className={`h-3 ${labelWidths[0]} rounded-[6px] bg-[#f5f5f5]`} />
        <Skeleton className={`h-4 ${labelWidths[1]} rounded-[6px] bg-[#f5f5f5]`} />
      </div>
      <Skeleton className="h-2 w-full rounded-full bg-[#f5f5f5]" />
    </div>
  );
}

export function VisaoGeralSkeleton() {
  return (
    <div className="space-y-4 px-1">
      <KPIPairSkeleton />
      <KPIPairSkeleton />

      <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
        <CardHeaderSkeleton />
        <div className="p-4 sm:p-5 pt-4 sm:pt-4 space-y-5 sm:space-y-6">
          <ProgressRowSkeleton labelWidths={["w-14", "w-28"]} />
          <ProgressRowSkeleton labelWidths={["w-12", "w-24"]} />
          <ProgressRowSkeleton labelWidths={["w-24", "w-28"]} />
        </div>
      </div>
    </div>
  );
}

export function EntradasSkeleton() {
  return (
    <div className="space-y-4 px-1">
      <KPIPairSkeleton />

      <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
        <CardHeaderSkeleton />
        <div className="p-4 sm:p-5 pt-4 sm:pt-4 space-y-4">
          <ProgressRowSkeleton labelWidths={["w-16", "w-24"]} />
          <ProgressRowSkeleton labelWidths={["w-20", "w-20"]} />
          <ProgressRowSkeleton labelWidths={["w-14", "w-16"]} />
        </div>
      </div>
    </div>
  );
}

export function SaidasSkeleton() {
  return (
    <div className="space-y-4 px-1">
      <KPIPairSkeleton />

      <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
        <CardHeaderSkeleton />
        <div className="p-4 sm:p-5 pt-4 sm:pt-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] p-3.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-[#f5f5f5] shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20 rounded-[6px] bg-[#f5f5f5]" />
                  <Skeleton className="h-4 w-24 rounded-[6px] bg-[#f5f5f5]" />
                </div>
              </div>
              <Skeleton className="w-4 h-4 rounded-[4px] bg-[#f5f5f5]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OperacionalCardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
      <div className="p-4 sm:p-5 pb-0 flex items-center gap-3">
        <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-[#f5f5f5] shrink-0" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24 rounded-[6px] bg-[#f5f5f5]" />
          <Skeleton className="h-2.5 w-16 rounded-[6px] bg-[#f5f5f5]" />
        </div>
      </div>
      <div className="p-4 sm:p-5 pt-4 sm:pt-4 space-y-4 sm:space-y-5">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-end">
              <Skeleton className={`h-3 ${i % 2 === 0 ? "w-24" : "w-16"} rounded-[6px] bg-[#f5f5f5]`} />
              <Skeleton className="h-4 w-16 rounded-[6px] bg-[#f5f5f5]" />
            </div>
            <Skeleton className="h-2 w-full rounded-full bg-[#f5f5f5]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OperacionalSkeleton() {
  return (
    <div className="space-y-4 px-1">
      <KPIPairSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        <OperacionalCardSkeleton rows={3} />
        <OperacionalCardSkeleton rows={2} />
        <OperacionalCardSkeleton rows={2} />
      </div>
    </div>
  );
}

const TAB_SKELETON_MAP: Record<string, React.ReactNode> = {
  [RelatorioTab.VISAO_GERAL]: <VisaoGeralSkeleton />,
  [RelatorioTab.ENTRADAS]: <EntradasSkeleton />,
  [RelatorioTab.SAIDAS]: <SaidasSkeleton />,
  [RelatorioTab.OPERACIONAL]: <OperacionalSkeleton />,
};

export function RelatoriosSkeleton({ activeTab = RelatorioTab.VISAO_GERAL }: RelatoriosSkeletonProps) {
  const tabContent = TAB_SKELETON_MAP[activeTab] ?? TAB_SKELETON_MAP[RelatorioTab.VISAO_GERAL];

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      <DateNavigationSkeleton />

      <div className="space-y-4 sm:space-y-6">
        <TabsBarSkeleton activeTab={activeTab} />
        {tabContent}
      </div>
    </div>
  );
}
