import { Skeleton } from "@/components/ui/skeleton";
import { useLayout } from "@/contexts/LayoutContext";
import { cn } from "@/lib/utils";

export interface ProfileAvatarUploadProps {
  logoUrl?: string | null;
  displayName: string;
  userInitials: string;
  isLoading?: boolean;
  className?: string;
}

export function ProfileAvatarUpload({
  logoUrl,
  displayName,
  userInitials,
  isLoading = false,
  className,
}: ProfileAvatarUploadProps) {
  const { openImageFullscreen } = useLayout();

  const handleAvatarClick = () => {
    if (isLoading || !logoUrl) return;
    openImageFullscreen({
      imageUrl: logoUrl,
      alt: displayName || "Logotipo",
    });
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
      <button
        type="button"
        onClick={handleAvatarClick}
        disabled={!logoUrl}
        aria-label={logoUrl ? "Visualizar logotipo da van" : displayName}
        title={logoUrl ? "Clique para visualizar em tela cheia" : undefined}
        className={cn(
          "h-16 w-16 sm:h-18 sm:w-18 rounded-full border border-[#e5e5e5] text-[#0a0a0a] flex items-center justify-center font-semibold text-xl sm:text-2xl shadow-none overflow-hidden transition-all relative",
          logoUrl
            ? "bg-white cursor-pointer group hover:ring-2 hover:ring-[#0a0a0a]/10 hover:border-[#0a0a0a]/40 active:scale-95"
            : "bg-[#f5f5f5] cursor-default"
        )}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={displayName}
            className="h-full w-full object-cover rounded-full transition-opacity group-hover:opacity-90"
          />
        ) : (
          <span>{userInitials}</span>
        )}
      </button>
    </div>
  );
}
