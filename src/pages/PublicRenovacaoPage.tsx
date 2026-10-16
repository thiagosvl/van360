import { InitialLoading } from "@/components/auth/InitialLoading";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePublicRenovacaoViewModel } from "@/hooks/ui/usePublicRenovacaoViewModel";
import {
  PublicRenovacaoHeader,
  PublicRenovacaoAlunoCard,
  PublicRenovacaoEscolaCard,
  PublicRenovacaoEmbarqueCard,
  PublicRenovacaoBottomBar,
} from "@/components/features/renovacao/public";
import { FileSignature, RefreshCw } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";
import { formatFirstName, formatShortName } from "@/utils/formatters";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default function PublicRenovacaoPage() {
  const {
    data,
    isLoading,
    error,
    isResponding,
    confirmRecusaOpen,
    setConfirmRecusaOpen,
    isCicloConcluido,
    isConfirmed,
    isRecused,
    isContratoAssinado,
    activeContractToken,
    signedContractToken,
    temContratoDigital,
    isPendente,
    isConfirmadoComContratoPendente,
    hasPendingAction,
    temCondicoesAlteradas,
    enderecoFormatado,
    handleConfirmar,
    handleRecusar,
    handleNavigateToContract,
    handleOpenEditarDados,
  } = usePublicRenovacaoViewModel();

  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();

  if (isLoading) {
    return <InitialLoading message="Carregando renovação..." />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Banner
            variant="danger"
            title="Proposta Não Encontrada"
            description="Este link de renovação pode ter expirado ou não existe. Entre em contato diretamente com o responsável pelo transporte escolar."
            className="rounded-[18px]"
          />
        </div>
      </div>
    );
  }

  const handleConfirmarComConfirmacao = () => {
    if (!data) return;
    const nomeAluno = data.passageiro.nome;
    const ano = data.ano_destino;

    openConfirmationDialog({
      title: `Confirmar vaga de ${formatFirstName(nomeAluno)}?`,
      description: (
        <div className="space-y-3">
          <p>
            Você confirma a renovação da vaga de <strong>{formatShortName(nomeAluno, true)}</strong> para o transporte escolar em <strong>{ano}</strong>?
          </p>
          {temContratoDigital && (
            <Banner
              variant="info"
              title="Contrato Digital"
              description="Ao confirmar, você será direcionado para assinar o contrato digital do novo ano letivo."
              className="rounded-[18px]"
            />
          )}
        </div>
      ),
      confirmText: temContratoDigital ? "Confirmar e Assinar" : "Confirmar Vaga",
      cancelText: "Voltar",
      variant: "success",
      onConfirm: async () => {
        try {
          await handleConfirmar();
        } finally {
          safeCloseDialog(closeConfirmationDialog);
        }
      },
      onCancel: () => {
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const handleRecusarComConfirmacao = () => {
    if (!data) return;
    const nomeAluno = data.passageiro.nome;
    const ano = data.ano_destino;

    openConfirmationDialog({
      title: `Informar saída de ${formatFirstName(nomeAluno)}?`,
      description: (
        <div className="space-y-3">
          <p>
            Tem certeza que não deseja renovar a vaga de <strong>{formatShortName(nomeAluno, true)}</strong> para o ano letivo de <strong>{ano}</strong>?
          </p>
          <Banner
            variant="warning"
            title="Liberação de Vaga"
            description="Ao confirmar a saída, a vaga será disponibilizada para outros alunos."
            className="rounded-[18px]"
          />
        </div>
      ),
      confirmText: "Confirmar Saída",
      cancelText: "Voltar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await handleRecusar();
        } finally {
          safeCloseDialog(closeConfirmationDialog);
        }
      },
      onCancel: () => {
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const { motorista, passageiro, responsavel, condicoes, ano_destino } = data;

  const renderStatusBanner = () => {
    if (isCicloConcluido) {
      return (
        <Banner
          variant="neutral"
          title="Ciclo de Renovação Concluído"
          description={`As renovações para o ano letivo de ${ano_destino} foram finalizadas. Caso precise de alguma alteração, fale diretamente com o motorista.`}
          className="rounded-[18px]"
        />
      );
    }

    if (isConfirmed) {
      return (
        <Banner
          variant="success"
          title={`Vaga Confirmada para ${ano_destino}!`}
          description="Caso queira mudar de ideia ou alterar alguma informação, fale com o motorista para que ele realize a alteração."
          className="rounded-[18px]"
        />
      );
    }

    if (isRecused) {
      return (
        <Banner
          variant="warning"
          title="Vaga Não Renovada"
          description={`Você informou que não utilizará o transporte em ${ano_destino}. Caso tenha mudado de ideia, fale com o motorista para que ele altere a situação da vaga.`}
          className="rounded-[18px]"
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col font-sans">
      <PublicHeader
        title={`Renovação ${ano_destino}`}
        subtitle={motorista.apelido || motorista.nome}
        icon={RefreshCw}
        containerClassName="max-w-lg px-3.5 sm:px-6"
      />

      <main
        className={cn(
          "flex-1 py-6 sm:py-10 px-3.5 sm:px-6",
          hasPendingAction ? "pb-32 sm:pb-36" : "pb-10"
        )}
      >
        <div className="max-w-lg mx-auto space-y-4">
          <PublicRenovacaoHeader motorista={motorista} anoDestino={ano_destino} />

          {renderStatusBanner()}

          {temCondicoesAlteradas && !isConfirmed && !isRecused && (
            <Banner
              variant="warning"
              title="Condições Atualizadas"
              description={`Os valores ou detalhes para ${ano_destino} foram atualizados. Por favor, confira as condições abaixo e confirme a sua resposta.`}
              className="rounded-[18px]"
            />
          )}

          <PublicRenovacaoAlunoCard
            passageiro={passageiro}
            responsavel={responsavel}
            condicoes={condicoes}
            anoDestino={ano_destino}
            canEdit={!isConfirmed && !isRecused}
            onEditarDados={handleOpenEditarDados}
          />

          <PublicRenovacaoEscolaCard
            condicoes={condicoes}
            passageiro={passageiro}
          />

          <PublicRenovacaoEmbarqueCard
            passageiro={passageiro}
            responsavel={responsavel}
            enderecoFormatado={enderecoFormatado}
          />

          {isConfirmed ? (
            <div className="space-y-3">
              {renderStatusBanner()}

              {isContratoAssinado && (
                <div className="space-y-3 pt-1">
                  <Banner
                    variant="neutral"
                    title="Contrato Digital Assinado"
                    description={`O contrato para o ano letivo de ${ano_destino} já foi formalizado e assinado digitalmente.`}
                    className="rounded-[18px]"
                  />
                  {signedContractToken && (
                    <Button
                      variant="outline"
                      onClick={() => handleNavigateToContract(signedContractToken)}
                      className="w-full h-11 rounded-[18px] border border-border bg-white hover:bg-muted/40 text-foreground font-medium text-xs sm:text-sm gap-2 shadow-none cursor-pointer"
                    >
                      <FileSignature className="w-4 h-4 text-primary" />
                      <span>Visualizar Contrato Assinado</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : isRecused ? (
            <div className="space-y-3">
              {renderStatusBanner()}
            </div>
          ) : isCicloConcluido ? (
            <div className="space-y-3">
              {renderStatusBanner()}
            </div>
          ) : (
            confirmRecusaOpen && (
              <Banner
                variant="warning"
                title="Confirmação de Saída"
                description="Ao confirmar a saída, a vaga será disponibilizada para outros alunos."
                className="rounded-[18px]"
              />
            )
          )}
        </div>
      </main>

      {hasPendingAction && (
        <PublicRenovacaoBottomBar
          isPendente={isPendente}
          isConfirmadoComContratoPendente={isConfirmadoComContratoPendente}
          isResponding={isResponding}
          temContratoDigital={temContratoDigital}
          anoDestino={ano_destino}
          activeContractToken={activeContractToken}
          onConfirmar={handleConfirmarComConfirmacao}
          onRecusar={handleRecusarComConfirmacao}
          onAssinarContrato={handleNavigateToContract}
        />
      )}
    </div>
  );
}
