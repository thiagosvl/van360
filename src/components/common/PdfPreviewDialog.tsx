import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, Loader2, Minus, Plus, X } from "lucide-react";
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
        className="w-full max-w-5xl p-0 gap-0 bg-[#525659] h-full max-h-screen sm:h-[95vh] sm:max-h-[95vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        {/* PDF Style Header (Removed download/share) */}
        <div className="bg-blue-600 p-4 text-center relative shrink-0 z-10 shadow-lg">
          <div className="absolute left-4 top-4">
            <div className="hidden sm:flex items-center bg-white/10 rounded-full px-1 border border-white/20 backdrop-blur-sm">
                <Button variant="ghost" size="icon" onClick={() => updateScale(scale - 0.25)} className="text-white hover:bg-white/20 rounded-full h-8 w-8" disabled={scale <= 0.5}><Minus className="h-4 w-4" /></Button>
                <span className="text-[11px] font-bold text-white min-w-[35px] text-center">{displayPercentage}%</span>
                <Button variant="ghost" size="icon" onClick={() => updateScale(scale + 0.25)} className="text-white hover:bg-white/20 rounded-full h-8 w-8" disabled={scale >= 4.5}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
          
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors" onClick={onClose}>
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-1 backdrop-blur-sm">
            <ExternalLink className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-lg font-bold text-white leading-tight">
            {title}
          </DialogTitle>
          
          {/* Mobile Zoom Sync */}
          <div className="flex sm:hidden justify-center mt-2.5">
             <div className="flex items-center bg-white/10 rounded-full px-1 border border-white/20 backdrop-blur-sm">
                <Button variant="ghost" size="icon" onClick={() => updateScale(scale - 0.25)} className="text-white hover:bg-white/20 rounded-full h-8 w-8" disabled={scale <= 0.5}><Minus className="h-4 w-4" /></Button>
                <span className="text-[10px] font-bold text-white min-w-[30px] text-center">{displayPercentage}%</span>
                <Button variant="ghost" size="icon" onClick={() => updateScale(scale + 0.25)} className="text-white hover:bg-white/20 rounded-full h-8 w-8" disabled={scale >= 4.5}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        {/* HIGH QUALITY SCROLL AREA */}
        <div 
          className="flex-1 bg-[#525659] relative overflow-auto block scrollbar-thin scrollbar-thumb-gray-400 touch-pan-x touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 z-20 pointer-events-none">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
              <p className="text-gray-500 font-medium font-sans">Sincronizando...</p>
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
