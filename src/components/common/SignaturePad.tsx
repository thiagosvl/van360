import { useLayoutEffect, useRef, useImperativeHandle, forwardRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { PenTool, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Interface para as ações que o componente pai pode disparar via ref.
 */
export interface SignaturePadRef {
  clear: () => void;
  toDataURL: (type?: string, encoderOptions?: number) => string;
  isEmpty: () => boolean;
  fromDataURL: (dataURL: string) => void;
}

interface SignaturePadProps {
  /** Callback disparado sempre que a assinatura terminar um traço */
  onChange?: (dataURL: string | null) => void;
  /** Valor inicial caso já exista uma assinatura prévia */
  initialValue?: string | null;
  /** Classes extras para o container externo */
  className?: string;
  /** Cor da caneta */
  penColor?: string;
}

/**
 * Componente unificado para captura de assinaturas digitais.
 * Resolve problemas de offset em diferentes DPIs e garante consistência visual premium.
 */
const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onChange, initialValue, className, penColor = "#1a3a5c" }, ref) => {
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Expõe métodos para o pai controlar o canvas
    useImperativeHandle(ref, () => ({
      clear: () => {
        sigCanvasRef.current?.clear();
        onChange?.(null);
      },
      toDataURL: (type, options) => sigCanvasRef.current?.toDataURL(type, options) || "",
      isEmpty: () => sigCanvasRef.current?.isEmpty() || true,
      fromDataURL: (dataURL) => sigCanvasRef.current?.fromDataURL(dataURL),
    }));

    /**
     * Sincroniza o tamanho interno do canvas com o container visual.
     * Isso previne o bug de offset (onde o traço não acompanha o cursor/dedo).
     */
    const resizeCanvas = () => {
      if (sigCanvasRef.current && containerRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const container = containerRef.current;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        
        // Armazena a imagem atual para não perder o desenho no resize
        const currentData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
        
        canvas.width = container.offsetWidth * ratio;
        canvas.height = container.offsetHeight * ratio;
        canvas.getContext("2d")?.scale(ratio, ratio);
        
        // Restaura a assinatura se existir
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
      
      // Carrega valor inicial se fornecido
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
        onChange?.(sigCanvasRef.current.toDataURL("image/png"));
      }
    };

    const handleClear = () => {
      sigCanvasRef.current?.clear();
      onChange?.(null);
    };

    return (
      <div className={cn("space-y-4", className)}>
        <div className="relative group">
          {/* Sombra de fundo inspirada no modelo do motorista */}
          <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-100 rounded-[2.2rem] blur opacity-40 group-hover:opacity-60 transition-opacity" />
          
          <div 
            ref={containerRef}
            className="relative border-4 border-white rounded-[2.1rem] bg-slate-50/50 overflow-hidden shadow-inner h-52 transition-all cursor-crosshair"
          >
            <SignatureCanvas
              ref={sigCanvasRef}
              penColor={penColor}
              minWidth={1.5}
              maxWidth={3.5}
              onEnd={handleEnd}
              canvasProps={{
                className: "w-full h-full",
              }}
              backgroundColor="transparent"
            />
            
            {/* Selo flutuante de instrução */}
            <div className="absolute top-4 right-4 pointer-events-none">
              <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-slate-100 shadow-sm">
                <PenTool className="w-3 h-3 text-[#1a3a5c] opacity-60" />
                <span className="text-[9px] font-black text-[#1a3a5c] uppercase tracking-wider">Faça sua assinatura</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] font-black text-slate-300 hover:text-rose-500 flex items-center gap-1.5 uppercase tracking-widest transition-all active:scale-95 py-2 px-4 rounded-full hover:bg-rose-50/50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpar e refazer
          </button>
        </div>
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";

export { SignaturePad };
