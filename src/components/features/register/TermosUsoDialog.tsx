import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export function TermosUsoDialog() {
  const [openTermos, setOpenTermos] = useState(false);
  const [openPolitica, setOpenPolitica] = useState(false);

  return (
    <div className="px-3 pt-2 pb-0">
      <p className="text-xs sm:text-sm text-gray-700 text-center">
        Ao avançar, você concorda com nossos{" "}
        <Dialog open={openTermos} onOpenChange={setOpenTermos}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="font-semibold text-gray-900 underline hover:text-blue-600 transition-colors"
            >
              Termos de Uso
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Termos de Uso</DialogTitle>
              <DialogDescription>
                Última atualização: {new Date().toLocaleDateString("pt-BR")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm text-gray-700">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
              </p>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae vitae
                dicta sunt explicabo.
              </p>
            </div>
          </DialogContent>
        </Dialog>{" "}
        e{" "}
        <Dialog open={openPolitica} onOpenChange={setOpenPolitica}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="font-semibold text-gray-900 underline hover:text-blue-600 transition-colors"
            >
              Política de Privacidade
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Política de Privacidade</DialogTitle>
              <DialogDescription>
                Última atualização: {new Date().toLocaleDateString("pt-BR")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm text-gray-700">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
              </p>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae vitae
                dicta sunt explicabo.
              </p>
            </div>
          </DialogContent>
        </Dialog>
        .
      </p>
    </div>
  );
}

