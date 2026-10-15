import { InitialLoading } from "@/components/auth/InitialLoading";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePublicRenovacaoViewModel } from "@/hooks/ui/usePublicRenovacaoViewModel";
import {
  PublicRenovacaoHeader,
  PublicRenovacaoAlunoCard,
  PublicRenovacaoCondicoesCard,
  PublicRenovacaoEscolaCard,
  PublicRenovacaoBottomBar,
} from "@/components/features/renovacao/public";
import { FileSignature } from "lucide-react";

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

  const { motorista, passageiro, responsavel, condicoes, ano_destino } = data;

  return (
    <div
      className={cn(
        "min-h-screen bg-muted/40 py-6 sm:py-10 px-3.5 sm:px-6",
        hasPendingAction ? "pb-32 sm:pb-36" : "pb-10"
      )}
    >
      <div className="max-w-lg mx-auto space-y-4">
        <PublicRenovacaoHeader motorista={motorista} anoDestino={ano_destino} />

        <PublicRenovacaoAlunoCard
          passageiro={passageiro}
          responsavel={responsavel}
          condicoes={condicoes}
          enderecoFormatado={enderecoFormatado}
          canEdit={!isConfirmed && !isRecused}
          onEditarDados={handleOpenEditarDados}
        />

        {temCondicoesAlteradas && !isConfirmed && !isRecused && (
          <Banner
            variant="warning"
            title="Condições Atualizadas"
            description={`Os valores ou detalhes para ${ano_destino} foram atualizados. Por favor, confira as condições abaixo e confirme a sua resposta.`}
            className="rounded-[18px]"
          />
        )}

        <PublicRenovacaoCondicoesCard condicoes={condicoes} anoDestino={ano_destino} />

        <PublicRenovacaoEscolaCard condicoes={condicoes} />

        {isCicloConcluido ? (
          <Banner
            variant="neutral"
            title="Ciclo de Renovação Concluído"
            description={`As renovações para o ano letivo de ${ano_destino} foram finalizadas. Caso precise de alguma alteração, fale diretamente com o motorista.`}
            className="rounded-[18px]"
          />
        ) : isConfirmed ? (
          <div className="space-y-3">
            <Banner
              variant="success"
              title={`Vaga Confirmada para ${ano_destino}!`}
              description="Caso queira mudar de ideia ou alterar alguma informação, fale com o motorista para que ele realize a alteração."
              className="rounded-[18px]"
            />

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
            <Banner
              variant="neutral"
              title="Vaga Não Renovada"
              description={`Você informou que não utilizará o transporte em ${ano_destino}. Caso tenha mudado de ideia, fale com o motorista para que ele altere a situação da vaga.`}
              className="rounded-[18px]"
            />
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

        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Van360 • Plataforma de Gestão de Transporte Escolar
          </p>
        </div>
      </div>

      {hasPendingAction && (
        <PublicRenovacaoBottomBar
          isPendente={isPendente}
          isConfirmadoComContratoPendente={isConfirmadoComContratoPendente}
          confirmRecusaOpen={confirmRecusaOpen}
          isResponding={isResponding}
          temContratoDigital={temContratoDigital}
          anoDestino={ano_destino}
          nomePassageiro={passageiro.nome}
          activeContractToken={activeContractToken}
          onConfirmar={handleConfirmar}
          onRecusar={handleRecusar}
          onSetConfirmRecusaOpen={setConfirmRecusaOpen}
          onAssinarContrato={handleNavigateToContract}
        />
      )}
    </div>
  );
}
