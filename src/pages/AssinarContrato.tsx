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
        "Contrato assinado com sucesso! Você receberá o documento via WhatsApp.",
      );
      setModalAberto(false);

      setTimeout(() => {
        // Redirect to landing page or success page
        if (window.opener) {
          window.close();
        } else {
          navigate(ROUTES.PUBLIC.ROOT);
        }
      }, 2000);
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

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <img src="/assets/logo-van360.png" alt="Van360" className="w-20 mx-auto" />
        </CardHeader>

        <CardContent>
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

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white/80 backdrop-blur-md border-t border-gray-100 z-50 flex items-center justify-between gap-4 sm:justify-between transition-all duration-300">
        <Button
          onClick={() => window.open(contrato.minuta_url, "_blank")}
          className="rounded-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 sm:h-14 px-6 sm:px-8 text-base shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:-translate-y-1 transition-all"
        >
          <Download className="mr-2 h-5 w-5" />
          Baixar <span className="hidden sm:inline">Contrato</span>
        </Button>

        <Button
          onClick={() => setModalAberto(true)}
          disabled={contrato.status !== ContratoStatus.PENDENTE}
          className={`rounded-full font-bold h-12 sm:h-14 px-6 sm:px-8 text-base shadow-lg hover:-translate-y-1 transition-all ${
            contrato.status === ContratoStatus.PENDENTE
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-blue-500/30"
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
