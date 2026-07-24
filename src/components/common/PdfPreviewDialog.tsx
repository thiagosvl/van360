import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileText,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  title?: string;
  fileName?: string;
}

export function PdfPreviewDialog({
  isOpen,
  onClose,
  pdfUrl,
  title = "Prévia do Documento",
}: PdfPreviewDialogProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset de estado ao abrir o dialog ou mudar a URL
  useEffect(() => {
    if (isOpen) {
      setNumPages(null);
      setScale(1.0);
    }
  }, [isOpen, pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Controles de Zoom Exclusivos via Botões + e -
  const handleZoomIn = () => setScale((prev) => Math.min(3.0, Number((prev + 0.2).toFixed(2))));
  const handleZoomOut = () => setScale((prev) => Math.max(0.5, Number((prev - 0.2).toFixed(2))));

  // Handlers para Arrastar (Pan) via Mouse / Touch Drag ao dar zoom
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || scale <= 1.0) return;
    setIsMouseDown(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !containerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    containerRef.current.scrollLeft = dragStart.scrollLeft - dx;
    containerRef.current.scrollTop = dragStart.scrollTop - dy;
  };

  const handleMouseUp = () => setIsMouseDown(false);

  // Cálculo da largura base e ampliação estritamente proporcional
  const baseWidth = Math.min(window.innerWidth - 48, 720);
  const pageWidth = Math.round(baseWidth * scale);

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="max-w-5xl max-h-[94vh] h-full"
      description="Visualização do modelo do contrato em PDF"
    >
      <BaseDialog.Header
        title={title}
        icon={<FileText className="h-5 w-5" />}
        onClose={onClose}
      />

      {/* Barra de Ferramentas Centralizada (#1a3a5c) */}
      <div className="bg-[#1a3a5c] text-white px-3 py-2 flex items-center justify-center shrink-0 select-none shadow-md">
        <div className="flex items-center gap-2 bg-white/10 p-1 rounded-xl border border-white/15">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="h-8 w-8 text-white hover:bg-white/20 rounded-lg disabled:opacity-30 transition-colors"
            title="Reduzir Zoom (-)"
          >
            <Minus className="h-4 w-4" />
          </Button>

          {/* Indicador Numérico Discreto (Não clicável, sem hover ou cursor de botão) */}
          <span className="px-3 text-xs font-bold tracking-wider text-slate-200/90 select-none min-w-[52px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
            className="h-8 w-8 text-white hover:bg-white/20 rounded-lg disabled:opacity-30 transition-colors"
            title="Aumentar Zoom (+)"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Área do Documento com Scroll e Pan por Arraste sem truncamento */}
      <BaseDialog.Body className="bg-slate-200/80 p-0 flex flex-col overflow-hidden relative">
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={cn(
            "flex-1 overflow-auto p-4 sm:p-8 block scroll-smooth select-none",
            scale > 1.0
              ? isMouseDown
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-default"
          )}
        >
          <div className="w-max mx-auto flex flex-col items-center py-2 min-h-full">
            {pdfUrl ? (
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="py-24 flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1a3a5c]" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">
                      Carregando documento...
                    </p>
                  </div>
                }
                className="flex flex-col items-center"
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <div
                    key={`prev_page_${index + 1}`}
                    className="mb-6 last:mb-0 shadow-[0_15px_35px_rgba(0,0,0,0.15)] bg-white rounded-sm border border-slate-300 overflow-hidden"
                  >
                    <Page
                      pageNumber={index + 1}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={pageWidth}
                    />
                  </div>
                ))}
              </Document>
            ) : (
              <div className="py-20 text-slate-500 font-bold uppercase tracking-widest text-[10px] italic">
                Nenhum documento disponível para visualização
              </div>
            )}
          </div>
        </div>
      </BaseDialog.Body>
    </BaseDialog>
  );
}

export default PdfPreviewDialog;
