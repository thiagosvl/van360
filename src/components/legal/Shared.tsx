import { Check } from "lucide-react";
import React from "react";

interface SectionTitleProps {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  colorClass?: string;
}

export const SectionTitle = ({ icon: Icon, children }: SectionTitleProps) => (
  <div className="flex items-center gap-2.5 mt-6 mb-3">
    <div className="h-8 w-8 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-[#0a0a0a]" />
    </div>
    <h3 className="font-semibold text-base sm:text-lg text-[#0a0a0a] tracking-tight">{children}</h3>
  </div>
);

export const ListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2.5 text-xs sm:text-sm text-[#737373] leading-relaxed">
    <Check className="h-3.5 w-3.5 text-[#0a0a0a] mt-1 shrink-0" />
    <span>{children}</span>
  </li>
);
