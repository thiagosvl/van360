import { useLayoutEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Check, Edit3, PenLine, Redo2, RotateCcw, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

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

interface PointWithCoordinates {
  x: number;
  y: number;
}

interface StrokeGroup {
  points?: PointWithCoordinates[];
}

const SIGNATURE_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' fill='%230a0a0a' stroke='white' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='m15 5 4 4' stroke='white' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") 2 22, crosshair`;

const MIN_POINTS_THRESHOLD = 6;

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onChange, initialValue, className, penColor = "#0a0a0a", showClearButton = true }, ref) => {
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [hasSignature, setHasSignature] = useState<boolean>(false);
    const [canUndo, setCanUndo] = useState<boolean>(false);
    const [canRedo, setCanRedo] = useState<boolean>(false);
    const redoStackRef = useRef<unknown[]>([]);

    const getTrimmedDataUrl = useCallback((type = "image/png"): string => {
      if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) return "";
      try {
        return sigCanvasRef.current.getTrimmedCanvas().toDataURL(type);
      } catch {
        return sigCanvasRef.current.toDataURL(type);
      }
    }, []);

    const countTotalPoints = useCallback((): number => {
      if (!sigCanvasRef.current) return 0;
      const rawData = sigCanvasRef.current.toData() as unknown;
      if (!Array.isArray(rawData)) return 0;

      return rawData.reduce<number>((total, stroke) => {
        if (Array.isArray(stroke)) {
          return total + stroke.length;
        }
        const strokeObj = stroke as StrokeGroup;
        if (strokeObj && Array.isArray(strokeObj.points)) {
          return total + strokeObj.points.length;
        }
        return total + 1;
      }, 0);
    }, []);

    const updateUndoRedoState = useCallback(() => {
      if (!sigCanvasRef.current) {
        setCanUndo(false);
        setCanRedo(false);
        return;
      }
      const rawData = sigCanvasRef.current.toData() as unknown;
      const strokeCount = Array.isArray(rawData) ? rawData.length : 0;
      setCanUndo(strokeCount > 0);
      setCanRedo(redoStackRef.current.length > 0);
    }, []);

    useImperativeHandle(ref, () => ({
      clear: () => {
        sigCanvasRef.current?.clear();
        redoStackRef.current = [];
        setHasSignature(false);
        setIsEditing(false);
        updateUndoRedoState();
        onChange?.(null);
      },
      toDataURL: (type = "image/png") => getTrimmedDataUrl(type),
      isEmpty: () => {
        if (!sigCanvasRef.current) return true;
        if (sigCanvasRef.current.isEmpty()) return true;
        return countTotalPoints() < MIN_POINTS_THRESHOLD;
      },
      fromDataURL: (dataURL: string) => {
        sigCanvasRef.current?.fromDataURL(dataURL);
        setHasSignature(Boolean(dataURL));
        redoStackRef.current = [];
        updateUndoRedoState();
      },
    }));

    const resizeCanvas = useCallback(() => {
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
        updateUndoRedoState();
      }
    }, [updateUndoRedoState]);

    useLayoutEffect(() => {
      const timeout = setTimeout(resizeCanvas, 150);
      window.addEventListener("resize", resizeCanvas);

      if (initialValue && sigCanvasRef.current) {
        sigCanvasRef.current.fromDataURL(initialValue);
        setHasSignature(true);
        updateUndoRedoState();
      }

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        clearTimeout(timeout);
      };
    }, [initialValue, resizeCanvas, updateUndoRedoState]);

    const handleEnd = () => {
      if (!sigCanvasRef.current) return;

      const totalPoints = countTotalPoints();
      if (totalPoints < MIN_POINTS_THRESHOLD) {
        sigCanvasRef.current.clear();
        setHasSignature(false);
        redoStackRef.current = [];
        updateUndoRedoState();
        onChange?.(null);
        return;
      }

      redoStackRef.current = [];
      updateUndoRedoState();

      const trimmed = getTrimmedDataUrl();
      setHasSignature(true);
      onChange?.(trimmed);
    };

    const handleUndo = () => {
      if (!sigCanvasRef.current) return;
      const rawData = sigCanvasRef.current.toData() as unknown;
      if (!Array.isArray(rawData) || rawData.length === 0) return;

      const lastStroke = rawData[rawData.length - 1];
      const remainingStrokes = rawData.slice(0, -1);

      redoStackRef.current.push(lastStroke);
      sigCanvasRef.current.fromData(remainingStrokes as Parameters<SignatureCanvas["fromData"]>[0]);

      updateUndoRedoState();

      if (remainingStrokes.length === 0) {
        setHasSignature(false);
        onChange?.(null);
      } else {
        onChange?.(getTrimmedDataUrl());
      }
    };

    const handleRedo = () => {
      if (!sigCanvasRef.current || redoStackRef.current.length === 0) return;
      const strokeToRestore = redoStackRef.current.pop();
      if (!strokeToRestore) return;

      const rawData = (sigCanvasRef.current.toData() as unknown) || [];
      const currentStrokes = Array.isArray(rawData) ? rawData : [];
      const newStrokes = [...currentStrokes, strokeToRestore];

      sigCanvasRef.current.fromData(newStrokes as Parameters<SignatureCanvas["fromData"]>[0]);
      updateUndoRedoState();

      setHasSignature(true);
      onChange?.(getTrimmedDataUrl());
    };

    const handleClear = () => {
      sigCanvasRef.current?.clear();
      redoStackRef.current = [];
      setHasSignature(false);
      updateUndoRedoState();
      onChange?.(null);
    };

    const handleStartEditing = () => {
      setIsEditing(true);
      setTimeout(updateUndoRedoState, 50);
    };

    const handleFinishEditing = () => {
      const totalPoints = countTotalPoints();
      if (totalPoints < MIN_POINTS_THRESHOLD) {
        handleClear();
      }
      setIsEditing(false);
    };

    return (
      <div className={cn("space-y-2.5", className)}>
        <div
          ref={containerRef}
          style={{ cursor: isEditing ? SIGNATURE_CURSOR : hasSignature ? "pointer" : "default" }}
          className={cn(
            "relative w-full h-48 sm:h-56 rounded-[22px] overflow-hidden select-none transition-all",
            isEditing
              ? "bg-white border-2 border-[#2563eb] shadow-xs ring-2 ring-[#2563eb]/10"
              : "bg-[#fafafa] border border-[#e5e5e5]"
          )}
        >
          <div className="absolute inset-x-5 sm:inset-x-8 bottom-3 sm:bottom-4 pointer-events-none flex flex-col gap-1 z-0">
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
              className: cn(
                "w-full h-full relative z-10 transition-opacity",
                hasSignature && !isEditing && "opacity-85",
                !isEditing && "pointer-events-none"
              ),
              style: {
                cursor: isEditing ? SIGNATURE_CURSOR : hasSignature ? "pointer" : "default",
                touchAction: isEditing ? "none" : "auto",
              },
            }}
            backgroundColor="transparent"
          />

          {hasSignature && !isEditing && (
            <>
              <div className="absolute top-3 right-3 pointer-events-none z-20">
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-[18px] border bg-emerald-500/10 backdrop-blur-xs text-emerald-700 border-emerald-500/20 shadow-2xs flex items-center gap-1">
                  <span>Assinado</span>
                  <Check className="w-3 h-3 text-emerald-600" />
                </span>
              </div>
              <div
                onClick={handleStartEditing}
                className="absolute inset-0 z-10 cursor-pointer touch-pan-y bg-white/20 backdrop-blur-[0.5px] transition-all hover:bg-white/10"
                title="Toque para editar"
              />
            </>
          )}

          {!isEditing && !hasSignature && (
            <div
              onClick={handleStartEditing}
              className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all hover:bg-white/40 touch-pan-y"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 text-[#2563eb] flex items-center justify-center shadow-2xs">
                  <PenLine className="w-4 h-4" />
                </div>
                <Button
                  type="button"
                  variant="tonal"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEditing();
                  }}
                  className=""
                >
                  Toque para assinar
                </Button>
              </div>
            </div>
          )}
        </div>

        {showClearButton && (
          <div className="flex items-center justify-between pt-0.5 min-h-[36px]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={!isEditing || !canUndo}
                title="Desfazer traço"
                className={cn(
                  "w-8 h-8 rounded-[14px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a] transition-all",
                  isEditing && canUndo
                    ? "hover:bg-[#e5e5e5] active:scale-95 cursor-pointer"
                    : "opacity-35 cursor-not-allowed pointer-events-none text-[#a3a3a3]"
                )}
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={!isEditing || !canRedo}
                title="Refazer traço"
                className={cn(
                  "w-8 h-8 rounded-[14px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a] transition-all",
                  isEditing && canRedo
                    ? "hover:bg-[#e5e5e5] active:scale-95 cursor-pointer"
                    : "opacity-35 cursor-not-allowed pointer-events-none text-[#a3a3a3]"
                )}
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-[1px] bg-[#e5e5e5] mx-0.5" />

              <button
                type="button"
                onClick={handleClear}
                disabled={!isEditing}
                className={cn(
                  "h-8 px-2.5 rounded-[14px] bg-[#f5f5f5] border border-[#e5e5e5] text-xs font-medium text-[#737373] flex items-center gap-1 transition-all",
                  isEditing
                    ? "hover:text-[#e7000b] hover:bg-red-50 cursor-pointer active:scale-95"
                    : "opacity-35 cursor-not-allowed pointer-events-none text-[#a3a3a3]"
                )}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar</span>
              </button>
            </div>

            {isEditing ? (
              <button
                type="button"
                onClick={handleFinishEditing}
                className="h-8 px-3.5 rounded-[16px] bg-[#2563eb]/10 hover:bg-[#2563eb] text-[#2563eb] hover:text-white border border-[#2563eb]/20 text-xs font-semibold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Pronto</span>
              </button>
            ) : hasSignature ? (
              <button
                type="button"
                onClick={handleStartEditing}
                className="h-8 px-3.5 rounded-[14px] bg-[#f5f5f5] hover:bg-[#ebebeb] border border-[#e5e5e5] text-xs font-medium text-[#0a0a0a] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#737373]" />
                <span>Editar</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="h-8 px-3.5 rounded-[16px] bg-[#f5f5f5] text-[#a3a3a3] border border-[#e5e5e5] text-xs font-medium flex items-center gap-1.5 opacity-35 cursor-not-allowed pointer-events-none"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Pronto</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";

export { SignaturePad };
