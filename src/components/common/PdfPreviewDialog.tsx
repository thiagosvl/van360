import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadBlob } from "@/utils/browser";
import { ExternalLink, Loader2, Minus, Plus, Share2, X } from "lucide-react";
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
  
  // Refs for high-performance gestures
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef({
    initialDistance: 0,
    currentScale: 1.0,
    isPinching: false,
  });

  const baseWidth = Math.min(window.innerWidth * 0.9, 850);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setNumPages(null);
      setScale(1.0);
      touchRef.current.currentScale = 1.0;
    }
  }, [isOpen, pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const handleDownload = async () => {
    if (!pdfUrl) return;
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      
      // Tenta usar a Web Share API (Melhor para Mobile/PWA)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], fileName, { type: 'application/pdf' })] })) {
        const file = new File([blob], fileName, { type: 'application/pdf' });
        await navigator.share({
          files: [file],
          title: title,
        });
      } else {
        // Fallback para a utility de download
        downloadBlob(blob, fileName);
      }
    } catch (error) {
      console.error('Download error:', error);
      window.open(pdfUrl, '_blank');
    }
  };

  const updateScale = (newScale: number) => {
    const clamped = Math.min(Math.max(newScale, 0.5), 4.0);
    setScale(clamped);
    touchRef.current.currentScale = clamped;
  };

  const handleZoomIn = () => updateScale(scale + 0.25);
  const handleZoomOut = () => updateScale(scale - 0.25);

  // --- NATIVE-LEVEL PINCH GESTURE ---
  // Usamos CSS Transforms para o gesto ser 60FPS. 
  // O React só atualiza o estado (pesado) no final do movimento.
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      touchRef.current.initialDistance = dist;
      touchRef.current.isPinching = true;
      
      // Desativa transição durante o gesto
      if (wrapperRef.current) wrapperRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchRef.current.isPinching) {
      if (e.cancelable) e.preventDefault();
      
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      
      const ratio = dist / touchRef.current.initialDistance;
      const sessionScale = Math.min(Math.max(scale * ratio, 0.5), 4.0);
      
      // Aplicamos o zoom visual via CSS (Ultra rápido, sem re-render)
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `scale(${ratio})`;
        wrapperRef.current.style.transformOrigin = 'center top';
      }
      
      touchRef.current.currentScale = sessionScale;
    }
  };

  const handleTouchEnd = () => {
    if (touchRef.current.isPinching) {
      touchRef.current.isPinching = false;
      
      // No final do gesto, "fixamos" a escala no estado do React
      // para o PDF ser renderizado com alta qualidade
      setScale(touchRef.current.currentScale);
      
      // Resetamos o transform visual para o React assumir o controle da largura
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = 'scale(1)';
        wrapperRef.current.style.transition = 'transform 0.2s ease-out';
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="w-full max-w-5xl p-0 gap-0 bg-[#525659] h-full max-h-screen sm:h-[95vh] sm:max-h-[95vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        {/* Header estilo Chrome/PDF Viewer */}
        <div className="bg-blue-600 p-4 text-center relative shrink-0 z-10 shadow-lg">
          <div className="absolute left-4 top-4 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="text-white hover:bg-white/20 rounded-full h-10 w-10 shadow-sm border border-white/20"
              title="Baixar ou Compartilhar"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            
            <div className="hidden sm:flex items-center bg-white/10 rounded-full px-1 border border-white/20 backdrop-blur-sm">
                <Button variant="ghost" size="icon" onClick={handleZoomOut} className="text-white hover:bg-white/20 rounded-full h-8 w-8" disabled={scale <= 0.5}><Minus className="h-4 w-4" /></Button>
                <span className="text-[11px] font-bold text-white min-w-[35px] text-center">{Math.round(scale * 100)}%</span>
                <Button variant="ghost" size="icon" onClick={handleZoomIn} className="text-white hover:bg-white/20 rounded-full h-8 w-8" disabled={scale >= 4.0}><Plus className="h-4 w-4" /></Button>
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
          
          {/* Zoom Mobile */}
          <div className="flex sm:hidden justify-center mt-2.5">
             <div className="flex items-center bg-white/10 rounded-full px-1 border border-white/20 backdrop-blur-sm">
                <Button variant="ghost" size="icon" onClick={handleZoomOut} className="text-white hover:bg-white/20 rounded-full h-8 w-8" disabled={scale <= 0.5}><Minus className="h-4 w-4" /></Button>
                <span className="text-[10px] font-bold text-white min-w-[30px] text-center">{Math.round(scale * 100)}%</span>
                <Button variant="ghost" size="icon" onClick={handleZoomIn} className="text-white hover:bg-white/20 rounded-full h-8 w-8" disabled={scale >= 4.0}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="flex-1 bg-[#525659] relative overflow-auto scrollbar-thin scrollbar-thumb-gray-400 touch-pan-x touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 z-20 pointer-events-none">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
              <p className="text-gray-500 font-medium font-sans">Carregando...</p>
            </div>
          )}
          
          {/* 
            IMPORTANTE: 'inline-block' com 'min-w-full' garante que o conteúdo 
            nunca seja cortado à esquerda e comece sempre no (0,0) do scroll.
          */}
          <div className="inline-block min-w-full p-4">
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
                        className="shadow-2xl border-0 rounded-sm overflow-hidden bg-white"
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
