import { WhatsAppSupportButton } from "@/components/ui/WhatsAppSupportButton";
import { ShieldCheck, ShieldAlert } from "lucide-react";

interface IOSSubscriptionViewProps {
  isSalesMode: boolean;
}

export function IOSSubscriptionView({ isSalesMode }: IOSSubscriptionViewProps) {
  if (isSalesMode) {
    return (
      <div className="max-w-lg mx-auto w-full px-4 pt-12 pb-16 flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold font-headline text-slate-800">
            Acesso Expirado
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            Seu período de acesso terminou. Fale com nosso suporte para reativar o aplicativo e continuar sua operação.
          </p>
        </div>

        <div className="w-full pt-2">
          <WhatsAppSupportButton
            size="lg"
            title="Falar com o Suporte"
            subtitle="Toque para reativar seu acesso"
            message="Olá! Meu acesso ao Van360 expirou e gostaria de reativar."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto w-full px-4 pt-12 pb-16 flex flex-col items-center text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-xs">
        <ShieldCheck className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-1">
          Assinatura Ativa
        </span>
        <h1 className="text-xl sm:text-2xl font-bold font-headline text-slate-800">
          Sua Assinatura
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
          Sua conta do Van360 está ativa. O gerenciamento de planos, faturas e dados de faturamento da sua frota é realizado através do painel web pelo computador.
        </p>
      </div>

      <div className="w-full pt-2">
        <WhatsAppSupportButton
          size="lg"
          title="Falar com o Suporte"
          subtitle="Tire suas dúvidas com nossa equipe"
          message="Olá! Sou assinante do Van360 e gostaria de falar com o suporte."
        />
      </div>
    </div>
  );
}
