import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

// Configurar worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Contrato {
  id: string;
  status: string;
  minuta_url: string;
  dados_contrato: {
    nomeAluno: string;
    nomeResponsavel: string;
    valorMensal: number;
  };
}

export function AssinarContrato() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assinando, setAssinando] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    carregarContrato();
  }, [token]);

  const carregarContrato = async () => {
    try {
      const response = await api.get(`/contratos/publico/${token}`);
      setContrato(response.data);
      
      if (response.data.status !== 'pendente') {
        toast.error('Este contrato já foi assinado ou cancelado');
      }
    } catch (error: any) {
      console.error('Erro ao carregar contrato:', error);
      toast.error('Contrato não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const obterIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const handleAssinar = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      toast.error('Por favor, desenhe sua assinatura');
      return;
    }
    
    setAssinando(true);
    
    try {
      const assinaturaBase64 = sigCanvas.current.toDataURL();
      const ip = await obterIP();
      
      const metadados = {
        ip,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      await api.post(`/contratos/publico/${token}/assinar`, {
        assinatura: assinaturaBase64,
        metadados,
      });

      toast.success('Contrato assinado com sucesso! Você receberá o documento via WhatsApp.');
      setModalAberto(false);
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao assinar:', error);
      toast.error('Erro ao assinar contrato. Tente novamente.');
    } finally {
      setAssinando(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Contrato não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              O contrato que você está tentando acessar não existe ou expirou.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Contrato de Transporte Escolar</CardTitle>
          <p className="text-sm text-muted-foreground">
            Aluno: {contrato.dados_contrato.nomeAluno} | Responsável: {contrato.dados_contrato.nomeResponsavel}
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="border rounded-lg overflow-hidden mb-6">
            <Document
              file={contrato.minuta_url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              }
            >
              {Array.from(new Array(numPages), (_, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={Math.min(window.innerWidth - 100, 800)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              ))}
            </Document>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => window.open(contrato.minuta_url, '_blank')}
            >
              Baixar Contrato
            </Button>
            
            <Button
              onClick={() => setModalAberto(true)}
              disabled={contrato.status !== 'pendente'}
              className="flex-1"
            >
              {contrato.status === 'pendente' ? 'Assinar Documento' : 'Contrato já assinado'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assinatura Digital</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <SignatureCanvas
                ref={sigCanvas}
                canvasProps={{
                  width: 400,
                  height: 200,
                  className: 'w-full h-full bg-white'
                }}
              />
            </div>

            <Button
              variant="outline"
              onClick={() => sigCanvas.current?.clear()}
              className="w-full"
            >
              Limpar assinatura
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalAberto(false)}
              disabled={assinando}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleAssinar}
              disabled={assinando}
            >
              {assinando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assinando...
                </>
              ) : (
                'Salvar e Enviar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
