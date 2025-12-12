
import { useLayout } from "@/contexts/LayoutContext";
import { Bot, ChevronRight, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface AutomaticChargesPromptProps {
  variant?: "full" | "slim-desktop" | "inline-mobile";
  onUpgrade?: () => void;
}

export function AutomaticChargesPrompt({
  variant = "full",
  onUpgrade,
}: AutomaticChargesPromptProps) {
  const [dismissed, setDismissed] = useState(false);
  const { openLimiteFranquiaDialog, openPlanosDialog } = useLayout();
  const storageKey = "automaticChargesPromptDismissed:cobrancas";

  useEffect(() => {
    try {
      const v = sessionStorage.getItem(storageKey);
      setDismissed(v === "1");
    } catch (e) {
      setDismissed(false);
    }
  }, []);

  const handleClick = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      openLimiteFranquiaDialog({
        title: "Cobrança Automática",
        description:
          "Automatize o envio de cobranças e reduza a inadimplência com o Plano Completo.",
        hideLimitInfo: true,
      });
    }
  };

  if (dismissed) return null;

  if (variant === "slim-desktop") {
    return (
      <div className="hidden md:flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-3 px-4 shadow-sm mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <Bot className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-sm font-medium text-indigo-900">
            Cansado de cobrar um por um?{" "}
            <span className="font-normal text-indigo-700">
              Automatize o envio de cobranças e reduza a inadimplência.
            </span>
          </p>
        </div>
        <Button
          size="sm"
          onClick={() =>
            openLimiteFranquiaDialog({
              title: "Cobrança Automática",
              description:
                "Automatize o envio de cobranças e reduza a inadimplência com o Plano Completo.",
              hideLimitInfo: true,
            })
          }
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-indigo-200/50 h-8 text-xs px-4"
        >
          Quero Cobranças Automáticas
        </Button>
      </div>
    );
  }

  if (variant === "inline-mobile") {
    return (
      <div
        onClick={handleClick}
        className="md:hidden bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-100 rounded-xl p-4 shadow-sm mb-3 flex items-center justify-between active:scale-[0.99] transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <Bot className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-900 leading-tight">
              Automatize essas cobranças
            </p>
            <p className="text-[10px] text-indigo-600 mt-0.5">
              Pare de cobrar manualmente
            </p>
          </div>
        </div>
        <div className="h-8 w-8 rounded-full bg-white border border-indigo-100 flex items-center justify-center shadow-sm">
          <ChevronRight className="h-4 w-4 text-indigo-400" />
        </div>
      </div>
    );
  }

  if (variant === "full") {
    // Inlined content from PremiumBanner (Indigo variant)
    return (
      <div
        className="border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100 mb-6"
      >
        <div className="flex items-center gap-5">
          <div className="h-12 w-12 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-indigo-100">
            <Zap className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Cansado de cobrar um por um?</h3>
            <p className="text-sm text-gray-600 mt-1">Acabe com a inadimplência e o trabalho manual. Deixe que o sistema envie as cobranças automaticamente para você.</p>
          </div>
        </div>
        <Button
          onClick={handleClick}
          className="w-full md:w-auto text-white font-bold h-11 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200/50"
        >
          Quero Cobranças Automáticas
        </Button>
      </div>
    );
  }

  // Fallback (should not be reached if typed correctly but for safety)
  return null;
}
