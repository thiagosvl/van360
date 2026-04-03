import { useAnalyticsInjector } from "@/hooks/business/useAnalyticsInjector";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InitialLoading } from "@/components/auth/InitialLoading";
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
  FileText,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { useParams } from "react-router-dom";
import { SignatureDialog } from "@/components/dialogs/SignatureDialog";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

// Estilos obrigatórios do react-pdf para evitar erros no console
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configurar worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function AssinarContrato() {
  useAnalyticsInjector({ clarity: true, force: true });
  const { token } = useParams<{ token: string }>();

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 p-4 font-sans">
        <Card className="w-full max-w-md rounded-[2rem] border-0 shadow-2xl overflow-hidden">
          <div className="bg-rose-500 h-1.5 w-full" />
          <CardHeader className="text-center pt-10">
            <div className="mx-auto w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-rose-500" />
            </div>
            <CardTitle className="font-headline font-black text-2xl text-slate-800">Ops! Algo deu errado.</CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-12 px-8">
            <p className="text-slate-500 font-medium leading-relaxed">
              Não conseguimos localizar este contrato. Ele pode ter sido cancelado, finalizado ou o link expirou.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (contrato.status === ContratoStatus.ASSINADO) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="fixed top-0 left-0 right-0 h-20 bg-[#1a3a5c] flex items-center justify-center z-50 shadow-lg">
          <img
            src="/assets/logo-van360.png"
            alt="Van360"
            className="h-9 w-auto filter brightness-0 invert opacity-90"
          />
        </div>

        <Card className="w-full max-w-lg border-0 shadow-2xl bg-white rounded-[2.5rem] overflow-hidden mt-12">
          <CardHeader className="text-center pb-2 pt-12 px-10">
            <div className="mx-auto bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-8">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <CardTitle className="text-[28px] font-headline font-black text-slate-800 tracking-tight leading-tight uppercase">
              Contrato Assinado!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-10 p-10 pt-4">
            <p className="text-slate-500 leading-relaxed font-medium">
              Tudo pronto! O documento foi assinado digitalmente e já possui validade jurídica.
            </p>

            <Button
              onClick={() => openBrowserLink(contrato.contrato_final_url || contrato.contrato_url)}
              className="w-full bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 h-16 rounded-2xl font-headline font-black text-sm shadow-xl shadow-[#1a3a5c]/20 transition-all active:scale-95 text-white uppercase tracking-widest flex items-center justify-center gap-3"
            >
              Ver Contrato <span className="hidden sm:inline">Assinado</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col h-screen overflow-hidden font-sans">
      <header className="sticky top-0 z-40 bg-[#1a3a5c] h-14 sm:h-16 flex items-center justify-between px-5 sm:px-6 shadow-lg shrink-0 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 sm:p-2.5 rounded-lg sm:rounded-xl backdrop-blur-md border border-white/5 shadow-2xl">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
          </div>
          <div>
            <h3 className="font-headline font-black text-[11px] sm:text-xs text-white uppercase tracking-tight leading-none mb-0.5 sm:mb-1">Contrato</h3>
            <p className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">Assinautura Digital</p>
          </div>
        </div>

        <img
          src="/assets/logo-van360.png"
          alt="Van360"
          className="h-7 sm:h-9 w-auto filter brightness-0 invert opacity-90 sm:absolute sm:left-1/2 sm:-translate-x-1/2"
        />
      </header>

      <main className="flex-1 overflow-auto bg-slate-100 pb-32 scroll-smooth block touch-auto">
        <div className="min-w-full py-6 sm:py-10 flex flex-col items-center">
          <Document
            file={contrato.minuta_url}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex flex-col items-center px-4"
            loading={
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#1a3a5c]/30" />
                <span className="text-[10px] font-headline font-black text-[#1a3a5c]/30 uppercase tracking-[0.25em]">Carregando</span>
              </div>
            }
          >
            {Array.from(new Array(numPages), (_, index) => (
              <div
                key={`page_${index + 1}`}
                className="mb-8 last:mb-0 shadow-[0_20px_60px_rgba(0,0,0,0.12)] bg-white border border-slate-200/50"
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
        </div>
      </main>

      {/* Botões Flutuantes Estilo SmartVan */}
      <div className="fixed bottom-6 left-0 right-0 px-5 sm:px-10 z-50 pointer-events-none w-full">
        <div className="flex items-center justify-between w-full pointer-events-auto gap-4">
          <Button
            onClick={() => openBrowserLink(contrato.minuta_url)}
            className="bg-emerald-600/90 hover:bg-emerald-700 text-white h-11 sm:h-13 sm:py-8 px-5 sm:px-8 rounded-full shadow-2xl flex items-center gap-2 font-headline font-black text-[9px] sm:text-xs uppercase tracking-widest transition-all active:scale-95 border-0"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Baixar </span>PDF
          </Button>

          <Button
            onClick={() => setModalAberto(true)}
            disabled={contrato.status !== ContratoStatus.PENDENTE}
            className={cn(
              "h-11 sm:h-13 px-8 sm:px-12 sm:py-8 rounded-full shadow-2xl flex items-center gap-2 sm:gap-3 font-headline font-black text-[9px] sm:text-xs uppercase tracking-widest transition-all active:scale-95 border-0",
              contrato.status === ContratoStatus.PENDENTE
                ? "bg-[#1a3a5c] hover:bg-[#112a43] text-white"
                : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
            )}
          >
            <PenTool className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Assinar <span className="hidden sm:inline">Documento</span>
          </Button>
        </div>
      </div>

      <SignatureDialog
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        sigCanvas={sigCanvas}
        onAssinar={handleAssinar}
        isSigning={isSigning}
        contrato={contrato}
      />
    </div>
  );
}
