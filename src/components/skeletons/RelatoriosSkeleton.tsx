import { Skeleton } from "@/components/ui/skeleton";
import { RelatorioTab } from "@/types/enums";

interface RelatoriosSkeletonProps {
  activeTab?: string;
}

function DateNavigationSkeleton() {
  return (
    <div className="flex items-center justify-between bg-[#1a3a5c] h-[52px] px-1.5 rounded-[1.25rem] shadow-lg border border-white/5 max-w-md mx-auto w-full md:w-auto">
      <div className="w-10 h-10 flex items-center justify-center">
        <Skeleton className="w-5 h-5 rounded-full bg-white/10" />
      </div>
      <Skeleton className="h-4 w-32 rounded-lg bg-white/10" />
      <div className="w-10 h-10 flex items-center justify-center">
        <Skeleton className="w-5 h-5 rounded-full bg-white/10" />
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
    <div className="bg-slate-200/50 p-1 rounded-[1.25rem]">
      <div className="flex w-full h-[52px] gap-1">
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab;
          return (
            <div
              key={tab.value}
              className={`flex-1 rounded-[1rem] flex items-center justify-center ${
                isActive ? "bg-white shadow-sm" : ""
              }`}
            >
              <Skeleton
                className={`h-3 w-16 rounded-md ${
                  isActive ? "bg-slate-200" : "bg-slate-300/50"
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
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-[100px] rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-100" />
      <Skeleton className="h-[100px] rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-100" />
    </div>
  );
}

function CardHeaderSkeleton() {
  return (
    <div className="pt-6 px-6 flex items-center gap-3">
      <Skeleton className="w-11 h-11 rounded-2xl bg-slate-100 flex-shrink-0" />
      <Skeleton className="h-3 w-36 rounded-md bg-slate-100" />
    </div>
  );
}

function ProgressRowSkeleton({ labelWidths = ["w-20", "w-24"] }: { labelWidths?: string[] }) {
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-end">
        <div className="space-y-1.5">
          <Skeleton className={`h-2.5 ${labelWidths[0]} rounded-md bg-slate-100`} />
          <Skeleton className={`h-4 ${labelWidths[1]} rounded-md bg-slate-100`} />
        </div>
        <Skeleton className="h-2.5 w-8 rounded-md bg-slate-100" />
      </div>
      <Skeleton className="h-2 w-full rounded-full bg-slate-100" />
    </div>
  );
}

export function VisaoGeralSkeleton() {
  return (
    <div className="space-y-4 px-1">
      <KPIPairSkeleton />
      <KPIPairSkeleton />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeaderSkeleton />
        <div className="p-6 pt-6 space-y-6">
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeaderSkeleton />
        <div className="p-6 pt-4 space-y-6">
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <CardHeaderSkeleton />
        <div className="p-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-100/50 bg-slate-50/30 p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-11 h-11 rounded-2xl bg-slate-100 flex-shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-2.5 w-20 rounded-md bg-slate-100" />
                  <Skeleton className="h-4 w-24 rounded-md bg-slate-100" />
                </div>
              </div>
              <Skeleton className="w-4 h-4 rounded-sm bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OperacionalCardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="pt-6 px-6 flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-2xl bg-slate-100 flex-shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-2 w-16 rounded-md bg-slate-100" />
          <Skeleton className="h-3 w-24 rounded-md bg-slate-100" />
        </div>
      </div>
      <div className="p-6 pt-6 space-y-6">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="space-y-2.5">
            <div className="flex justify-between items-end">
              <div className="space-y-1.5">
                <Skeleton className={`h-2.5 ${i % 2 === 0 ? "w-24" : "w-16"} rounded-md bg-slate-100`} />
                <Skeleton className="h-4 w-16 rounded-md bg-slate-100" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full bg-slate-100" />
            </div>
            <Skeleton className="h-2 w-full rounded-full bg-slate-100" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <DateNavigationSkeleton />

      <div className="space-y-6">
        <TabsBarSkeleton activeTab={activeTab} />
        {tabContent}
      </div>
    </div>
  );
}
