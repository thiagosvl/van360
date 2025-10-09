import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cobranca } from "@/types/cobranca";
import { meses } from "@/utils/formatters";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LatePaymentsAlertProps {
  latePayments: Cobranca[];
  mes: number;
}

const LatePaymentsAlert = ({ latePayments, mes }: LatePaymentsAlertProps) => {
  const navigate = useNavigate();

  return (
    <Card className="mb-6 border-red-200 bg-red-50/50">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <CardTitle className="text-lg font-semibold text-gray-800">
            Mensalidades Pendentes
          </CardTitle>
        </div>
        <span className="text-sm font-semibold bg-red-100 text-red-800 px-3 py-1 rounded-full">
          {latePayments.length}
        </span>
      </CardHeader>

      <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-red-900">
          Há <span className="font-bold">{latePayments.length}</span>{" "}
          {latePayments.length === 1 ? "cobrança" : "cobranças"} referentes a {meses[mes - 1]}.
        </p>
        <Button
          onClick={() => navigate("/mensalidades")}
          className="w-full sm:w-auto"
        >
          Ver Pendências <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default LatePaymentsAlert;
