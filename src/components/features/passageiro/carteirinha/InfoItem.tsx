import React from "react";

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}

export const InfoItem = ({ icon: Icon, label, children }: InfoItemProps) => (
  <div>
    <div className="text-sm text-muted-foreground flex items-center gap-2">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <div className="font-semibold text-foreground mt-1">{children || "-"}</div>
  </div>
);

