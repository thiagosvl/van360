import { BaseDialog } from "@/components/ui/BaseDialog";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { Button } from "@/components/ui/button";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Loader2,
  Minus,
  Plus,
  Download,
  Pencil,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { downloadContratoFile } from "@/utils/domain/contrato/shareContrato";

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
  isLoading?: boolean;
  showEditModel?: boolean;
  onEditModel?: () => void;
  editModelLabel?: string;
}

export function PdfPreviewDialog({
  isOpen,
  onClose,
  pdfUrl,
  title = "Prévia do Documento",
  fileName,
  showDownload = true,
  variant = "default",
  isLoading = false,
  showEditModel = true,
  onEditModel,
  editModelLabel = "Editar Modelo",
}: PdfPreviewDialogProps) {
  const navigate = useNavigate();
  const isDark = variant === "admin";
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const [isDownloading, setIsDownloading] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNumPages(null);
      setScale(1.0);
    }
  }, [isOpen, pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleZoomIn = () => setScale((prev) => Math.min(3.0, Number((prev + 0.2).toFixed(2))));
  const handleZoomOut = () => setScale((prev) => Math.max(0.5, Number((prev - 0.2).toFixed(2))));

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

  const handleDownload = async () => {
    if (!pdfUrl || isDownloading) return;
    setIsDownloading(true);
    try {
      const resolvedName = fileName || `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`;
      await downloadContratoFile({
        url: pdfUrl,
        filename: resolvedName,
        title: title,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const baseWidth = Math.min(window.innerWidth - 48, 720);
  const pageWidth = Math.round(baseWidth * scale);

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const handleEditModel = () => {
    safeCloseDialog(() => {
      onClose();
      if (onEditModel) {
        onEditModel();
      } else {
        navigate(ROUTES.PRIVATE.MOTORISTA.CONTRACT_SETUP);
      }
    });
  };

  if (isDark) {
    return (
      <AdminBaseDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
        maxWidth="5xl"
        description="Visualização do modelo do contrato em PDF"
        variant="admin"
      >
        <AdminBaseDialog.Header
          title={title}
          icon={<FileText className="h-5 w-5 text-blue-400" />}
          onClose={handleClose}
          variant="admin"
        />

        <div className="px-4 py-2 flex items-center justify-between shrink-0 select-none shadow-md border-y bg-[#0b1a2e] border-[#183659] text-white">
          <div className="w-10 sm:w-28" />

          <div className="flex items-center gap-2 p-1 rounded-xl border bg-black/40 border-[#183659]">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={isLoading || scale <= 0.5}
              className="h-8 w-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
              title="Reduzir Zoom (-)"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <span className="px-3 text-xs font-bold font-mono tracking-wider select-none min-w-[52px] text-center text-white/90">
              {Math.round(scale * 100)}%
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={isLoading || scale >= 3.0}
              className="h-8 w-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
              title="Aumentar Zoom (+)"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-10 sm:w-28" />
        </div>

        <AdminBaseDialog.Body className="p-0 flex flex-col overflow-hidden relative bg-[#0b0f19]">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={cn(
              "flex-1 overflow-auto p-4 sm:p-8 block scroll-smooth select-none",
              scale > 1.0 ? (isMouseDown ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
            )}
          >
            <div className="w-max mx-auto flex flex-col items-center py-2 min-h-full">
              {(isLoading || !pdfUrl || !numPages) && (
                <div className="py-24 flex flex-col items-center justify-center gap-3 select-none">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60 animate-pulse">
                    Carregando documento...
                  </p>
                </div>
              )}

              {!isLoading && pdfUrl && (
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={null}
                  className={cn("flex flex-col items-center", !numPages && "hidden")}
                >
                  {Array.from(new Array(numPages || 0), (_, index) => (
                    <div
                      key={`prev_page_${index + 1}`}
                      className="mb-6 last:mb-0 bg-white rounded-sm overflow-hidden border shadow-2xl border-[#183659]"
                    >
                      <Page
                        pageNumber={index + 1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={pageWidth}
                        loading={null}
                      />
                    </div>
                  ))}
                </Document>
              )}
            </div>
          </div>
        </AdminBaseDialog.Body>

        <AdminBaseDialog.Footer className="justify-end">
          {onEditModel ? (
            <AdminBaseDialog.Action
              label={editModelLabel}
              variant="secondary"
              icon={<Pencil className="w-4 h-4 mr-1.5" />}
              onClick={handleEditModel}
            />
          ) : (
            <AdminBaseDialog.Action
              label="Fechar"
              variant="secondary"
              onClick={handleClose}
            />
          )}
          {showDownload && !isLoading && pdfUrl && (
            <AdminBaseDialog.Action
              label={isDownloading ? "Baixando..." : "Baixar PDF"}
              variant="primary"
              icon={isDownloading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Download className="w-4 h-4 mr-1.5" />}
              onClick={handleDownload}
              disabled={isDownloading}
            />
          )}
        </AdminBaseDialog.Footer>
      </AdminBaseDialog>
    );
  }

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      maxWidth="5xl"
      description="Visualização do modelo do contrato em PDF"
    >
      <BaseDialog.Header
        title={title}
        onClose={handleClose}
      />

      <div className="px-4 py-2 flex items-center justify-between shrink-0 select-none bg-[#fafafa] border-b border-[#e5e5e5]">
        <div className="text-xs font-medium text-[#737373] hidden sm:block">
          {numPages ? `${numPages} ${numPages === 1 ? "página" : "páginas"}` : "Documento"}
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-[18px] bg-white border border-[#e5e5e5] shadow-2xs mx-auto sm:mx-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={isLoading || scale <= 0.5}
            className="h-7 w-7 rounded-[14px] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] disabled:opacity-30 transition-colors"
            title="Reduzir Zoom (-)"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>

          <span className="px-2 text-xs font-semibold text-[#0a0a0a] font-mono select-none min-w-[48px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={isLoading || scale >= 3.0}
            className="h-7 w-7 rounded-[14px] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] disabled:opacity-30 transition-colors"
            title="Aumentar Zoom (+)"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="w-16 hidden sm:block" />
      </div>

      <BaseDialog.Body className="p-0 flex flex-col overflow-hidden relative bg-[#f5f5f5]">
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={cn(
            "flex-1 overflow-auto p-4 sm:p-8 block scroll-smooth select-none min-h-[360px]",
            scale > 1.0 ? (isMouseDown ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
          )}
        >
          <div className="w-max mx-auto flex flex-col items-center py-2 min-h-full">
            {(isLoading || !pdfUrl || !numPages) && (
              <div className="py-24 flex flex-col items-center justify-center gap-3 select-none">
                <Loader2 className="h-8 w-8 animate-spin text-[#0a0a0a]" />
                <p className="text-xs text-[#737373] font-medium animate-pulse">
                  Carregando documento...
                </p>
              </div>
            )}

            {!isLoading && pdfUrl && (
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={null}
                className={cn("flex flex-col items-center", !numPages && "hidden")}
              >
                {Array.from(new Array(numPages || 0), (_, index) => (
                  <div
                    key={`prev_page_${index + 1}`}
                    className="mb-6 last:mb-0 bg-white rounded-[6px] overflow-hidden border border-[#e5e5e5] shadow-md"
                  >
                    <Page
                      pageNumber={index + 1}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={pageWidth}
                      loading={null}
                    />
                  </div>
                ))}
              </Document>
            )}
          </div>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        {showEditModel ? (
          <BaseDialog.Action
            label={editModelLabel}
            variant="secondary"
            icon={<Pencil className="w-4 h-4" />}
            onClick={handleEditModel}
          />
        ) : (
          <BaseDialog.Action
            label="Fechar"
            variant="secondary"
            onClick={handleClose}
          />
        )}
        {showDownload && !isLoading && pdfUrl && (
          <BaseDialog.Action
            label={isDownloading ? "Baixando..." : "Baixar PDF"}
            variant="primary"
            icon={isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            onClick={handleDownload}
            disabled={isDownloading}
          />
        )}
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default PdfPreviewDialog;
