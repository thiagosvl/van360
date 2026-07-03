import { cn } from "@/lib/utils";

interface SecondaryKPICardProps {
  label: string;
  value: number | string;
  loading?: boolean;
}

export function SecondaryKPICard({ label, value, loading }: SecondaryKPICardProps) {
  if (loading) {
    return <div className="h-[64px] bg-white rounded-[16px] animate-pulse shadow-sm" />;
  }

  return (
    <div className="bg-white rounded-[16px] py-2 px-2 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100/50 flex flex-col items-center justify-center min-h-[64px]">
      <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 text-center leading-[1.1] mb-0.5">{label}</span>
      <span className="text-[18px] sm:text-[20px] font-bold text-slate-800 tracking-tight leading-none">{value}</span>
    </div>
  );
}
