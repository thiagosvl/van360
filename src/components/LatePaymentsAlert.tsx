import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cobranca } from "@/types/cobranca";
import { meses } from "@/utils/formatters";
import { ArrowRight, InfoIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LatePaymentsAlertProps {
  latePayments: Cobranca[];
  mes: number;
  ano: number;
}

const LatePaymentsAlert = ({
  latePayments,
  mes,
  ano,
}: LatePaymentsAlertProps) => {
  const navigate = useNavigate();

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <InfoIcon className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg font-semibold text-gray-800">
            Mensalidades Pendentes
          </CardTitle>
        </div>
        <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
          {latePayments.length}
        </span>
      </CardHeader>

      <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-blue-900">
          {latePayments.length === 1 ? (
            <>
              Você tem <span className="font-bold">1</span> cobrança a receber
              referente ao mês de {meses[mes - 1]}.
            </>
          ) : (
            <>
              Você tem <span className="font-bold">{latePayments.length}</span>{" "}
              cobranças a receber referentes ao mês de {meses[mes - 1]}.
            </>
          )}
        </p>
        <Button
          onClick={() => navigate(`/mensalidades?ano=${ano}&mes=${mes}`)}
          className="w-full sm:w-auto"
        >
          Ver Mensalidades <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default LatePaymentsAlert;
