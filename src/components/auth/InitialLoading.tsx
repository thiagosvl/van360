export const InitialLoading = ({ darkMode = false }: { darkMode?: boolean }) => {
  if (darkMode) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 text-slate-100">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div className="absolute inset-0 scale-125 bg-blue-500/10 rounded-full animate-pulse border border-blue-500/20" />
          <div className="absolute inset-0 bg-blue-500/5 rounded-full animate-ping animate-duration-[3s]" />
          <img
            src="/assets/logo-van360.webp"
            alt="Van360"
            className="w-32 h-32 relative z-10 brightness-0 invert drop-shadow-[0_10px_25px_rgba(255,255,255,0.3)] animate-in zoom-in-50 duration-700 object-contain"
          />
        </div>
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s] shadow-sm shadow-blue-500/50" />
            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s] shadow-sm shadow-blue-400/50" />
            <div className="w-2.5 h-2.5 bg-blue-300 rounded-full animate-bounce shadow-sm shadow-blue-300/50" />
          </div>
          <p className="text-xs font-headline font-black text-slate-400 tracking-[0.2em] uppercase animate-pulse">
            Carregando sua jornada
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <div className="absolute inset-0 scale-125 bg-primary/5 rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping animate-duration-[3s]" />
        <img
          src="/assets/logo-van360.webp"
          alt="Van360"
          className="w-32 h-32 relative z-10 drop-shadow-2xl animate-in zoom-in-50 duration-700 object-contain"
        />
      </div>
      <div className="mt-12 flex flex-col items-center gap-4">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        </div>
        <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
          Carregando sua jornada
        </p>
      </div>
    </div>
  );
};
