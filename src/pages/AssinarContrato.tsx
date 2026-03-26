import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAssinarContratoViewModel } from "@/hooks";
import { ContratoStatus } from "@/types/enums";
import { openBrowserLink } from "@/utils/browser";
import {
  CheckCircle2,
  Download,
  FileSignature,
  Loader2,
  PenTool,
  AlertCircle,
  Minus,
  Plus,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { useParams } from "react-router-dom";
import { SignaturePad, SignaturePadRef } from "@/components/common/SignaturePad";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

// Configurar worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function AssinarContrato() {
  const { token } = useParams<{ token: string }>();
  const [scale, setScale] = useState(1.0);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Gestão de Pinch Zoom
  const pinchRef = useRef({ initialDist: 0, isPinching: false });
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      pinchRef.current.initialDist = dist;
      pinchRef.current.isPinching = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current.isPinching) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const ratio = dist / pinchRef.current.initialDist;
      const newScale = Math.min(Math.max(scale * ratio, 0.5), 3);
      setScale(newScale);
      pinchRef.current.initialDist = dist;
    }
  };

  const handleTouchEnd = () => {
    pinchRef.current.isPinching = false;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-sm font-headline font-bold text-foreground/40 uppercase tracking-widest">Carregando Contrato</p>
      </div>
    );
  }

  if (isError || !contrato) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 p-4">
        <Card className="w-full max-w-md rounded-[2.5rem] border-0 shadow-soft-2xl overflow-hidden">
          <div className="bg-rose-500 h-2 w-full" />
          <CardHeader className="text-center pt-8">
            <div className="mx-auto w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <CardTitle className="font-headline font-black text-2xl text-foreground/80">Contrato não encontrado</CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-10">
            <p className="text-muted-foreground font-medium leading-relaxed">
              O contrato que você está tentando acessar não existe, foi
              cancelado ou expirou. Por favor, entre em contato com o administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (contrato.status === ContratoStatus.ASSINADO) {
    return (
      <div className="min-h-screen bg-gray-50/5 flex flex-col items-center justify-center p-2 sm:p-8">
        <div className="fixed top-0 left-0 right-0 h-20 bg-[#1a3a5c] flex items-center justify-center z-50">
          <img
            src="/assets/logo-van360.png"
            alt="Van360"
            className="h-10 w-auto filter brightness-0 invert opacity-90"
          />
        </div>

        <Card className="w-full max-w-lg border-0 shadow-soft-2xl bg-white rounded-[2.5rem] overflow-hidden mt-12">
          <CardHeader className="text-center pb-2 pt-10 px-8">
            <div className="mx-auto bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-headline font-black text-foreground/80 tracking-tight leading-tight uppercase">
              Contrato Assinado!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-8 p-8 pt-2">
            <p className="text-sm text-muted-foreground leading-relaxed font-medium px-4">
              O processo de assinatura digital foi concluído com sucesso.
              O documento original agora contém a validade jurídica da sua assinatura.
            </p>

            <div className="flex flex-col gap-4">
              <Button
                onClick={() =>
                  openBrowserLink(
                    contrato.contrato_final_url || contrato.contrato_url
                  )
                }
                className="bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 h-14 rounded-2xl font-headline font-black text-sm shadow-lg shadow-[#1a3a5c]/10 transition-all active:scale-95 text-white uppercase tracking-widest"
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar Contrato
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
      <header className="sticky top-0 z-40 bg-[#1a3a5c] border-b border-white/5 shadow-2xl shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a3a5c] via-[#2c5a8c] to-[#1a3a5c] opacity-95" />
        <div className="container mx-auto px-4 h-20 flex items-center justify-between relative z-10">
          <div className="w-10 h-10 hidden sm:block" />
          <img
            src="/assets/logo-van360.png"
            alt="Van360"
            className="h-8 sm:h-10 w-auto filter brightness-0 invert opacity-80"
          />

          <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl px-2 py-1 border border-white/10 shadow-sm ml-auto sm:ml-0">
            <button
              onClick={() => setScale(s => Math.max(s - 0.25, 0.5))}
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all p-1.5 disabled:opacity-20"
              disabled={scale <= 0.5}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-black text-white min-w-[35px] text-center uppercase tracking-tighter mx-1">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(s => Math.min(s + 0.25, 3))}
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all p-1.5 disabled:opacity-20"
              disabled={scale >= 3}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main
        className="flex-1 overflow-auto bg-gray-50 touch-pan-x touch-pan-y pt-4 pb-32"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="inline-block min-w-full p-4 sm:p-8">
          <div
            ref={containerRef}
            className="flex flex-col items-center transition-transform duration-200 origin-top"
          >
            <Document
              file={contrato.minuta_url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                  <span className="text-sm font-headline font-bold text-foreground/40 uppercase tracking-widest">Carregando Minuta</span>
                </div>
              }
              error={
                <div className="p-20 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-rose-500" />
                  </div>
                  <h3 className="font-headline font-black text-xl text-foreground/80">Erro ao carregar PDF</h3>
                  <Button
                    onClick={() => openBrowserLink(contrato.minuta_url)}
                    variant="outline"
                    className="rounded-xl font-bold"
                  >
                    Clique aqui para baixar manualmente
                  </Button>
                </div>
              }
            >
              {
                Array.from(new Array(numPages), (_, index) => (
                  <div key={`page_${index + 1}`} className="mb-8 last:mb-0 shadow-soft-2xl rounded-sm overflow-hidden border border-gray-100 bg-white">
                    <Page
                      pageNumber={index + 1}
                      width={Math.min(window.innerWidth - 64, 750) * scale}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className="overflow-hidden"
                    />
                  </div>
                ))
              }
            </Document>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-8 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-soft-2xl rounded-[2.5rem] p-2 flex items-center gap-2 pointer-events-auto max-w-full overflow-hidden">
          <Button
            onClick={() => openBrowserLink(contrato.minuta_url)}
            variant="ghost"
            className="rounded-2xl h-12 px-5 sm:px-6 font-headline font-black text-[11px] sm:text-xs text-gray-500 hover:bg-gray-100 transition-all active:scale-95 whitespace-nowrap uppercase tracking-wider"
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Baixar </span>PDF
          </Button>

          <Button
            onClick={() => setModalAberto(true)}
            disabled={contrato.status !== ContratoStatus.PENDENTE}
            className={cn(
              "rounded-2xl font-headline font-black h-12 px-6 sm:px-10 text-[11px] sm:text-xs shadow-lg transition-all active:scale-95 whitespace-nowrap uppercase tracking-wider",
              contrato.status === ContratoStatus.PENDENTE
                ? "bg-[#1a3a5c] text-white shadow-[#1a3a5c]/20 hover:bg-[#1a3a5c]/95"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {contrato.status === ContratoStatus.PENDENTE ? (
              <>
                <FileSignature className="mr-2 h-5 w-5" />
                Assinar <span className="hidden sm:inline">Agora</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Assinado
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-soft-2xl rounded-[2.5rem]">
          <DialogHeader className="px-6 pt-7 pb-5 border-b border-gray-100/50 bg-white/70 backdrop-blur-md flex-row items-center justify-between space-y-0 text-left">
            <DialogTitle className="text-lg font-black flex items-center gap-3 font-headline text-foreground/80 text-left">
              <div className="p-2 rounded-2xl bg-primary/10 text-primary">
                <PenTool className="w-5 h-5" />
              </div>
              Assinatura Digital
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground/60 leading-normal text-left">
                Use seu dedo ou mouse para assinar no quadro abaixo.
              </p>
            </div>

            <SignaturePad
              ref={sigCanvas as any}
            />

            <p className="text-[11px] text-center text-muted-foreground/60 font-medium leading-relaxed">
              Ao assinar, você concorda com os termos e condições deste contrato eletrônico.
            </p>
          </div>

          <DialogFooter className="p-6 pt-0 flex flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setModalAberto(false)}
              disabled={isSigning}
              className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-wider border border-slate-100 text-slate-400 hover:text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
            >
              Cancelar
            </Button>

            <Button
              onClick={handleAssinar}
              disabled={isSigning}
              className={cn(
                "flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-wider transition-all active:scale-95 shadow-lg",
                "bg-[#1a3a5c] hover:bg-[#1a3a5c]/95 text-white shadow-[#1a3a5c]/20"
              )}
            >
              {isSigning ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Assinando...
                </>
              ) : (
                "Finalizar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
