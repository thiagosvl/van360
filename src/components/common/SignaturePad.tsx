import { useLayoutEffect, useRef, useImperativeHandle, forwardRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { PenTool, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SignaturePadRef {
  clear: () => void;
  toDataURL: (type?: string, encoderOptions?: number) => string;
  isEmpty: () => boolean;
  fromDataURL: (dataURL: string) => void;
}

interface SignaturePadProps {
  onChange?: (dataURL: string | null) => void;
  initialValue?: string | null;
  className?: string;
  penColor?: string;
  showClearButton?: boolean;
}

const SIGNATURE_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' fill='%230a0a0a' stroke='white' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='m15 5 4 4' stroke='white' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") 2 22, crosshair`;

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onChange, initialValue, className, penColor = "#0a0a0a", showClearButton = true }, ref) => {
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const getTrimmedDataUrl = (type = "image/png"): string => {
      if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) return "";
      try {
        return sigCanvasRef.current.getTrimmedCanvas().toDataURL(type);
      } catch {
        return sigCanvasRef.current.toDataURL(type);
      }
    };

    useImperativeHandle(ref, () => ({
      clear: () => {
        sigCanvasRef.current?.clear();
        onChange?.(null);
      },
      toDataURL: (type = "image/png") => getTrimmedDataUrl(type),
      isEmpty: () => sigCanvasRef.current?.isEmpty() ?? true,
      fromDataURL: (dataURL) => sigCanvasRef.current?.fromDataURL(dataURL),
    }));

    const resizeCanvas = () => {
      if (sigCanvasRef.current && containerRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const container = containerRef.current;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);

        const currentData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();

        canvas.width = container.offsetWidth * ratio;
        canvas.height = container.offsetHeight * ratio;
        canvas.getContext("2d")?.scale(ratio, ratio);

        if (currentData) {
          sigCanvasRef.current.fromDataURL(currentData);
        } else {
          sigCanvasRef.current.clear();
        }
      }
    };

    useLayoutEffect(() => {
      const timeout = setTimeout(resizeCanvas, 150);
      window.addEventListener("resize", resizeCanvas);

      if (initialValue && sigCanvasRef.current) {
        sigCanvasRef.current.fromDataURL(initialValue);
      }

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        clearTimeout(timeout);
      };
    }, []);

    const handleEnd = () => {
      if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
        onChange?.(getTrimmedDataUrl());
      }
    };

    const handleClear = () => {
      sigCanvasRef.current?.clear();
      onChange?.(null);
    };

    return (
      <div className={cn("space-y-3", className)}>
        <div
          ref={containerRef}
          style={{ cursor: SIGNATURE_CURSOR }}
          className="relative w-full h-48 sm:h-56 rounded-[22px] bg-[#fafafa] border border-[#e5e5e5] overflow-hidden select-none transition-colors"
        >
          <div className="absolute inset-x-5 sm:inset-x-8 bottom-3 sm:bottom-4 pointer-events-none flex flex-col gap-1">
            <div className="w-full border-b border-[#e5e5e5] border-dashed" />
            <div className="flex items-center text-[10px] sm:text-[11px] text-[#a3a3a3] select-none px-0.5">
              <span>✕ Assine na linha acima</span>
            </div>
          </div>

          <SignatureCanvas
            ref={sigCanvasRef}
            penColor={penColor}
            minWidth={1.5}
            maxWidth={3.5}
            onEnd={handleEnd}
            canvasProps={{
              className: "w-full h-full relative z-10",
              style: { cursor: SIGNATURE_CURSOR, touchAction: "none" },
            }}
            backgroundColor="transparent"
          />

          <div className="absolute top-3 right-3 pointer-events-none z-20">
            <div className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-[18px] flex items-center gap-1.5 border border-[#e5e5e5] shadow-2xs">
              <PenTool className="w-3 h-3 text-[#737373]" />
              <span className="text-[11px] font-medium text-[#0a0a0a]">Assinatura</span>
            </div>
          </div>
        </div>

        {showClearButton && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-[#737373] hover:text-[#e7000b] flex items-center gap-1.5 transition-colors cursor-pointer py-1.5 px-3 rounded-[16px] bg-[#f5f5f5] hover:bg-red-50 border border-[#e5e5e5]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar assinatura</span>
            </button>
          </div>
        )}
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";

export { SignaturePad };
