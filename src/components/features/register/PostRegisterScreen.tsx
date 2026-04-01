import { PostRegisterData } from "@/hooks/register/useRegisterController";
import {
  detectPlatform,
  PLAY_STORE_URL,
  QR_CODE_PLACEHOLDER,
} from "@/utils/detectPlatform";
import { CheckCircle2, Globe, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="min-h-screen bg-slate-50 py-8 px-4 flex flex-col justify-center items-center pt-[var(--safe-area-top)] pb-[var(--safe-area-bottom)]">
      <div className="max-w-[400px] w-full animate-in zoom-in-95 duration-500">
        <Card className="shadow-xl border-slate-200 rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a3a5c] mb-2">
              Cadastro concluído!
            </h1>

            <p className="text-slate-500 text-sm mb-6">
              Sua conta foi criada com sucesso.
            </p>

            {/* Android no browser */}
            {platform === "android-web" && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-600 mb-2">
                  Para uma melhor experiência, use o app:
                </p>
                <div className="space-y-3">
                  <Button
                    asChild
                    className="w-full h-12 bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white rounded-xl font-bold gap-2 shadow-md transition-all"
                  >
                    <a
                      href={PLAY_STORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Smartphone className="w-5 h-5" />
                      Baixar App (Recomendado)
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onContinueInBrowser}
                    className="w-full h-12 text-slate-600 hover:text-[#1a3a5c] hover:bg-slate-50 rounded-xl font-semibold gap-2 border border-slate-100"
                  >
                    <Globe className="w-5 h-5" />
                    Continuar pelo navegador
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                  Após instalar o app, use a opção <span className="font-semibold">"Já tenho conta"</span>.
                </p>
              </div>
            )}

            {/* Desktop */}
            {platform === "desktop" && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <Button
                    onClick={onContinueInBrowser}
                    className="w-full h-12 bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white rounded-xl font-bold gap-2 shadow-md transition-all"
                  >
                    <Globe className="w-5 h-5" />
                    Acessar pela Web
                  </Button>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-wider">
                    Ou use no seu Android:
                  </p>
                  <div className="bg-white p-2 rounded-xl border border-slate-100 inline-block shadow-sm mb-3">
                    <img
                      src={QR_CODE_PLACEHOLDER}
                      alt="QR Code Play Store"
                      className="w-[140px] h-[140px]"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Escaneie para baixar na Play Store.<br />
                    Disponível para Android. App iOS em breve.
                  </p>
                </div>
              </div>
            )}

            {/* iOS no browser */}
            {platform === "ios-web" && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Button
                    onClick={onContinueInBrowser}
                    className="w-full h-12 bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white rounded-xl font-bold gap-2 shadow-md transition-all"
                  >
                    <Globe className="w-5 h-5" />
                    Continuar pelo navegador
                  </Button>
                </div>

                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 text-left">
                  <p className="text-[13px] text-[#1a3a5c] font-bold mb-1">
                    App iOS em desenvolvimento
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    A versão web funciona perfeitamente no iPhone. Quando o app nativo estiver pronto, você será avisado por WhatsApp!
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-8 font-medium">
          © {new Date().getFullYear()} Van360. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
