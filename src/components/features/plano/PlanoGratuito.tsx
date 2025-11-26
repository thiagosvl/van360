import DetalhesPlanoCard from "@/components/features/plano/DetalhesPlanoCard";
import FaturamentoCard from "@/components/features/plano/FaturamentoCard";
import GerenciarOpcoesCard from "@/components/features/plano/GerenciarOpcoesCard";
import ProgressBar from "@/components/features/plano/ProgressBar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLANO_COMPLETO } from "@/constants";
import { Receipt } from "lucide-react";

const AlertCard = ({ icone: Icon, titulo, descricao, cor, acao }) => {
  const colorClasses = { primary: "bg-gray-100 border-gray-700 text-gray" };
  const buttonClasses = { primary: "bg-primary hover:bg-blue-600" };

  return (
    <Card className={`border-l-4 ${colorClasses[cor]} shadow-xl md:p-2`}>
      <CardHeader className="flex flex-row items-center gap-4 p-4 md:p-6">
        <Icon className="w-8 h-8 flex-shrink-0" />
        <div className="flex-grow">
          <CardTitle className={`text-xl font-bold`}>{titulo}</CardTitle>
          <CardDescription className="text-sm mt-2">
            {descricao}
          </CardDescription>
        </div>
      </CardHeader>
      {acao && (
        <CardContent className="pt-0 pb-4 px-4 md:px-6">
          <Button
            className={`w-full mt-3 font-semibold shadow-md ${buttonClasses[cor]}`}
            onClick={acao.onClick}
          >
            {acao.texto}
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

const PlanoGratuito = ({ navigate, data }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Coluna Principal (Status e Faturamento) */}
    <div className="lg:col-span-2 space-y-4">
      <AlertCard
        icone={Receipt}
        titulo={`Plano ${data.plano.nome}`}
        descricao="Escolha um plano e tenha acesso a passageiros ilimitados, cobranças automáticas e muito mais!"
        cor="primary"
        acao={{
          texto: "Quero mais funcionalidades",
          onClick: () => navigate("/planos"),
        }}
      />
      <FaturamentoCard
        plano={data.plano}
        cobrancas={data.cobrancas}
        navigate={navigate}
      />
      <DetalhesPlanoCard plano={data.plano} assinatura={data.assinatura} />
    </div>

    {/* Coluna Lateral (Métricas e Gestão) */}
    <div className="lg:col-span-1 space-y-6">
      <Card className="shadow-lg p-6 space-y-4">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Cobranças Automáticas
        </CardTitle>
        <p className="text-sm text-gray-500">
          Seu plano não oferece. <br />
          <br />
          Contrate o <b>Plano Completo</b> agora para utilizar as cobranças
          automáticas.
        </p>
        <Button
          variant="default"
          className="w-full bg-primary hover:bg-blue-700"
          onClick={() => navigate(`/planos?slug=${PLANO_COMPLETO}`)}
          title="Planos"
        >
          Quero Cobranças Automáticas
        </Button>
      </Card>

      <Card className="shadow-lg p-6 space-y-4">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Passageiros
        </CardTitle>
        <ProgressBar
          label="Quantidade"
          current={data.passageirosAtivos}
          max={data.limitePassageiros}
          primaryColor="primary"
        />
        <div className="">
          <span className="text-sm text-muted-foreground">
            Gostaria de passageiros ilimitados?
            <br />
            Assine um plano agora!
          </span>
        </div>
        <Button
          variant="default"
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate("/planos")}
          title="Planos"
        >
          Quero Passageiros Ilimitados
        </Button>
      </Card>

      <GerenciarOpcoesCard
        plano={data.plano}
        assinatura={data.assinatura}
        navigate={navigate}
      />
    </div>
  </div>
);
export default PlanoGratuito;
