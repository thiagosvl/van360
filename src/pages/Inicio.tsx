import { Card, CardContent } from "@/components/ui/card";
import { useLayout } from "@/contexts/LayoutContext";
import { PullToRefreshWrapper } from "@/hooks/PullToRefreshWrapper";
import { useEffect } from "react";

const Inicio = () => {
  const { setPageTitle, setPageSubtitle } = useLayout();

  useEffect(() => {
    setPageTitle("Tela Inicial");
    setPageSubtitle("");
  }, [setPageTitle, setPageSubtitle]);

  const pullToRefreshReload = async () => {
    console.log("Atualizando dados...");
  };

  return (
    <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
      <div className="space-y-6">
        <div className="w-full">
          <Card className="mb-6">
            <CardContent className="mt-4">
              <p>Conteudo da tela inicial</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PullToRefreshWrapper>
  );
};

export default Inicio;
