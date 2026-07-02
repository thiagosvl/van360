import { PostRegisterData } from "@/hooks/register/useRegisterController";
import {
  detectPlatform,
  PLAY_STORE_URL,
  PLAY_STORE_BADGE_URL,
} from "@/utils/detectPlatform";
import { Check, Globe, Smartphone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getNowBR } from "@/utils/dateUtils";

interface PostRegisterScreenProps {
  data: PostRegisterData;
  onContinueInBrowser: () => void;
}

export function PostRegisterScreen({
  data,
  onContinueInBrowser,
}: PostRegisterScreenProps) {
  const platform = detectPlatform();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3a5c] to-[#0d2238] px-5 flex flex-col justify-center items-center pt-[max(2rem,var(--safe-area-top))] pb-[max(2rem,var(--safe-area-bottom))]">

      <div className="max-w-[420px] w-full animate-in zoom-in-95 duration-500 delay-150 fill-mode-both">
        <Card className="shadow-2xl shadow-black/20 border-0 rounded-[24px] bg-white overflow-hidden relative">

          {/* Decoração superior */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]" />

          <CardContent className="p-8 sm:p-10 text-center">
            <div className="flex justify-center mb-6 relative">
              <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full shadow-lg shadow-green-500/30">
                <Check className="w-10 h-10 text-white stroke-[3]" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a3a5c] mb-2 tracking-tight">
              Tudo pronto!
            </h1>

            <p className="text-slate-500 text-[15px] mb-8 leading-relaxed">
              Sua conta foi criada com sucesso.
            </p>

            {/* Renderização baseada na plataforma */}

            {/* 1. ANDROID */}
            {platform === "android-web" && (
              <div className="space-y-4">

                <div className="flex justify-center w-full">
                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex hover:scale-[1.03] transition-transform"
                  >
                    <img
                      src={PLAY_STORE_BADGE_URL}
                      alt="Disponível no Google Play"
                      className="h-[56px] object-contain drop-shadow-sm"
                    />
                  </a>
                </div>

                <p className="text-[11.5px] text-slate-500 text-center leading-relaxed px-2">
                  O aplicativo é opcional, mas recomendamos para ter uma experiência ainda mais rápida.
                </p>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink-0 mx-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider">ou se preferir</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <Button
                  onClick={onContinueInBrowser}
                  variant="outline"
                  className="w-full h-[52px] bg-white border-2 border-slate-200 hover:border-[#1a3a5c] hover:bg-slate-50 text-[#1a3a5c] rounded-xl font-bold text-[15px] gap-2 shadow-sm transition-all"
                >
                  <Globe className="w-5 h-5 opacity-70" />
                  Seguir pelo navegador
                </Button>

              </div>
            )}

            {/* 2. iOS */}
            {platform === "ios-web" && (
              <div className="space-y-6">
                <Button
                  onClick={onContinueInBrowser}
                  className="w-full h-[52px] bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white rounded-xl font-bold text-[15px] gap-2 shadow-lg shadow-[#1a3a5c]/20 transition-all hover:-translate-y-0.5"
                >
                  Acessar minha conta
                  <ChevronRight className="w-5 h-5" />
                </Button>

                <div className="bg-blue-50/60 border border-blue-100/50 rounded-xl p-4 flex gap-3 text-left items-start">
                  <div className="text-[1.2rem] leading-none mt-0.5">🍎</div>
                  <div>
                    <p className="text-[12px] text-[#1a3a5c] font-bold mb-1">
                      Funciona no seu iPhone
                    </p>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Use pelo navegador normalmente. O app nativo para iOS está em desenvolvimento!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. DESKTOP */}
            {platform === "desktop" && (
              <div className="space-y-8">
                <Button
                  onClick={onContinueInBrowser}
                  className="w-full h-[52px] bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white rounded-xl font-bold text-[15px] gap-2 shadow-lg shadow-[#1a3a5c]/20 transition-all hover:-translate-y-0.5"
                >
                  Acessar minha conta
                  <ChevronRight className="w-5 h-5" />
                </Button>

                <div className="pt-6 border-t border-slate-100 flex flex-col items-center">
                  <p className="text-[12px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
                    Baixe também no celular
                  </p>
                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex hover:scale-[1.02] transition-transform mb-2"
                  >
                    <img
                      src={PLAY_STORE_BADGE_URL}
                      alt="Google Play Badge"
                      className="h-12 object-contain drop-shadow-sm"
                    />
                  </a>
                  <p className="text-[11px] text-slate-400 font-medium">
                    App iOS em breve.
                  </p>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-white/50 mt-8 font-medium">
          © {getNowBR().getFullYear()} Van360. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
