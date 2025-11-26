import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ASSINATURA_USUARIO_STATUS_TRIAL, PLANO_GRATUITO } from "@/constants";
import { LucideChevronRight } from "lucide-react";

const GerenciarOpcoesCard = ({
  navigate,
  plano,
  assinatura,
  handleCancelSubscriptionClick = () => {},
  handleAbandonCancelSubscriptionClick = () => {},
}) => {

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            Gerencie sua Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-6">
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto hover:bg-gray-50"
            onClick={() => navigate("/planos")}
            title="Planos"
          >
            <span className="font-medium text-gray-700">Trocar de Plano</span>
            <LucideChevronRight className="w-5 h-5 text-gray-400" />
          </Button>
          <Separator />
          {!assinatura.cancelamento_manual ? (
            <Button
              variant="ghost"
              onClick={handleCancelSubscriptionClick}
              disabled={
                plano.slug === PLANO_GRATUITO ||
                assinatura.status === ASSINATURA_USUARIO_STATUS_TRIAL
              }
              className="w-full justify-between p-4 h-auto hover:bg-red-50"
              title="Cancelar Assinatura"
            >
              <span className="font-medium text-red-600">
                Cancelar Assinatura
              </span>
              <LucideChevronRight className="w-5 h-5 text-red-400" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={handleAbandonCancelSubscriptionClick}
              title="Desistir do Cancelamento"
              className="w-full justify-between p-4 h-auto hover:bg-yellow-50"
            >
              <span className="font-medium text-yellow-600">
                Desistir do Cancelamento
              </span>
              <LucideChevronRight className="w-5 h-5 text-yellow-400" />
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  );
};
export default GerenciarOpcoesCard;
