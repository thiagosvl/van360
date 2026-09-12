import { Banner } from "@/components/ui/Banner";

interface TrialBannerProps {
  daysLeft: number;
  onSubscribe?: () => void;
}

export const TrialBanner = ({ daysLeft, onSubscribe }: TrialBannerProps) => {
  const isLastDay = daysLeft <= 0;
  const isSingleDay = daysLeft === 1;

  const title = isLastDay
    ? "Hoje é o seu último dia de teste gratuito"
    : "Está gostando do Van360?";

  const description = isLastDay ? (
    <>
      Mantenha seus alunos organizados e o controle de quem pagou em dia. Escolha seu plano para continuar.
    </>
  ) : (
    <>
      Você ainda tem{" "}
      <span className="font-bold">
        {isSingleDay ? "1 dia" : `${daysLeft} dias`}
      </span>{" "}
      gratuitos para cadastrar seus alunos e usar todas as funcionalidades do app.
    </>
  );

  return (
    <Banner
      variant="success"
      title={title}
      description={description}
      action={
        onSubscribe
          ? {
            label: isLastDay ? "Ver Planos" : "Saiba Mais",
            onClick: onSubscribe,
          }
          : undefined
      }
      className="mb-6"
    />
  );
};
