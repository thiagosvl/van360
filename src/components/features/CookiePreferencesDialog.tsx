import { useEffect, useState } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Switch } from "@/components/ui/switch";
import { Settings2 } from "lucide-react";
import { CookiePreferences } from "@/hooks/business/useCookieConsent";

interface CookiePreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (prefs: CookiePreferences) => void;
  currentPreferences: CookiePreferences;
}

export function CookiePreferencesDialog({
  open,
  onOpenChange,
  onSave,
  currentPreferences,
}: CookiePreferencesDialogProps) {
  const [prefs, setPrefs] = useState<CookiePreferences>(currentPreferences);

  useEffect(() => {
    if (open) setPrefs(currentPreferences);
  }, [open]);

  const handleSave = (overridePrefs?: CookiePreferences) => {
    onSave(overridePrefs ?? prefs);
    onOpenChange(false);
  };

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Header
        title="Preferências de Cookies"
        subtitle="Escolha o que deseja permitir"
        icon={<Settings2 className="w-5 h-5" />}
        onClose={() => onOpenChange(false)}
      />
      <BaseDialog.Body>
        <div className="flex items-start justify-between gap-4 py-4 border-b border-slate-100">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1a3a5c]">Necessários</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Essenciais para o funcionamento do site. Não podem ser desativados.
            </p>
          </div>
          <Switch checked disabled className="shrink-0 mt-0.5" />
        </div>

        <div className="flex items-start justify-between gap-4 py-4 border-b border-slate-100">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1a3a5c]">Análise de Uso</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Coleta dados de navegação de forma agregada para entendermos como a plataforma é usada e melhorá-la continuamente.
            </p>
          </div>
          <Switch
            checked={prefs.gtm}
            onCheckedChange={(v) => setPrefs((p) => ({ ...p, gtm: v }))}
            className="shrink-0 mt-0.5"
          />
        </div>

        <div className="flex items-start justify-between gap-4 py-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1a3a5c]">Gravação de Sessão</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Registra sessões de navegação (heatmaps e cliques) para identificar pontos de melhoria na experiência do usuário.
            </p>
          </div>
          <Switch
            checked={prefs.clarity}
            onCheckedChange={(v) => setPrefs((p) => ({ ...p, clarity: v }))}
            className="shrink-0 mt-0.5"
          />
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Salvar"
          variant="primary"
          onClick={() => handleSave()}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
