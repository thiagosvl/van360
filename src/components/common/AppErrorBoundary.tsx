import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] px-4 text-center">
          <div className="bg-white p-6 sm:p-8 rounded-[24px] shadow-xs max-w-md w-full border border-[#e5e5e5]">
            <div className="mx-auto w-14 h-14 bg-[#e7000b]/10 rounded-full flex items-center justify-center mb-5">
              <AlertTriangle className="h-7 w-7 text-[#e7000b]" />
            </div>

            <h1 className="text-xl sm:text-2xl font-semibold text-[#0a0a0a] mb-2 tracking-tight">
              Ops! Algo deu errado
            </h1>

            <p className="text-[#737373] text-sm mb-6 leading-relaxed">
              Desculpe, encontramos um erro inesperado. Tente recarregar a página para continuar.
            </p>

            <div className="bg-[#f5f5f5] p-3 rounded-[14px] border border-[#e5e5e5] text-left mb-6 overflow-hidden">
              <p className="text-xs text-[#737373] font-mono truncate">
                {this.state.error?.message}
              </p>
            </div>

            <Button
              className="w-full gap-2 rounded-[18px] bg-primary hover:bg-primary-hover text-white font-semibold h-11"
              onClick={() => window.location.reload()}
            >
              <RotateCcw className="w-4 h-4" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
