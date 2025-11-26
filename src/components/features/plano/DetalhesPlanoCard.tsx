import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  PLANO_COMPLETO,
  PLANO_ESSENCIAL,
  PLANO_GRATUITO
} from "@/constants";

const formatCurrency = (value: string | number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
};

const DetalhesPlanoCard = ({ plano, assinatura }) => (
  <Card className="shadow-lg">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-700">
        Detalhes do Plano
      </CardTitle>
      <CardDescription>
        Informações sobre do plano atual.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3 mt-6 text-sm text-gray-700">
      <div className="flex justify-between items-center py-1">
        <span className="font-medium">Seu Plano:</span>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {plano?.parent ? plano?.parent.nome : plano?.nome}
        </Badge>
      </div>
      <Separator />

      <div className="flex justify-between items-center py-1">
        <span className="font-medium">Valor:</span>
        <span className="">
          {plano.slug === PLANO_GRATUITO
            ? "Grátis"
            : `${formatCurrency(assinatura?.preco_aplicado || "0.00")}/mês`}
        </span>
      </div>

      <div className="flex justify-between items-center py-1">
        <span className="font-medium ">Limite de Passageiros:</span>
        <span>
          {plano.slug === PLANO_GRATUITO ? (
            <>{plano.limite_passageiros}</>
          ) : plano.slug === PLANO_ESSENCIAL ? (
            <>Ilimitado</>
          ) : plano.slug === PLANO_COMPLETO ||
            (plano.parent && plano.parent.slug === PLANO_COMPLETO) ? (
            <>Ilimitado</>
          ) : null}
        </span>
      </div>

      <div className="flex justify-between items-center py-1">
        <span className="font-medium ">Cobranças Automáticas:</span>
        <span className="">
          {assinatura?.franquia_contratada_cobrancas || plano?.franquia_cobrancas_mes || "Seu plano não oferece"}
        </span>
      </div>
    </CardContent>
  </Card>
);
export default DetalhesPlanoCard;
