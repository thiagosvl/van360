export const InitialLoading = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
    <div className="relative w-40 h-40 flex items-center justify-center">
      <div className="absolute inset-0 scale-125 bg-primary/5 rounded-full animate-pulse" />
      <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping animate-duration-[3s]" />
      <img
        src="/assets/logo-van360.png"
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
