import { DispositivoCadastro } from "@/types/enums";

export interface DispositivoCadastroItemConfig {
  label: string;
  color: string;
}

export const DISPOSITIVO_CADASTRO_CONFIG: Record<DispositivoCadastro | "NAO_INFORMADO", DispositivoCadastroItemConfig> = {
  [DispositivoCadastro.APP_ANDROID]: { label: "App Nativo (Android)", color: "#34A853" },
  [DispositivoCadastro.APP_IOS]: { label: "App Nativo (iOS)", color: "#007AFF" },
  [DispositivoCadastro.WEB_MOBILE_ANDROID]: { label: "Web Mobile (Android)", color: "#FBBC04" },
  [DispositivoCadastro.WEB_MOBILE_IOS]: { label: "Web Mobile (iOS)", color: "#A259FF" },
  [DispositivoCadastro.WEB_DESKTOP]: { label: "Web Desktop", color: "#4285F4" },
  NAO_INFORMADO: { label: "Não Informado", color: "#64748B" },
};

export const DispositivoCadastroLabels: Record<DispositivoCadastro, string> = {
  [DispositivoCadastro.APP_ANDROID]: DISPOSITIVO_CADASTRO_CONFIG[DispositivoCadastro.APP_ANDROID].label,
  [DispositivoCadastro.APP_IOS]: DISPOSITIVO_CADASTRO_CONFIG[DispositivoCadastro.APP_IOS].label,
  [DispositivoCadastro.WEB_MOBILE_ANDROID]: DISPOSITIVO_CADASTRO_CONFIG[DispositivoCadastro.WEB_MOBILE_ANDROID].label,
  [DispositivoCadastro.WEB_MOBILE_IOS]: DISPOSITIVO_CADASTRO_CONFIG[DispositivoCadastro.WEB_MOBILE_IOS].label,
  [DispositivoCadastro.WEB_DESKTOP]: DISPOSITIVO_CADASTRO_CONFIG[DispositivoCadastro.WEB_DESKTOP].label,
};
