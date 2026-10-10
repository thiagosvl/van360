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
        <div className="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] p-3.5 sm:p-4 space-y-3 transition-all">
          <div className="relative py-4 sm:py-5 w-full rounded-[16px] bg-white border border-[#e5e5e5] flex items-center justify-center overflow-hidden shadow-2xs">
            {isLoading && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center z-10">
                <Loader2 className="w-5 h-5 animate-spin text-[#0a0a0a]" />
              </div>
            )}
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white border-2 border-[#e5e5e5] shadow-xs overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={currentLogoUrl}
                alt="Logotipo"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className="h-9 rounded-[14px] border-[#e5e5e5] hover:bg-white text-xs font-medium text-[#0a0a0a] gap-1.5 shadow-none cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#737373]" />
              <span>Alterar</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={handleRemove}
              className="h-9 rounded-[14px] border border-red-200 hover:border-red-300 bg-white hover:bg-red-50 text-xs font-medium text-[#e7000b] gap-1.5 shadow-none cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#e7000b]" />
              <span>Remover</span>
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isLoading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "rounded-[20px] border border-dashed transition-all p-4 sm:p-6 cursor-pointer group select-none relative overflow-hidden flex flex-col items-center justify-center text-center gap-2",
            isDragging
              ? "border-[#0a0a0a] bg-[#f5f5f5]"
              : "border-[#e5e5e5] hover:border-[#0a0a0a] bg-[#fafafa] hover:bg-[#f5f5f5] active:scale-[0.99]"
          )}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center z-10">
              <Loader2 className="w-5 h-5 animate-spin text-[#0a0a0a]" />
            </div>
          )}
          <div className="w-12 h-12 rounded-full border border-[#e5e5e5] bg-white group-hover:border-[#0a0a0a] flex items-center justify-center text-[#737373] group-hover:text-[#0a0a0a] transition-colors shadow-2xs">
            <ImagePlus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-[#0a0a0a]">
              Adicionar Logotipo
            </p>
            <p className="text-[11px] text-[#737373] mt-0.5">
              Apenas imagens PNG ou JPG (máx. 5MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
