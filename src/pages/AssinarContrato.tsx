import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants/routes";
import {
  useGetPublicContract,
  useSignContract,
} from "@/hooks/api/usePublicContract";
import { ContratoStatus } from "@/types/enums";
import { CheckCircle2, Download, FileSignature, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useNavigate, useParams } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "sonner";

// Configurar worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function AssinarContrato() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [modalAberto, setModalAberto] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);

  const sigCanvas = useRef<SignatureCanvas>(null);

  // Hook for fetching contract
  const {
    data: contrato,
    isLoading,
    isError,
  } = useGetPublicContract(token || "");

  // Hook for signing
  const signMutation = useSignContract();

  const obterIP = async (): Promise<string> => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch {
      return "unknown";
    }
  };

  const handleAssinar = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      toast.error("Por favor, desenhe sua assinatura");
      return;
    }

    if (!token) return;

    try {
      const assinaturaBase64 = sigCanvas.current.toDataURL();
      const ip = await obterIP();

      const metadados = {
        ip,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      await signMutation.mutateAsync({
        token,
        assinatura: assinaturaBase64,
        metadados,
      });

      toast.success(
        "Contrato assinado com sucesso!",
        {
          description: "O documento final foi gerado e enviado para o seu WhatsApp."
        }
      );
      setModalAberto(false);
      // O estado do contrato será atualizado pelo hook useGetPublicContract ou refresh manual
    } catch (error: any) {
      console.error("Erro ao assinar:", error);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !contrato) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Contrato não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              O contrato que você está tentando acessar não existe, foi
              cancelado ou expirou.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (contrato.status === ContratoStatus.ASSINADO) {
    return (
      <div className="min-h-screen bg-neutral-100/50 flex flex-col">
        {/* Dark Header */}
        <header className="bg-[#002554] border-b border-white/10 shadow-lg shrink-0">
          <div className="container mx-auto px-4 h-16 flex items-center justify-center">
            <img 
              src="/assets/logo-van360.png" 
              alt="Van360" 
              className="h-10 w-auto filter brightness-0 invert" 
            />
          </div>
        </header>

        <main className="flex-1 container mx-auto p-4 max-w-4xl flex items-center justify-center pb-24">
          <Card className="w-full max-w-lg border-none shadow-2xl bg-white overflow-hidden">
            <CardHeader className="text-center pb-2 pt-8">
              <div className="mx-auto bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">Contrato Assinado!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-8 p-8 pt-4">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Tudo pronto! O contrato foi assinado digitalmente e o documento final já está disponível para download.
              </p>
              
              <div className="flex flex-col gap-4 pt-4">
                <Button 
                  onClick={() => window.open(contrato.contrato_final_url || contrato.contrato_url, "_blank")}
                  className="bg-[#28a745] hover:bg-[#218838] h-14 rounded-xl font-bold text-lg shadow-lg shadow-green-500/10 transition-all active:scale-95"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Baixar Documento Assinado
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => {
                    if (window.opener) window.close();
                    else navigate(ROUTES.PUBLIC.ROOT);
                  }}
                  className="h-12 rounded-xl text-gray-500 hover:text-gray-900 font-medium"
                >
                  Sair do documento
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/50 flex flex-col">
      {/* Dark Header similar to competitor */}
      <header className="sticky top-0 z-40 bg-[#002554] border-b border-white/10 shadow-lg shrink-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <img 
            src="/assets/logo-van360.png" 
            alt="Van360" 
            className="h-10 w-auto filter brightness-0 invert" 
          />
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 sm:p-8 max-w-4xl flex flex-col items-center">
        <Card className="w-full border-none shadow-2xl bg-white overflow-hidden mb-8">
          <CardContent className="p-0">
          {/* PDF View */}
          <div className="border rounded-lg overflow-hidden mb-32 flex justify-center bg-gray-50 min-h-[60vh]">
            <Document
              file={contrato.minuta_url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              }
              error={
                <div className="p-8 text-center text-red-500">
                  Erro ao carregar PDF.{" "}
                  <button
                    onClick={() => window.open(contrato.minuta_url)}
                    className="underline"
                  >
                    Clique aqui para baixar
                  </button>
                </div>
              }
            >
              {
                // Limit pages rendered for performance if needed, or render all
                Array.from(new Array(numPages), (_, index) => (
                  <div key={`page_${index + 1}`} className="mb-4 shadow-sm">
                    <Page
                      pageNumber={index + 1}
                      width={Math.min(window.innerWidth - 64, 800)}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </div>
                ))
              }
            </Document>
          </div>
        </CardContent>
      </Card>
      </main>

      {/* Fixed Action Buttons - Fixed at bottom corners */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-8 bg-gradient-to-t from-white via-white/90 to-transparent z-50 flex items-center justify-between pointer-events-none">
        <Button
          onClick={() => window.open(contrato.minuta_url, "_blank")}
          className="pointer-events-auto rounded-xl bg-[#28a745] hover:bg-[#218838] text-white font-bold h-12 sm:h-14 px-6 sm:px-10 text-base shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all active:scale-95"
        >
          <Download className="mr-2 h-5 w-5" />
          Baixar <span className="hidden sm:inline">Contrato</span>
        </Button>

        <Button
          onClick={() => setModalAberto(true)}
          disabled={contrato.status !== ContratoStatus.PENDENTE}
          className={`pointer-events-auto rounded-xl font-bold h-12 sm:h-14 px-6 sm:px-10 text-base shadow-lg transition-all active:scale-95 ${
            contrato.status === ContratoStatus.PENDENTE
              ? "bg-[#2b6eff] hover:bg-[#1a56e6] text-white shadow-blue-500/10 hover:shadow-blue-500/30"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {contrato.status === ContratoStatus.PENDENTE ? (
            <>
              <FileSignature className="mr-2 h-5 w-5" />
              Assinar <span className="hidden sm:inline">Documento</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Assinado
            </>
          )}
        </Button>
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assinatura Digital</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Por favor, assine no quadro abaixo usando seu dedo ou mouse.
            </p>
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="rgb(0, 0, 128)"
                minWidth={1}
                maxWidth={2.5}
                canvasProps={{
                  width: 400,
                  height: 200,
                  className: "w-full h-full cursor-crosshair",
                }}
                backgroundColor="white"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => sigCanvas.current?.clear()}
              className="w-full text-muted-foreground hover:text-destructive"
            >
              Limpar assinatura
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalAberto(false)}
              disabled={signMutation.isPending}
            >
              Cancelar
            </Button>

            <Button onClick={handleAssinar} disabled={signMutation.isPending}>
              {signMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assinando...
                </>
              ) : (
                "Salvar e Enviar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
