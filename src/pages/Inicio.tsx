import { Card, CardContent } from "@/components/ui/card";
import { useLayout } from "@/contexts/LayoutContext";
import { useEffect } from "react";

const Inicio = () => {
  const { setPageTitle, setPageSubtitle } = useLayout();
  
    useEffect(() => {
      setPageTitle("Tela Inicial");
      setPageSubtitle("");
    }, [setPageTitle, setPageSubtitle]);
  
  return (
    <div className="space-y-6">
      <div className="w-full">
        <Card className="mb-6">
          <CardContent className="mt-4">
            <p>
              Conteudo da tela inicial
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
);
};

export default Inicio;
