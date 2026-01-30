import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLayout } from '@/contexts/LayoutContext';
import { useCancelContrato, useContratos, useDownloadContrato, usePreviewContrato } from '@/hooks/api/useContratos';
import { usePermissions } from '@/hooks/business/usePermissions';
import { ContratoStatus } from '@/types/enums';
import { toast } from '@/utils/notifications/toast';
import { Copy, Download, Eye, FileText, Loader2, Settings, X } from 'lucide-react';
import { useEffect } from 'react';

export default function Contratos() {
  const { openContractSetupDialog, setPageTitle } = useLayout();
  const { data: contratos, isLoading } = useContratos();
  const { summary, profile } = usePermissions();

  useEffect(() => {
    setPageTitle('Contratos');
  }, [setPageTitle]);

  const cancelMutation = useCancelContrato();
  const downloadMutation = useDownloadContrato();
  const previewMutation = usePreviewContrato();

  const isConfigurado = summary?.usuario.flags.contrato_configurado;
  const usaContratos = summary?.usuario.flags.usar_contratos;
  const podeVerModelo = isConfigurado && usaContratos;

  const handleCopiarLink = (token: string) => {
    const link = `${window.location.origin}/assinar/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('sucesso.copiado');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pendente: 'destructive',
      assinado: 'success',
      substituido: 'default',
    };

    const labels: Record<string, string> = {
      [ContratoStatus.PENDENTE]: 'Pendente',
      [ContratoStatus.ASSINADO]: 'Assinado',
      [ContratoStatus.SUBSTITUIDO]: 'Substituído',
    };

    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-muted-foreground">Gerencie os contratos de transporte dos seus passageiros</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            className="gap-2"
            disabled={!podeVerModelo || previewMutation.isPending}
            onClick={() => previewMutation.mutate({
              clausulas: profile?.config_contrato?.clausulas,
              multaAtraso: profile?.config_contrato?.multa_atraso,
              multaRescisao: profile?.config_contrato?.multa_rescisao
            })}
          >
            {previewMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Ver Modelo (PDF)</span>
          </Button>

          <Button 
            variant="outline"
            className="gap-2"
            onClick={openContractSetupDialog}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configurações</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {contratos?.data?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum contrato encontrado</p>
            </CardContent>
          </Card>
        ) : (
          contratos?.data?.map((contrato: any) => (
            <Card key={contrato.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {contrato.dados_contrato.nomePassageiro}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Responsável: {contrato.dados_contrato.nomeResponsavel}
                    </p>
                  </div>
                  {getStatusBadge(contrato.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <span className="font-medium">Valor mensal:</span> R$ {contrato.dados_contrato.valorMensal.toFixed(2)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Criado em:</span>{' '}
                    {new Date(contrato.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  {contrato.assinado_em && (
                    <p className="text-sm">
                      <span className="font-medium">Assinado em:</span>{' '}
                      {new Date(contrato.assinado_em).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {contrato.status === ContratoStatus.PENDENTE && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopiarLink(contrato.token_acesso)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar Link
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelMutation.mutate(contrato.id)}
                        disabled={cancelMutation.isPending}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    </>
                  )}

                  {contrato.status === ContratoStatus.ASSINADO && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadMutation.mutate(contrato.id)}
                      disabled={downloadMutation.isPending}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
