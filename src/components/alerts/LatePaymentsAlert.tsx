import { Button } from "@/components/ui/button";
import BaseAlert from "@/components/alerts/BaseAlert";
import { Cobranca } from "@/types/cobranca";
import { meses } from "@/utils/formatters";
import { ArrowRight, InfoIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LatePaymentsAlertProps {
  latePayments: Cobranca[];
  mes: number;
  ano: number;
  compact?: boolean;
}

const LatePaymentsAlert = ({
  latePayments,
  mes,
  ano,
  compact = false,
}: LatePaymentsAlertProps) => {
  const navigate = useNavigate();
  const count = latePayments.length;

  if (count === 0) return null;

  return (
    <BaseAlert
      variant="warning"
      icon={InfoIcon}
      title="Cobranças Pendentes"
      description={
        <>
          {count} pendente{count > 1 ? "s" : ""} em {meses[mes - 1]}
        </>
      }
      actions={
        <Button
          size="sm"
          onClick={() => navigate(`/cobrancas?ano=${ano}&mes=${mes}`)}
        >
          {compact ? (
            "Ver"
          ) : (
            <>
              Ver Cobranças <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      }
    />
  );
};

export default LatePaymentsAlert;
