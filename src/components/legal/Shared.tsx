import { Check } from "lucide-react";
import React from "react";

export const SectionTitle = ({ icon: Icon, children, colorClass = "bg-emerald-50 text-emerald-600" }: { icon: any, children: React.ReactNode, colorClass?: string }) => (
  <div className="flex items-center gap-2 mt-6 mb-3">
    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${colorClass.split(' ')[0]}`}>
      <Icon className={`h-4 w-4 ${colorClass.split(' ')[1]}`} />
    </div>
    <h3 className="font-bold text-[#1a3a5c] text-lg">{children}</h3>
  </div>
);

export const ListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2 text-slate-500 leading-relaxed">
    <Check className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
    <span>{children}</span>
  </li>
);
