import * as LucideIcons from "lucide-react";
import { GastoCategoriaResponse } from "@/services/api/gasto-categoria.api";
import { GASTO_CATEGORIA_LABELS } from "@/types/gasto";
import { GastoCategoria } from "@/types/enums";

export const CATEGORIA_COLOR_PALETTE: Record<string, { color: string; bg: string; border: string }> = {
  orange: { color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200" },
  blue: { color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" },
  red: { color: "text-red-600", bg: "bg-red-100", border: "border-red-200" },
  cyan: { color: "text-cyan-600", bg: "bg-cyan-100", border: "border-cyan-200" },
  green: { color: "text-green-600", bg: "bg-green-100", border: "border-green-200" },
  indigo: { color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-200" },
  gray: { color: "text-[#737373]", bg: "bg-[#f5f5f5]", border: "border-[#e5e5e5]" },
  purple: { color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200" },
  pink: { color: "text-pink-600", bg: "bg-pink-100", border: "border-pink-200" },
  slate: { color: "text-[#737373]", bg: "bg-[#f5f5f5]", border: "border-[#e5e5e5]" }
};

const SYSTEM_ICONS: Record<string, LucideIcons.LucideIcon> = {
  combustivel: LucideIcons.Fuel,
  manutencao: LucideIcons.Wrench,
  impostos: LucideIcons.FileText,
  multas: LucideIcons.ClipboardCheck,
  lavagem: LucideIcons.Cog,
  alimentacao: LucideIcons.Wallet,
  seguro: LucideIcons.ClipboardCheck,
  outros: LucideIcons.HelpCircle
};

export function getCategoriaIcon(iconName: string) {
  if (!iconName) return LucideIcons.Tag;
  
  const systemIcon = SYSTEM_ICONS[iconName.toLowerCase()];
  if (systemIcon) return systemIcon;
  
  const IconComponent = (LucideIcons as any)[iconName];
  if (IconComponent) return IconComponent;

  return LucideIcons.Tag;
}

export function getCategoriaMetadata(slug: string, categoriasDaApi?: GastoCategoriaResponse[]) {
  const apiCat = categoriasDaApi?.find(c => c.slug === slug);
  if (apiCat) {
    const palette = CATEGORIA_COLOR_PALETTE[apiCat.cor] || CATEGORIA_COLOR_PALETTE.slate;
    return {
      label: apiCat.nome,
      icon: getCategoriaIcon(apiCat.icone),
      color: palette.color,
      bg: palette.bg,
      border: palette.border
    };
  }

  const systemDefaults: Record<string, { icon: LucideIcons.LucideIcon; color: string; bg: string; label: string }> = {
    [GastoCategoria.COMBUSTIVEL]: { icon: LucideIcons.Fuel, color: "text-orange-600", bg: "bg-orange-100", label: "Combustível" },
    [GastoCategoria.MANUTENCAO]: { icon: LucideIcons.Wrench, color: "text-blue-600", bg: "bg-blue-100", label: "Manutenção" },
    [GastoCategoria.IMPOSTOS]: { icon: LucideIcons.FileText, color: "text-red-600", bg: "bg-red-100", label: "Impostos" },
    [GastoCategoria.MULTAS]: { icon: LucideIcons.ClipboardCheck, color: "text-red-800", bg: "bg-red-200", label: "Multas" },
    [GastoCategoria.LAVAGEM]: { icon: LucideIcons.Cog, color: "text-cyan-600", bg: "bg-cyan-100", label: "Lavagem" },
    [GastoCategoria.ALIMENTACAO]: { icon: LucideIcons.Wallet, color: "text-green-600", bg: "bg-green-100", label: "Alimentação" },
    [GastoCategoria.SEGURO]: { icon: LucideIcons.ClipboardCheck, color: "text-indigo-600", bg: "bg-indigo-100", label: "Seguro" },
    [GastoCategoria.OUTROS]: { icon: LucideIcons.HelpCircle, color: "text-[#737373]", bg: "bg-[#f5f5f5]", label: "Outros" },
  };

  const sysMeta = systemDefaults[slug];
  if (sysMeta) {
    return {
      label: sysMeta.label,
      icon: sysMeta.icon,
      color: sysMeta.color,
      bg: sysMeta.bg,
      border: "border-[#e5e5e5]"
    };
  }

  const labelFallback = GASTO_CATEGORIA_LABELS[slug as GastoCategoria] || slug;
  return {
    label: labelFallback,
    icon: LucideIcons.Tag,
    color: "text-[#737373]",
    bg: "bg-[#f5f5f5]",
    border: "border-[#e5e5e5]"
  };
}
