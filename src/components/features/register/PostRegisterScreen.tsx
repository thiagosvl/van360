import { PostRegisterData } from "@/hooks/register/useRegisterController";
import {
  detectPlatform,
  PLAY_STORE_URL,
  QR_CODE_PLACEHOLDER,
} from "@/utils/detectPlatform";
import { CheckCircle2, Globe, Smartphone } from "lucide-react";

interface PostRegisterScreenProps {
  data: PostRegisterData;
  onContinueInBrowser: () => void;
}

function maskCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

export function PostRegisterScreen({
  data,
  onContinueInBrowser,
}: PostRegisterScreenProps) {
  const platform = detectPlatform();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#60a5fa] to-[#dbeafe] py-8 px-4 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />

          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            Cadastro concluído!
          </h1>

          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-500 mb-1">Seu login é:</p>
            <p className="text-lg font-bold text-[#1a3a5c]">{maskCpf(data.cpf)}</p>
            <p className="text-sm text-slate-400">+ sua senha</p>
          </div>

          {/* Android no browser */}
          {platform === "android-web" && (
            <>
              <p className="text-sm text-slate-500 mb-4">
                Para a melhor experiência, use o app:
              </p>
              <div className="space-y-3">
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold py-3.5 rounded-xl transition-colors"
                >
                  <Smartphone className="w-5 h-5" />
                  Baixar o App (recomendado)
                </a>
                <button
                  onClick={onContinueInBrowser}
                  className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  Continuar pelo navegador
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Após instalar o app, use "Já tenho conta" com seu CPF.
              </p>
            </>
          )}

          {/* Desktop */}
          {platform === "desktop" && (
            <>
              <div className="space-y-3 mb-6">
                <button
                  onClick={onContinueInBrowser}
                  className="flex items-center justify-center gap-2 w-full bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold py-3.5 rounded-xl transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  Continuar pelo navegador
                </button>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <p className="text-sm text-slate-500 mb-3">
                  Baixe o app no seu celular Android:
                </p>
                <img
                  src={QR_CODE_PLACEHOLDER}
                  alt="QR Code para baixar Van360 na Play Store"
                  className="w-[160px] h-[160px] mx-auto rounded-lg shadow-md mb-3"
                  loading="lazy"
                />
                <p className="text-xs text-slate-400">
                  Disponível para Android. App iOS em breve.
                </p>
              </div>
            </>
          )}

          {/* iOS no browser */}
          {platform === "ios-web" && (
            <>
              <div className="space-y-3 mb-6">
                <button
                  onClick={onContinueInBrowser}
                  className="flex items-center justify-center gap-2 w-full bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold py-3.5 rounded-xl transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  Continuar pelo navegador
                </button>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-700 font-medium">
                  App iOS em desenvolvimento.
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  Acesse pelo navegador do celular ou computador. Quando o app
                  estiver disponível, avisaremos pelo seu WhatsApp!
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
