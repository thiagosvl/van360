import { useState } from 'react';
import { useContratos, useCreateContrato, useCancelContrato, useDownloadContrato } from '@/hooks/api/useContratos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText, Download, X, Plus, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { usePassageiros } from '@/hooks/api/usePassageiros';

export default function Contratos() {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [passageiroSelecionado, setPassageiroSelecionado] = useState<string>('');
  
  const { data: contratos, isLoading } = useContratos();
  const { data: passageiros } = usePassageiros();
  const createMutation = useCreateContrato();
  const cancelMutation = useCancelContrato();
  const downloadMutation = useDownloadContrato();

  const handleCriarContrato = async () => {
    if (!passageiroSelecionado) {
      toast.error('Selecione um passageiro');
      return;
    }

    await createMutation.mutateAsync({
      passageiroId: passageiroSelecionado,
      provider: 'inhouse',
    });

    setDialogAberto(false);
    setPassageiroSelecionado('');
  };

  const handleCopiarLink = (token: string) => {
    const link = `${window.location.origin}/assinar/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pendente: 'default',
      assinado: 'success',
      cancelado: 'destructive',
      expirado: 'secondary',
    };

    const labels: Record<string, string> = {
      pendente: 'Pendente',
      assinado: 'Assinado',
      cancelado: 'Cancelado',
      expirado: 'Expirado',
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-muted-foreground">Gerencie os contratos de transporte dos seus passageiros</p>
        </div>

        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Contrato</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Passageiro</label>
                <Select value={passageiroSelecionado} onValueChange={setPassageiroSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um passageiro" />
                  </SelectTrigger>
                  <SelectContent>
                    {passageiros?.data?.map((passageiro: any) => (
                      <SelectItem key={passageiro.id} value={passageiro.id}>
                        {passageiro.nome} - {passageiro.nome_responsavel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCriarContrato} disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Contrato'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {contratos?.data?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum contrato encontrado</p>
              <p className="text-sm text-muted-foreground">Clique em "Novo Contrato" para começar</p>
            </CardContent>
          </Card>
        ) : (
          contratos?.data?.map((contrato: any) => (
            <Card key={contrato.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {contrato.dados_contrato.nomeAluno}
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
                  {contrato.status === 'pendente' && (
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

                  {contrato.status === 'assinado' && (
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
