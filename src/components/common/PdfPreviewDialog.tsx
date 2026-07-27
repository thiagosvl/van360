import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isNativeApp } from "@/utils/detectPlatform";
import {
  FileText,
  Loader2,
  Minus,
  Plus,
  Download,
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
  showDownload?: boolean;
  variant?: "default" | "admin";
}

export function PdfPreviewDialog({
  isOpen,
  onClose,
  pdfUrl,
  title = "Prévia do Documento",
  fileName,
  showDownload = false,
  variant = "default",
}: PdfPreviewDialogProps) {
  const isDark = variant === "admin";
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

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName || `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cálculo da largura base e ampliação estritamente proporcional
  const baseWidth = Math.min(window.innerWidth - 48, 720);
  const pageWidth = Math.round(baseWidth * scale);

  return (
    <AdminBaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      maxWidth="5xl"
      description="Visualização do modelo do contrato em PDF"
      variant={variant}
    >
      <AdminBaseDialog.Header
        title={title}
        icon={<FileText className={cn("h-5 w-5", isDark ? "text-blue-400" : "text-blue-600")} />}
        onClose={onClose}
        variant={variant}
      />

      {/* Barra de Ferramentas Centralizada */}
      <div
        className={cn(
          "px-4 py-2 flex items-center justify-between shrink-0 select-none shadow-md border-y",
          isDark
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-slate-100 border-slate-200 text-slate-800"
        )}
      >
        <div className="w-10 sm:w-28" />

        <div
          className={cn(
            "flex items-center gap-2 p-1 rounded-xl border",
            isDark
              ? "bg-slate-950/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className={cn(
              "h-8 w-8 rounded-lg disabled:opacity-30 transition-colors",
              isDark
                ? "text-slate-300 hover:text-white hover:bg-slate-800"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
            title="Reduzir Zoom (-)"
          >
            <Minus className="h-4 w-4" />
          </Button>

          {/* Indicador Numérico Discreto */}
          <span
            className={cn(
              "px-3 text-xs font-bold font-mono tracking-wider select-none min-w-[52px] text-center",
              isDark ? "text-slate-200" : "text-slate-700"
            )}
          >
            {Math.round(scale * 100)}%
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
            className={cn(
              "h-8 w-8 rounded-lg disabled:opacity-30 transition-colors",
              isDark
                ? "text-slate-300 hover:text-white hover:bg-slate-800"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
            title="Aumentar Zoom (+)"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-10 sm:w-28 flex justify-end">
          {showDownload && !isNativeApp() && pdfUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className={cn(
                "h-8 px-2.5 rounded-lg text-xs font-bold transition-all gap-1.5 border",
                isDark
                  ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border-blue-500/30"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border-blue-200"
              )}
              title="Baixar Minuta (PDF)"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Baixar PDF</span>
            </Button>
          )}
        </div>
      </div>

      {/* Área do Documento com Scroll e Pan por Arraste */}
      <AdminBaseDialog.Body
        className={cn(
          "p-0 flex flex-col overflow-hidden relative",
          isDark ? "bg-[#0b0f19]" : "bg-slate-200/70"
        )}
      >
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
                    <Loader2 className={cn("h-8 w-8 animate-spin", isDark ? "text-blue-400" : "text-blue-600")} />
                    <p
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest animate-pulse",
                        isDark ? "text-slate-400" : "text-slate-500"
                      )}
                    >
                      Carregando documento...
                    </p>
                  </div>
                }
                className="flex flex-col items-center"
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <div
                    key={`prev_page_${index + 1}`}
                    className={cn(
                      "mb-6 last:mb-0 bg-white rounded-sm overflow-hidden border",
                      isDark
                        ? "shadow-2xl border-slate-700/80"
                        : "shadow-xl border-slate-300"
                    )}
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
      </AdminBaseDialog.Body>
    </AdminBaseDialog>
  );
}

export default PdfPreviewDialog;
