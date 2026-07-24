import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Maximize2,
  Minus,
  Plus,
  Scan,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  fileName = "modelo-contrato.pdf",
}: PdfPreviewDialogProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const touchStartDistRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1.0);

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

  // Controles de Zoom
  const handleZoomIn = () => setScale((prev) => Math.min(3.0, Number((prev + 0.2).toFixed(2))));
  const handleZoomOut = () => setScale((prev) => Math.max(0.5, Number((prev - 0.2).toFixed(2))));
  const handleResetZoom = () => setScale(1.0);

  // Ação de Download do PDF (Compatível com Browser e Capacitor)
  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = fileName;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Ação de Abrir em Nova Aba / Leitor Nativo (Compatível com Browser e Capacitor)
  const handleOpenNewTab = () => {
    if (!pdfUrl) return;
    const isCapacitor = Boolean((window as any).Capacitor);
    if (isCapacitor) {
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.target = "_system";
      a.rel = "noopener noreferrer";
      a.click();
    } else {
      window.open(pdfUrl, "_blank");
    }
  };

  // Handlers para Arrastar (Pan) via Mouse
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

  // Handlers para Pinça (Pinch-to-Zoom) no Mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartDistRef.current = dist;
      initialScaleRef.current = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = currentDist / touchStartDistRef.current;
      const newScale = Math.min(3.0, Math.max(0.5, initialScaleRef.current * ratio));
      setScale(Number(newScale.toFixed(2)));
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
  };

  // Handler para Zoom via Roda do Mouse (Ctrl + Wheel)
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      setScale((prev) => Math.min(3.0, Math.max(0.5, Number((prev + delta).toFixed(2)))));
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  // Cálculo da largura base das páginas para acomodar o viewport
  const baseWidth = Math.min(window.innerWidth - 48, 720);
  const pageWidth = Math.round(baseWidth * scale);

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="max-w-5xl max-h-[94vh] h-full"
      description="Visualização interativa do modelo do contrato em PDF com zoom"
    >
      <BaseDialog.Header
        title={title}
        icon={<FileText className="h-5 w-5" />}
        onClose={onClose}
      />

      {/* Barra de Ferramentas com a Identidade Visual do Sistema (#1a3a5c) */}
      <div className="bg-[#1a3a5c] text-white px-3 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#142e4a] shrink-0 select-none shadow-md">
        {/* Lado Esquerdo: Controles de Zoom */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="h-8 w-8 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors"
            title="Reduzir Zoom (-)"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md text-xs font-black tracking-wide min-w-[56px] text-center border border-white/20 transition-colors"
            title="Clique para redefinir para 100%"
          >
            {Math.round(scale * 100)}%
          </button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
            className="h-8 w-8 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors"
            title="Aumentar Zoom (+)"
          >
            <Plus className="h-4 w-4" />
          </Button>

          {scale !== 1.0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleResetZoom}
              className="h-8 w-8 text-blue-200 hover:text-white hover:bg-white/15 rounded-lg transition-colors ml-0.5"
              title="Ajustar à Tela (100%)"
            >
              <Scan className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Lado Direito: Ações Rápidas (Download e Nova Aba) */}
        <div className="flex items-center gap-1.5">
          {numPages && (
            <span className="text-[10px] font-bold text-slate-200/80 uppercase tracking-widest hidden sm:inline mr-2">
              {numPages} {numPages === 1 ? "Página" : "Páginas"}
            </span>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={!pdfUrl}
            className="h-8 px-2.5 text-xs font-bold text-white hover:bg-white/15 border border-white/20 rounded-lg gap-1.5 transition-all active:scale-95 shadow-2xs"
            title="Baixar PDF"
          >
            <Download className="h-3.5 w-3.5 text-blue-200" />
            <span className="hidden sm:inline">Baixar PDF</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleOpenNewTab}
            disabled={!pdfUrl}
            className="h-8 px-2.5 text-xs font-bold text-white hover:bg-white/15 border border-white/20 rounded-lg gap-1.5 transition-all active:scale-95 shadow-2xs"
            title="Abrir em Nova Aba / Leitor Nativo"
          >
            <ExternalLink className="h-3.5 w-3.5 text-emerald-200" />
            <span className="hidden sm:inline">Abrir em Nova Aba</span>
          </Button>
        </div>
      </div>

      {/* Área do Documento com Rolo e Pan Fluido para Esquerda/Direita sem Truncamento */}
      <BaseDialog.Body className="bg-slate-200/80 p-0 flex flex-col overflow-hidden relative">
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={cn(
            "flex-1 overflow-auto p-4 sm:p-8 block touch-pan-x touch-pan-y scroll-smooth select-none",
            scale > 1.0
              ? isMouseDown
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-default"
          )}
        >
          {/* O container w-max mx-auto garante que scrollLeft=0 mostre a extremidade esquerda completa do PDF sem cortes */}
          <div className="w-max mx-auto flex flex-col items-center py-2 min-h-full">
            {pdfUrl ? (
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="py-24 flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1a3a5c]" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">
                      Carregando documento em alta resolução...
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
