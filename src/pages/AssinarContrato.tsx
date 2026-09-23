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
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { useParams } from "react-router-dom";
import { SignatureDialog } from "@/components/dialogs/SignatureDialog";
import { cn } from "@/lib/utils";

// Estilos obrigatórios do react-pdf para evitar erros no console
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configurar worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function AssinarContrato() {
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

  const dadosContrato = (contrato?.dados_contrato || {}) as Record<string, unknown>;

  const condutorInfo = contrato.usuario || {
    apelido: (dadosContrato.apelidoCondutor as string | null | undefined) || null,
    nome: (dadosContrato.nomeCondutor as string | null | undefined) || null,
    cpfcnpj: (dadosContrato.cpfCnpjCondutor as string | null | undefined) || null,
  };
  const nomeCondutorExibicao = getDriverDisplayName(condutorInfo);

  if (contrato.status === ContratoStatus.ASSINADO) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-lg border-0 shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
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
              className="w-full bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 h-16 rounded-2xl font-headline font-black text-sm shadow-xl shadow-[#1a3a5c]/20 transition-all active:scale-95 text-white uppercase tracking-widest flex items-center justify-center"
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
      <header className="sticky top-0 z-40 bg-[#1a3a5c] h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 shadow-lg shrink-0 relative">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
          <div className="bg-white/10 p-2 sm:p-2.5 rounded-lg sm:rounded-xl backdrop-blur-md border border-white/5 shadow-2xl shrink-0">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
          </div>
          <div className="min-w-0">
            <h3 className="font-headline font-black text-xs sm:text-sm text-white uppercase tracking-tight leading-none mb-1 truncate">
              Contrato de Transporte
            </h3>
            {nomeCondutorExibicao && (
              <p className="text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider leading-none truncate">
                {nomeCondutorExibicao}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center sm:absolute sm:left-1/2 sm:-translate-x-1/2 pointer-events-none">
          <img
            src="/assets/logo-van360.webp"
            alt="Van360"
            className="h-7 sm:h-9 w-auto filter brightness-0 invert opacity-90"
          />
        </div>
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

      <div className="fixed bottom-6 left-0 right-0 px-4 sm:px-6 z-50 pointer-events-none w-full flex justify-center">
        <div className="pointer-events-auto flex justify-center">
          <Button
            onClick={() => setModalAberto(true)}
            disabled={contrato.status !== ContratoStatus.PENDENTE}
            className={cn(
              "h-14 sm:h-16 px-8 sm:px-10 rounded-full shadow-2xl flex items-center gap-2.5 sm:gap-3 font-headline font-black text-sm sm:text-base uppercase tracking-wider transition-all active:scale-95 border-0",
              contrato.status === ContratoStatus.PENDENTE
                ? "bg-[#1a3a5c] hover:bg-[#112a43] text-white shadow-[#1a3a5c]/30"
                : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
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
