import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, FileText, Loader2, Minus, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure worker for Vite
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
  // eslint-disable-next-line @typescript_eslint/no-unused-vars
  fileName = "documento.pdf"
}: PdfPreviewDialogProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1.0);
  
  // Real-time zoom display state for the header percentage
  const [displayPercentage, setDisplayPercentage] = useState(100);
  
  // High-performance gesture management
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinchRef = useRef({
    initialDistance: 0,
    currentRatio: 1.0,
    isPinching: false,
  });

  // Base width for the PDF relative to display size
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
        
        // Dynamic limits (visual feedback)
        if (targetScale >= 0.3 && targetScale <= 5.0) {
          pinchRef.current.currentRatio = ratio;
          
          // CSS Zoom for performance (GPU-accelerated)
          if (wrapperRef.current) {
            wrapperRef.current.style.transform = `scale(${ratio})`;
            wrapperRef.current.style.transformOrigin = 'center top';
          }
          
          // Smoothly update the text percentage
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
      updateScale(finalScale); // This updates the PDF quality and resets the transform
      pinchRef.current.initialDistance = 0;
      pinchRef.current.currentRatio = 1.0;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="w-[calc(100%-1.25rem)] sm:w-full max-w-4xl p-0 gap-0 bg-white h-full max-h-[95vh] sm:h-[95vh] flex flex-col overflow-hidden rounded-[2rem] sm:rounded-[2rem] border-0 shadow-2xl"
      >
        {/* Premium Header Re-structured */}
        <div className="p-5 sm:p-6 flex flex-col gap-4 bg-white border-b border-slate-100/60 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 bg-slate-50/50 text-[#1a3a5c] border border-slate-100 shadow-sm transition-all duration-500">
                <FileText className="w-5 h-5 opacity-80" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <DialogTitle className="text-sm sm:text-lg font-headline font-black text-[#1a3a5c] uppercase tracking-tight">
                  {title}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                    Visualizando Modelo do Contrato
                    </span>
                </div>
              </div>
            </div>

            </div>

          {/* Zoom Controls Line (Refined Size) */}
          <div className="flex items-center justify-center -mt-2">
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
        </div>

        {/* HIGH QUALITY SCROLL AREA */}
        <div 
          className="flex-1 bg-slate-50 relative overflow-auto block scrollbar-thin scrollbar-thumb-slate-200 touch-pan-x touch-pan-y"
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
      </DialogContent>
    </Dialog>
  );
}
