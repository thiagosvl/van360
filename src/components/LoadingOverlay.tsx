export function LoadingOverlay({
  active,
  text,
}: {
  active: boolean;
  text?: string;
}) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      <p className="text-white text-sm mb-3 font-medium">
        {text || "Carregando..."}
      </p>
      <div className="animate-spin rounded-full border-4 border-white/60 border-t-transparent w-8 h-8" />
    </div>
  );
}
