import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/utils/notifications/toast";
import { useLogoStorage } from "@/hooks/api/useLogoStorage";
import { usuarioApi } from "@/services/api/usuario.api";
import { cn } from "@/lib/utils";

export interface ProfileAvatarUploadRef {
  openFilePicker: () => void;
}

export interface ProfileAvatarUploadProps {
  userId?: string;
  logoUrl?: string | null;
  displayName: string;
  userInitials: string;
  isLoading?: boolean;
  canEdit?: boolean;
  onLogoUpdated?: () => Promise<void> | void;
  className?: string;
}

export const ProfileAvatarUpload = forwardRef<ProfileAvatarUploadRef, ProfileAvatarUploadProps>(
  function ProfileAvatarUpload(
    {
      userId,
      logoUrl,
      displayName,
      userInitials,
      isLoading = false,
      canEdit = false,
      onLogoUpdated,
      className,
    },
    ref
  ) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadLogo, isUploading } = useLogoStorage();
    const [isUpdating, setIsUpdating] = useState(false);

    const isBusy = isLoading || isUploading || isUpdating;

    const handleOpenPicker = () => {
      if (isBusy || !canEdit) return;
      fileInputRef.current?.click();
    };

    useImperativeHandle(ref, () => ({
      openFilePicker: handleOpenPicker,
    }));

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !userId) return;

      try {
        setIsUpdating(true);
        const publicUrl = await uploadLogo({ userId, file });
        await usuarioApi.atualizarUsuario(userId, { logo_url: publicUrl });
        await onLogoUpdated?.();
        toast.success("Logotipo atualizado com sucesso.");
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Erro ao atualizar logotipo.");
      } finally {
        setIsUpdating(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    if (isLoading) {
      return (
        <div className={cn("h-16 w-16 sm:h-18 sm:w-18 shrink-0", className)}>
          <Skeleton className="h-full w-full rounded-full" />
        </div>
      );
    }

    return (
      <div className={cn("relative shrink-0 select-none", className)}>
        {canEdit && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            disabled={isBusy}
            onChange={handleFileChange}
          />
        )}

        <button
          type="button"
          onClick={handleOpenPicker}
          disabled={!canEdit || isBusy}
          aria-label={logoUrl ? "Alterar logotipo da van" : "Adicionar logotipo da van"}
          title={canEdit ? (logoUrl ? "Clique para alterar o logotipo" : "Clique para adicionar o logotipo") : undefined}
          className={cn(
            "h-16 w-16 sm:h-18 sm:w-18 rounded-full border border-[#e5e5e5] text-[#0a0a0a] flex items-center justify-center font-semibold text-xl sm:text-2xl shadow-none overflow-hidden transition-all relative",
            logoUrl ? "bg-white" : "bg-[#f5f5f5]",
            canEdit && !isBusy && "cursor-pointer group hover:ring-2 hover:ring-[#0a0a0a]/10 hover:border-[#0a0a0a]/40 active:scale-95",
            (!canEdit || isBusy) && "cursor-default"
          )}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={displayName}
              className="h-full w-full object-cover rounded-full transition-opacity group-hover:opacity-90"
            />
          ) : canEdit ? (
            <div className="flex flex-col items-center justify-center leading-tight text-center select-none text-[#737373] group-hover:text-[#0a0a0a] transition-colors px-1">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-tight">Seu</span>
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-tight">Logo</span>
            </div>
          ) : (
            <span className="transition-opacity group-hover:opacity-80">{userInitials}</span>
          )}

          {isBusy && (
            <div className="absolute inset-0 bg-[#0a0a0a]/60 rounded-full flex items-center justify-center text-white z-10 backdrop-blur-[1px]">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          )}
        </button>

        {canEdit && !isBusy && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPicker();
            }}
            aria-label={logoUrl ? "Alterar logotipo da van" : "Adicionar logotipo da van"}
            title={logoUrl ? "Alterar logotipo" : "Adicionar logotipo"}
            className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 translate-y-[3px] h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center ring-2 ring-white shadow-xs hover:bg-primary-hover active:scale-90 transition-all cursor-pointer z-10"
          >
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
          </button>
        )}
      </div>
    );
  }
);
