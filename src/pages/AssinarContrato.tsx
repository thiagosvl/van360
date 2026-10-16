import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InitialLoading } from "@/components/auth/InitialLoading";
import { Banner } from "@/components/ui/Banner";
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
  Download,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { useParams } from "react-router-dom";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SignatureDialog } from "@/components/dialogs/SignatureDialog";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { downloadContratoFile } from "@/utils/domain/contrato/shareContrato";
import { gerarNomeArquivoContrato } from "@/utils/domain/contrato/contratoUtils";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

export default function AssinarContrato() {
  const { token } = useParams<{ token: string }>();
  const [isDownloading, setIsDownloading] = useState(false);

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

  useEffect(() => {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const originalViewport = viewportMeta?.getAttribute("content");

    if (viewportMeta) {
      viewportMeta.setAttribute(
        "content",
        "viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, user-scalable=yes"
      );
    }

    const originalBodyTouchAction = document.body.style.touchAction;
    const originalHtmlTouchAction = document.documentElement.style.touchAction;
    document.body.style.touchAction = "manipulation";
    document.documentElement.style.touchAction = "manipulation";

    return () => {
      if (viewportMeta && originalViewport) {
        viewportMeta.setAttribute("content", originalViewport);
      }
      document.body.style.touchAction = originalBodyTouchAction;
      document.documentElement.style.touchAction = originalHtmlTouchAction;
    };
  }, []);

  const dadosContrato = (contrato?.dados_contrato || {}) as Record<string, unknown>;

  const condutorInfo = contrato?.usuario || {
    apelido: (dadosContrato.apelidoCondutor as string | null | undefined) || null,
    nome: (dadosContrato.nomeCondutor as string | null | undefined) || null,
    cpfcnpj: (dadosContrato.cpfCnpjCondutor as string | null | undefined) || null,
  };
  const nomeCondutorExibicao = getDriverDisplayName(condutorInfo);

  const isAssinado = contrato?.status === ContratoStatus.ASSINADO;
  const pdfUrl = isAssinado
    ? (contrato?.contrato_final_url || contrato?.contrato_url || contrato?.minuta_url)
    : contrato?.minuta_url;

  if (isLoading || (contrato && !pdfUrl)) {
    return <InitialLoading message="Preparando seu contrato..." />;
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

  const nomeAluno =
    (dadosContrato.nomeAluno as string | undefined) ||
    (dadosContrato.nomePassageiro as string | undefined) ||
    "";
  const anoLetivo =
    (dadosContrato.anoLetivo as string | number | undefined) ||
    new Date().getFullYear();
  const nomeArquivoContrato = gerarNomeArquivoContrato(nomeAluno, anoLetivo);

  const handleBaixarContrato = async () => {
    const urlDownload = contrato.contrato_final_url || contrato.contrato_url || contrato.minuta_url;
    if (!urlDownload || isDownloading) return;

    setIsDownloading(true);
    try {
      await downloadContratoFile({
        url: urlDownload,
        filename: nomeArquivoContrato,
        title: `Contrato Assinado - ${nomeAluno || "Van360"}`,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col h-screen overflow-hidden font-sans">
      <PublicHeader
        title="Contrato de Transporte"
        subtitle={nomeCondutorExibicao}
        icon={FileText}
        containerClassName="max-w-[850px] px-4"
      />

      <main className="flex-1 overflow-auto bg-[#f5f5f5] pb-32 scroll-smooth block touch-auto">
        <div className="min-w-full py-6 sm:py-10 flex flex-col items-center">
          {isAssinado && (
            <div className="w-full max-w-[850px] px-4 mb-6">
              <Banner
                variant="success"
                title="Contrato Assinado"
                description="Este documento foi assinado digitalmente e já possui validade jurídica."
              />
            </div>
          )}

          <Document
            file={pdfUrl}
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
        </div>
      </main>

      <div className="fixed bottom-6 left-0 right-0 px-4 sm:px-6 z-50 pointer-events-none w-full flex justify-center">
        <div className="pointer-events-auto flex justify-center">
          {isAssinado ? (
            <Button
              onClick={handleBaixarContrato}
              disabled={isDownloading}
              className="h-12 sm:h-14 px-6 sm:px-8 rounded-[18px] shadow-lg flex items-center gap-2.5 font-sans font-bold text-sm sm:text-base bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs cursor-pointer border-0 transition-all active:scale-[0.99]"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              Baixar Contrato Assinado
            </Button>
          ) : (
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
          )}
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
