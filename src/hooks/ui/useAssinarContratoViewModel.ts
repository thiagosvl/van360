import { 
    useGetPublicContract, 
    useSignContract 
} from "@/hooks/api/usePublicContract";
import { toast } from "@/utils/notifications/toast";
import { useCallback, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

interface UseAssinarContratoViewModelProps {
  token: string | undefined;
}

export function useAssinarContratoViewModel({ token }: UseAssinarContratoViewModelProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const {
    data: contrato,
    isLoading,
    isError,
  } = useGetPublicContract(token || "");

  const signMutation = useSignContract();

  const obterIP = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch {
      return "unknown";
    }
  }, []);

  const handleAssinar = useCallback(async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      toast.error("contrato.erro.assinaturaVazia");
      return;
    }

    if (!token) return;

    try {
      const assinaturaBase64 = sigCanvas.current.toDataURL();
      const ip = await obterIP();

      const metadados = {
        ip,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      await signMutation.mutateAsync({
        token,
        assinatura: assinaturaBase64,
        metadados,
      });

      toast.success("contrato.sucesso.assinado", {
        description: "contrato.sucesso.assinadoDescricao",
      });
      setModalAberto(false);
    } catch (error: any) {
      toast.error("contrato.erro.assinar");
    }
  }, [token, signMutation, obterIP]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  const clearSignature = useCallback(() => {
    sigCanvas.current?.clear();
  }, []);

  return {
    contrato,
    isLoading,
    isError,
    modalAberto,
    setModalAberto,
    numPages,
    sigCanvas,
    handleAssinar,
    onDocumentLoadSuccess,
    clearSignature,
    isSigning: signMutation.isPending,
  };
}
