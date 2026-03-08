import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, ExternalLink, Loader2, Minus, Plus, X } from "lucide-react";
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
  fileName = "documento.pdf"
}: PdfPreviewDialogProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1.0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Pinch-to-zoom state
  const touchState = useRef({
    initialDistance: 0,
    initialScale: 1.0,
  });

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setNumPages(null);
      setScale(1.0);
    }
  }, [isOpen, pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 3.0));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));

  // Pinch-to-zoom logic
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      touchState.current.initialDistance = dist;
      touchState.current.initialScale = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchState.current.initialDistance > 0) {
      // Prevent default to avoid page scrolling while pinching
      e.preventDefault();
      
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      
      const zoomFactor = dist / touchState.current.initialDistance;
      const newScale = Math.min(Math.max(touchState.current.initialScale * zoomFactor, 0.5), 3.0);
      
      setScale(newScale);
    }
  };

  const handleTouchEnd = () => {
    touchState.current.initialDistance = 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="w-full max-w-5xl p-0 gap-0 bg-gray-50 h-full max-h-screen sm:h-[95vh] sm:max-h-[95vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <div className="absolute left-4 top-4 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="text-white hover:bg-white/20 rounded-full h-10 w-10 shadow-sm border border-white/20"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </Button>
            
            <div className="hidden sm:flex items-center bg-white/10 rounded-full px-1 border border-white/20 backdrop-blur-sm">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomOut}
                    className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                    disabled={scale <= 0.5}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="text-[10px] font-bold text-white min-w-[35px] text-center">
                    {Math.round(scale * 100)}%
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomIn}
                    className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                    disabled={scale >= 3.0}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
          </div>
          
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors" onClick={onClose}>
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <ExternalLink className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {title}
          </DialogTitle>
          
          {/* Zoom controls for Mobile */}
          <div className="flex sm:hidden justify-center mt-3">
             <div className="flex items-center bg-white/10 rounded-full px-1 border border-white/20 backdrop-blur-sm">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomOut}
                    className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                    disabled={scale <= 0.5}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="text-[10px] font-bold text-white min-w-[35px] text-center">
                    {Math.round(scale * 100)}%
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomIn}
                    className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                    disabled={scale >= 3.0}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="flex-1 bg-gray-200 relative overflow-auto flex flex-col items-center p-4 scrollbar-thin scrollbar-thumb-gray-400 touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 z-10 pointer-events-none">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
              <p className="text-gray-500 font-medium">Carregando visualização...</p>
            </div>
          )}
          
          <div 
            className="origin-top transition-transform duration-100 ease-out" 
            style={{ transform: `scale(${scale})` }}
          >
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
                    width={Math.min(window.innerWidth * 0.85, 800)}
                    className="shadow-xl border-0 rounded-sm overflow-hidden"
                    />
                ))}
                </Document>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                Nenhuma prévia disponível
                </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
