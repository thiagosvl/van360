import GerenciarOpcoesCard from "@/components/features/plano/GerenciarOpcoesCard";
import ProgressBar from "@/components/features/plano/ProgressBar";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { PLANO_COMPLETO, PLANO_ESSENCIAL, PLANO_GRATUITO } from "@/constants";
import { canUseCobrancaAutomatica } from "@/utils/domain/plano/accessRules";

import { useLayout } from "@/contexts/LayoutContext";

interface AssinaturaSideColumnProps {
  plano: any;
  assinatura: any;
  data: any;
  navigate: (path: string) => void; // Keeping prop to avoid breaking parent, but unused
  handleAbandonCancelSubscriptionClick: () => void;
  handleCancelSubscriptionClick: () => void;
}

export function AssinaturaSideColumn({
  plano,
  assinatura,
  data,
  navigate,
  handleAbandonCancelSubscriptionClick,
  handleCancelSubscriptionClick,
}: AssinaturaSideColumnProps) {
  const { openPlanosDialog, openLimiteFranquiaDialog } = useLayout();
  const isFreePlan = plano?.slug === PLANO_GRATUITO;
  const isEssentialPlan = plano?.slug === PLANO_ESSENCIAL;
  const isCompletePlan = plano?.slug === PLANO_COMPLETO;
  const hasCobrancaAutomatica = canUseCobrancaAutomatica(plano);

  // Lógica de Passageiros Ilimitados
  // Essencial e Completo são ilimitados (exceto se Essencial não for trial/ativo, mas a regra geral é essa)
  const isPassageirosIlimitado = isEssentialPlan || isCompletePlan;
  
  // Limite de passageiros para exibição
  const limitePassageirosDisplay = isPassageirosIlimitado ? null : data.limitePassageiros;

  // Alerta de franquia (apenas para quem tem franquia contratada)
  const FRANQUIA_ALERT_PERCENT = 50;
  const usoFranquiaPercent =
    data.franquiaContratada > 0
      ? (data.cobrancasEmUso / data.franquiaContratada) * 100
      : 0;
  const isFranquiaAlert =
    usoFranquiaPercent < 100 && usoFranquiaPercent >= FRANQUIA_ALERT_PERCENT;

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Card de Cobranças Automáticas */}
      <Card className="shadow-lg p-6 space-y-4">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Cobranças Automáticas
        </CardTitle>

        {hasCobrancaAutomatica ? (
          <>
            <ProgressBar
              label="Passageiros com cobrança automática"
              current={data.cobrancasEmUso}
              max={data.franquiaContratada}
              primaryColor="blue"
            />
            {isFranquiaAlert && (
              <div className="pt-2">
                <p className="text-xs text-orange-600 font-semibold items-center gap-1">
                  <span>Recomendamos aumentar o seu limite.</span>
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Você pode aumentar o seu limite a qualquer momento.
            </p>
            <Button
              variant="default"
              className="w-full bg-primary hover:bg-blue-700"
              onClick={() => openLimiteFranquiaDialog({
                  title: "Aumentar Limite",
                  description: "Aumente seu limite de cobranças automáticas com o Plano Completo.",
              })}
              title="Planos"
            >
              Aumentar Meu Limite
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              Seu plano não oferece. <br />
              <br />
              Contrate o <b>Plano Completo</b> agora para utilizar as cobranças
              automáticas.
            </p>
            <Button
              variant="default"
              className="w-full bg-primary hover:bg-blue-700"
              onClick={() => openLimiteFranquiaDialog({
                  title: "Cobrança Automática",
                  description: "Automatize o envio de cobranças e reduza a inadimplência com o Plano Completo.",
                  hideLimitInfo: true,
              })}
              title="Planos"
            >
              Quero Cobranças Automáticas
            </Button>
          </>
        )}
      </Card>

      {/* Card de Passageiros */}
      <Card className="shadow-lg p-6 space-y-4">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Passageiros
        </CardTitle>
        <ProgressBar
          label={isPassageirosIlimitado ? "Qtd. de Passageiros" : "Quantidade"}
          current={data.passageirosAtivos}
          max={limitePassageirosDisplay}
          primaryColor={isPassageirosIlimitado ? "blue" : "primary"}
        />
        
        <div className="space-y-4">
          {isPassageirosIlimitado ? (
             <span className="text-sm text-muted-foreground">
               Seu plano oferece passageiros ilimitados.
             </span>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                Gostaria de passageiros ilimitados?
                <br />
                Assine um plano agora!
              </span>
              <Button
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => openPlanosDialog()}
                title="Planos"
              >
                Quero Passageiros Ilimitados
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Card de Gerenciamento */}
      <GerenciarOpcoesCard
        handleAbandonCancelSubscriptionClick={handleAbandonCancelSubscriptionClick}
        handleCancelSubscriptionClick={handleCancelSubscriptionClick}
        plano={plano}
        assinatura={assinatura}
        navigate={navigate}
      />
    </div>
  );
}
