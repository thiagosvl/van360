import { BaseDialog } from "@/components/ui/BaseDialog";
import { FileText, Loader2, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fileName = "documento.pdf"
}: PdfPreviewDialogProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1.0);
  const [displayPercentage, setDisplayPercentage] = useState(100);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinchRef = useRef({
    initialDistance: 0,
    currentRatio: 1.0,
    isPinching: false,
  });

  const baseWidth = Math.min(window.innerWidth * 0.9, 850);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setNumPages(null);
      setScale(1.0);
      setDisplayPercentage(100);
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = 'scale(1)';
      }
    }
  }, [isOpen, pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const updateScale = (newScale: number) => {
    const clamped = Math.min(Math.max(newScale, 0.5), 4.5);
    setScale(clamped);
    setDisplayPercentage(Math.round(clamped * 100));
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = 'scale(1)';
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      pinchRef.current.initialDistance = dist;
      pinchRef.current.isPinching = true;
      if (wrapperRef.current) {
        wrapperRef.current.style.transition = 'none';
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current.isPinching) {
      if (e.cancelable) e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      if (pinchRef.current.initialDistance > 10) {
        const ratio = dist / pinchRef.current.initialDistance;
        const targetScale = scale * ratio;
        if (targetScale >= 0.3 && targetScale <= 5.0) {
          pinchRef.current.currentRatio = ratio;
          if (wrapperRef.current) {
            wrapperRef.current.style.transform = `scale(${ratio})`;
            wrapperRef.current.style.transformOrigin = 'center top';
          }
          const newPercentage = Math.round(targetScale * 100);
          if (newPercentage !== displayPercentage) {
            setDisplayPercentage(newPercentage);
          }
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (pinchRef.current.isPinching) {
      pinchRef.current.isPinching = false;
      const finalScale = scale * pinchRef.current.currentRatio;
      updateScale(finalScale);
      pinchRef.current.initialDistance = 0;
      pinchRef.current.currentRatio = 1.0;
    }
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && onClose()} className="max-w-4xl max-h-[95vh] h-full">
      <BaseDialog.Header
        title={title}
        icon={<FileText className="w-5 h-5 opacity-80" />}
        subtitle="Visualizando Modelo do Contrato"
        onClose={onClose}
      />

      <div className="flex items-center justify-center py-2.5 border-b border-slate-100/60 shrink-0">
        <div className="flex items-center bg-slate-50 rounded-xl px-2.5 py-1 border border-slate-100 shadow-sm">
          <button
            onClick={() => updateScale(scale - 0.25)}
            className="text-slate-400 hover:text-[#1a3a5c] hover:bg-white rounded-lg transition-all p-1.5 disabled:opacity-30"
            disabled={scale <= 0.5}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="text-[11px] font-black text-[#1a3a5c] min-w-[50px] text-center uppercase tracking-tighter mx-1.5">
            {displayPercentage}%
          </span>
          <button
            onClick={() => updateScale(scale + 0.25)}
            className="text-slate-400 hover:text-[#1a3a5c] hover:bg-white rounded-lg transition-all p-1.5 disabled:opacity-30"
            disabled={scale >= 4.5}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <BaseDialog.Body className="p-0 bg-slate-50 min-h-0">
        <div
          className="relative flex-1 overflow-auto block scrollbar-thin scrollbar-thumb-slate-200 touch-pan-x touch-pan-y h-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 pointer-events-none">
            <Loader2 className="w-10 h-10 text-[#1a3a5c] animate-spin mb-3" />
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">Sincronizando...</p>
          </div>
        )}

        <div className="inline-block min-w-full p-4 md:p-8">
          <div ref={wrapperRef} className="flex flex-col items-center">
            {pdfUrl ? (
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div />}
                className="flex flex-col items-center gap-4"
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    width={baseWidth * scale}
                    className="shadow-2xl border-0 rounded-sm overflow-hidden bg-white origin-center"
                  />
                ))}
              </Document>
            ) : (
              <div className="flex items-center justify-center w-full min-h-[50vh] text-gray-400">
                Nenhuma prévia disponível
              </div>
            )}
          </div>
        </div>
        </div>
      </BaseDialog.Body>
    </BaseDialog>
  );
}
