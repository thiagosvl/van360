import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Usuario } from "@/types/usuario";
import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import { Copy, CopyCheck, UserPlus, Users } from "lucide-react";
import { useState } from "react";

interface PassengerOnboardingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManualRegistration: () => void;
  profile?: Usuario | null;
}

export function PassengerOnboardingDrawer({
  open,
  onOpenChange,
  onManualRegistration,
  profile,
}: PassengerOnboardingDrawerProps) {
  const [copied, setCopied] = useState(false);

  const handleShareLink = () => {
    if (!profile?.id) return;

    const link = buildPrepassageiroLink(profile.id);

    // Copia silenciosamente, apenas feedback visual no ícone
    navigator.clipboard.writeText(link).then(() => {
        setCopied(true);
        // Reset visual state after 2s
        setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-auto max-h-[90vh] md:max-w-[70vw] lg:max-w-[50vw] mx-auto rounded-t-[20px] flex flex-col px-0 bg-gray-50 outline-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="text-left px-6 pt-4">
          <SheetTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
               <Users className="h-5 w-5 text-blue-600" />
            </div>
            Cadastrar Passageiro
          </SheetTitle>
          <SheetDescription>
            Escolha como você prefere adicionar seu primeiro passageiro.
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-6 space-y-4">
          {/* Opção 1: Link */}
          <Button
            variant="ghost"
            className="w-full h-auto p-4 flex items-center gap-4 rounded-xl border border-gray-200 hover:bg-white bg-white shadow-sm transition-all hover:border-gray-300 justify-start group"
            onClick={handleShareLink}
          >
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform text-blue-600">
              {copied ? (
                  <CopyCheck className="h-5 w-5" />
              ) : (
                  <Copy className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="font-bold text-gray-900 text-base mb-0.5 whitespace-normal break-words leading-tight">
                {copied ? "Link Copiado!" : "Copiar Link de Cadastro"}
              </div>
              <div className="text-xs text-gray-500 leading-relaxed whitespace-normal break-words">
                Copie o link e envie para o responsável preencher.
              </div>
            </div>
          </Button>

          <div className="flex items-center gap-4 py-1">
            <div className="h-[1px] flex-1 bg-gray-200"></div>
            <span className="text-xs text-gray-400 font-medium uppercase">Ou</span>
            <div className="h-[1px] flex-1 bg-gray-200"></div>
          </div>

          {/* Opção 2: Manual */}
          <Button
            variant="ghost" 
            className="w-full h-auto p-4 flex items-center gap-4 rounded-xl border border-gray-200 hover:bg-white bg-white shadow-sm transition-all hover:border-gray-300 justify-start group"
            onClick={() => {
              onOpenChange(false);
              setTimeout(onManualRegistration, 150);
            }}
          >
            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:scale-105 transition-transform text-gray-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="font-bold text-gray-900 text-base whitespace-normal break-words leading-tight">
                Cadastrar Manualmente
              </div>
              <div className="text-xs text-gray-500 whitespace-normal break-words">
                Preencha você mesmo os dados do passageiro e do responsável.
              </div>
            </div>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
