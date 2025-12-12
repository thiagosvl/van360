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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-100">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Ops! Algo deu errado
            </h1>
            
            <p className="text-gray-500 mb-6">
              Desculpe, encontramos um erro inesperado. Tente recarregar a página para continuar.
            </p>

            <div className="bg-gray-50 p-3 rounded-lg text-left mb-6 overflow-hidden">
               <p className="text-xs text-gray-400 font-mono truncate">
                 {this.state.error?.message}
               </p>
            </div>

            <Button 
              className="w-full gap-2"
              onClick={() => window.location.reload()}
            >
              <RotateCcw className="w-4 h-4" />
              Recarregar Aplicação
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
