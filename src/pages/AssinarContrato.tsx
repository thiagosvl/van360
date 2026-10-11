import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InitialLoading } from "@/components/auth/InitialLoading";
import { useAssinarContratoViewModel, safeCloseDialog } from "@/hooks";
import { ContratoStatus } from "@/types/enums";
import { openBrowserLink } from "@/utils/browser";
import { getDriverDisplayName } from "@/utils/formatters";
import {
  CheckCircle2,
  Loader2,
  PenTool,
  AlertCircle,
  FileText,
  Plus,
  Minus,
  ExternalLink,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { useParams } from "react-router-dom";
import { SignatureDialog } from "@/components/dialogs/SignatureDialog";
import { cn } from "@/lib/utils";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useState } from "react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function AssinarContrato() {
  const { token } = useParams<{ token: string }>();
  const [currentScale, setCurrentScale] = useState(1);

  const {
    contrato,
    isLoading,
    isError,
    modalAberto,
    setModalAberto,
    numPages,
    sigCanvas,
    handleAssinar,
    onDocumentLoadSuccess,
    isSigning
  } = useAssinarContratoViewModel({ token });

  if (isLoading) {
    return <InitialLoading />;
  }

  if (isError || !contrato) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5] p-4 font-sans">
        <Card className="w-full max-w-md rounded-[24px] border border-[#e5e5e5] bg-white shadow-xs overflow-hidden">
          <div className="bg-[#e7000b] h-1.5 w-full" />
          <CardHeader className="text-center pt-8">
            <div className="mx-auto w-16 h-16 bg-[#e7000b]/10 rounded-[18px] flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-[#e7000b]" />
            </div>
            <CardTitle className="font-bold text-xl text-[#0a0a0a]">Ops! Algo deu errado.</CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-8 px-6">
            <p className="text-[#737373] font-medium text-sm leading-relaxed">
              Não conseguimos localizar este contrato. Ele pode ter sido cancelado, finalizado ou o link expirou.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dadosContrato = (contrato?.dados_contrato || {}) as Record<string, unknown>;

  const condutorInfo = contrato.usuario || {
    apelido: (dadosContrato.apelidoCondutor as string | null | undefined) || null,
    nome: (dadosContrato.nomeCondutor as string | null | undefined) || null,
    cpfcnpj: (dadosContrato.cpfCnpjCondutor as string | null | undefined) || null,
  };
  const nomeCondutorExibicao = getDriverDisplayName(condutorInfo);

  if (contrato.status === ContratoStatus.ASSINADO) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center p-4 font-sans">
        <Card className="w-full max-w-lg border border-[#e5e5e5] shadow-xs bg-white rounded-[24px] overflow-hidden">
          <CardHeader className="text-center pb-2 pt-10 px-8">
            <div className="mx-auto bg-emerald-50 w-16 h-16 rounded-[18px] flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#0a0a0a] tracking-tight leading-tight">
              Contrato Assinado!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-8 p-8 pt-2">
            <p className="text-[#737373] leading-relaxed text-sm font-medium">
              Tudo pronto! O documento foi assinado digitalmente e já possui validade jurídica.
            </p>

            <Button
              onClick={() => openBrowserLink(contrato.contrato_final_url || contrato.contrato_url)}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] h-12 rounded-[18px] font-bold text-sm shadow-xs transition-all active:scale-[0.99] text-white flex items-center justify-center cursor-pointer"
            >
              Ver Contrato <span className="hidden sm:inline ml-1">Assinado</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col h-screen overflow-hidden font-sans">
      <header className="sticky top-0 z-40 bg-[#0b1a2e] h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm shrink-0 relative">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
          <div className="bg-white/10 p-2 sm:p-2.5 rounded-[12px] backdrop-blur-md border border-white/10 shrink-0">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white/90" />
          </div>
          <div className="min-w-0">
            <h3 className="font-headline font-bold text-xs sm:text-sm text-white tracking-tight leading-none mb-1 truncate">
              Contrato de Transporte
            </h3>
            {nomeCondutorExibicao && (
              <p className="text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider leading-none truncate">
                {nomeCondutorExibicao}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => openBrowserLink(window.location.href)}
            className="text-white/80 hover:text-white hover:bg-white/10 h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Abrir no navegador"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Navegador</span>
          </Button>

          <img
            src="/assets/logo-van360.webp"
            alt="Van360"
            className="h-6 sm:h-8 w-auto filter brightness-0 invert opacity-90"
          />
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[#f5f5f5] pb-32 scroll-smooth block touch-auto">
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={4}
          centerOnInit={true}
          wheel={{ disabled: currentScale <= 1, step: 0.1 }}
          pinch={{ step: 5 }}
          doubleClick={{ mode: "toggle", step: 1 }}
          panning={{ disabled: currentScale <= 1, velocityDisabled: false }}
          onTransform={(_, state) => setCurrentScale(state.scale)}
        >
          {({ zoomIn, zoomOut, resetTransform, state }) => (
            <>
              <div className="fixed top-16 sm:top-20 right-4 z-30 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-full shadow-md border border-[#e5e5e5]">
                <button
                  type="button"
                  onClick={() => zoomOut()}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-700 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Diminuir zoom"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => resetTransform()}
                  className="px-1 text-[11px] font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                  aria-label="Restaurar zoom"
                >
                  {Math.round((state.scale || 1) * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => zoomIn()}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-700 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Aumentar zoom"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <TransformComponent
                wrapperClass="!w-full !min-h-full"
                contentClass="!w-full min-w-full flex flex-col items-center py-6 sm:py-10"
              >
                <Document
                  file={contrato.minuta_url}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex flex-col items-center px-4"
                  loading={
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Carregando</span>
                    </div>
                  }
                >
                  {Array.from(new Array(numPages), (_, index) => (
                    <div
                      key={`page_${index + 1}`}
                      className="mb-8 last:mb-0 shadow-sm bg-white border border-[#e5e5e5] rounded-[14px] overflow-hidden"
                    >
                      <Page
                        pageNumber={index + 1}
                        width={Math.min(window.innerWidth - 32, 850)}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                    </div>
                  ))}
                </Document>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </main>

      <div className="fixed bottom-6 left-0 right-0 px-4 sm:px-6 z-50 pointer-events-none w-full flex justify-center">
        <div className="pointer-events-auto flex justify-center">
          <Button
            onClick={() => setModalAberto(true)}
            disabled={contrato.status !== ContratoStatus.PENDENTE}
            className={cn(
              "h-12 sm:h-14 px-6 sm:px-8 rounded-[18px] shadow-lg flex items-center gap-2.5 font-sans font-bold text-sm sm:text-base transition-all active:scale-[0.99] border-0",
              contrato.status === ContratoStatus.PENDENTE
                ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs cursor-pointer"
                : "bg-[#e5e5e5] text-[#737373] cursor-not-allowed shadow-none"
            )}
          >
            <PenTool className="h-4 w-4 sm:h-5 sm:w-5" />
            Assinar contrato
          </Button>
        </div>
      </div>

      <SignatureDialog
        isOpen={modalAberto}
        onClose={() => safeCloseDialog(() => setModalAberto(false))}
        sigCanvas={sigCanvas}
        onAssinar={handleAssinar}
        isSigning={isSigning}
        contrato={contrato}
      />
    </div>
  );
}
