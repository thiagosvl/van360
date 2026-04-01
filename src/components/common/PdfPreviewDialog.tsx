import { BaseDialog } from "@/components/ui/BaseDialog";
import { FileText, Loader2, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Corrigir import de estilos e worker para versão moderna
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  title?: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fileName?: string;
}

export function PdfPreviewDialog({
  isOpen,
  onClose,
  pdfUrl,
  title = "Prévia do Documento",
}: PdfPreviewDialogProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setNumPages(null);
    }
  }, [isOpen, pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  return (
    <BaseDialog 
      open={isOpen} 
      onOpenChange={(open) => !open && onClose()} 
      className="max-w-4xl max-h-[92vh] h-full"
      description="Visualização de documento em PDF"
    >
      <BaseDialog.Header
        title={title}
        subtitle="Visualizador do Sistema"
        icon={<FileText className="h-5 w-5" />}
        onClose={onClose}
      />

      <BaseDialog.Body className="bg-slate-100 p-0 sm:p-0 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4 sm:p-12 block touch-auto scroll-smooth">
          <div className="flex flex-col items-center min-w-full">
            {pdfUrl ? (
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="py-20 flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1a3a5c]/20" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Carregando PDF...</p>
                  </div>
                }
                className="flex flex-col items-center px-4"
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <div 
                    key={`prev_page_${index + 1}`} 
                    className="mb-8 last:mb-0 shadow-[0_20px_60px_rgba(0,0,0,0.15)] bg-white border border-slate-200/50"
                  >
                    <Page
                      pageNumber={index + 1}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={Math.min(window.innerWidth - 64, 800)}
                    />
                  </div>
                ))}
              </Document>
            ) : (
              <div className="py-20 text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">
                Nenhum documento disponível
              </div>
            )}
          </div>
        </div>
      </BaseDialog.Body>
    </BaseDialog>
  );
}

export default PdfPreviewDialog;
