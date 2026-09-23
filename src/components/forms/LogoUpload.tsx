import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notifications/toast";
import { useLogoStorage } from "@/hooks/api/useLogoStorage";
import { Upload, Trash2, ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoUploadProps {
  userId: string;
  currentLogoUrl?: string | null;
  variant?: "contract" | "account";
  onLogoChange: (newLogoUrl: string | null) => Promise<void>;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({
  userId,
  currentLogoUrl,
  variant = "account",
  onLogoChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadLogo, isUploading, removeLogo, isRemoving } = useLogoStorage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isLoading = isUploading || isRemoving || isUpdating;
  const isContractVariant = variant === "contract";

  const processFile = async (file: File) => {
    try {
      setIsUpdating(true);
      const publicUrl = await uploadLogo({ userId, file });
      await onLogoChange(publicUrl);
      toast.success("Logotipo atualizado com sucesso.");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Erro ao fazer upload do logotipo.");
    } finally {
      setIsUpdating(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isLoading) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLoading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleRemove = async () => {
    if (!currentLogoUrl) return;

    try {
      setIsUpdating(true);
      await removeLogo(currentLogoUrl);
      await onLogoChange(null);
      toast.success("Logotipo removido com sucesso.");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Erro ao remover o logotipo.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isLoading}
      />

      {currentLogoUrl ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-3.5 shadow-2xs space-y-2.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isContractVariant ? "Cabeçalho do Contrato" : "Logotipo"}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
                className="h-7 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-1 rounded-lg transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                Alterar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isLoading}
                onClick={handleRemove}
                className="h-7 px-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1 rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remover
              </Button>
            </div>
          </div>

          {isContractVariant ? (
            <div className="relative p-2.5 sm:p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-3 overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center z-10">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              )}
              <div className="h-10 sm:h-12 w-20 sm:w-28 flex items-center justify-center shrink-0">
                <img
                  src={currentLogoUrl}
                  alt="Logotipo do transporte"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="border-l border-slate-200 pl-3.5 flex-1 min-w-0">
                <div className="text-right">
                  <p className="text-[9px] sm:text-[11px] font-black text-[#1a3a5c] leading-tight uppercase tracking-tight truncate">
                    CONTRATO DE PRESTAÇÃO DE
                  </p>
                  <p className="text-[9px] sm:text-[11px] font-black text-[#1a3a5c] leading-tight uppercase tracking-tight truncate">
                    SERVIÇO DE TRANSPORTE
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative p-2.5 sm:p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-center overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center z-10">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              )}
              <div className="h-24 sm:h-28 max-w-[280px] w-full flex items-center justify-center">
                <img
                  src={currentLogoUrl}
                  alt="Logotipo do transporte"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !isLoading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "rounded-2xl border-2 border-dashed transition-all p-3 sm:p-3.5 cursor-pointer group select-none relative overflow-hidden",
            isDragging
              ? "border-blue-500 bg-blue-50/60 shadow-xs"
              : "border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 active:scale-[0.99]"
          )}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center z-10">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="w-20 sm:w-24 h-11 sm:h-12 rounded-xl border border-dashed border-slate-300 bg-white group-hover:border-blue-400 flex flex-col items-center justify-center gap-0.5 shrink-0 transition-colors shadow-2xs">
              <ImagePlus className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 group-hover:text-blue-600 uppercase tracking-wider transition-colors">
                Seu Logo
              </span>
            </div>

            <div className="border-l border-slate-200 pl-3 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    {isContractVariant ? "Adicionar Logotipo" : "Adicionar logotipo"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {isContractVariant
                      ? "Apenas imagens PNG ou JPG"
                      : "Apenas imagens PNG ou JPG • Aplicado em recibos e contratos"}
                  </p>
                </div>
                <span className="hidden sm:inline-flex text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs shrink-0">
                  Selecionar
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
