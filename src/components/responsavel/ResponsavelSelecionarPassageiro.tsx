import AppNavbarResponsavel from "@/components/responsavel/AppNavbarResponsavel";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResponsavelSelecionarPassageiro() {
  const navigate = useNavigate();
  const location = useLocation();
  const passageiros = location.state?.passageiros || [];

  const handleSelect = (p: any) => {
    localStorage.setItem("responsavel_id", p.id);
    localStorage.setItem("responsavel_usuario_id", p.usuario_id);
    navigate(ROUTES.PRIVATE.RESPONSAVEL.HOME);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppNavbarResponsavel
        title={`${passageiros.length} passageiros encontrados`}
      />
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full flex-grow">
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Selecione o Passageiro
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Você está vinculado a mais de um cadastro. Por favor, escolha qual
            carteirinha deseja acessar.
          </p>
        </header>

        <div className="space-y-4">
          {passageiros.map((p) => (
            <Card key={p.id}>
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                className="w-full p-4 border rounded-xl text-left hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm active:shadow-md flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <div className="font-semibold text-lg text-gray-800">
                    {p.nome}
                  </div>
                  {passageiros[0].nome_responsavel !=
                    passageiros[1].nome_responsavel && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Responsavel: <b>{p.nome_responsavel}</b>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground mt-1">
                    Escola:{" "}
                    <b>
                      {p.escolas?.nome || p.escola || "Sem escola vinculada"}
                    </b>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-500 shrink-0 ml-3" />
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
