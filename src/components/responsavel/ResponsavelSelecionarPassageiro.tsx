import AppNavbarResponsavel from "@/components/responsavel/AppNavbarResponsavel"
import { useLocation, useNavigate } from "react-router-dom"

export default function ResponsavelSelecionarPassageiro() {
  const navigate = useNavigate()
  const location = useLocation()
  const passageiros = location.state?.passageiros || []

  const handleSelect = (p: any) => {
    localStorage.setItem("responsavel_id", p.id)
    localStorage.setItem("responsavel_usuario_id", p.usuario_id)
    navigate("/responsavel/carteirinha")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbarResponsavel nomePassageiro="Selecione o Passageiro" />
      <div className="p-4 space-y-4 max-w-4xl mx-auto w-full">
        <h2 className="text-lg font-semibold">Selecione o passageiro</h2>
        {passageiros.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum passageiro encontrado.
          </p>
        ) : (
          <div className="grid gap-3">
            {passageiros.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                className="p-3 border rounded-md text-left hover:bg-muted transition"
              >
                <div className="font-medium">{p.nome}</div>
                <div className="text-sm text-muted-foreground">
                  {p.escolas.nome || "Sem escola"}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
