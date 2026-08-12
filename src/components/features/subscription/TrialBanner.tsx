import { Banner } from "@/components/ui/Banner";

interface TrialBannerProps {
  daysLeft: number;
  onSubscribe?: () => void;
}

export const TrialBanner = ({ daysLeft, onSubscribe }: TrialBannerProps) => {
  return (
    <Banner
      variant="warning"
      title="Período de Teste Gratuito"
      description={
        <>
          {daysLeft > 0 ? (
            <>Você tem <span className="font-bold">{daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}</span> restante{daysLeft === 1 ? '' : 's'}.</>
          ) : (
            <>Hoje é o seu <span className="font-bold">último dia</span> de teste gratuito!</>
          )}
          {" "}Assine agora para manter seu acesso completo!
        </>
      }
      action={
        onSubscribe
          ? {
              label: "Ver Planos",
              onClick: onSubscribe,
            }
          : undefined
      }
      className="mb-6"
    />
  );
};
