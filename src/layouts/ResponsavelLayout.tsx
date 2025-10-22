import ResponsavelSelecionarPassageiro from "@/components/responsavel/ResponsavelSelecionarPassageiro"
import ResponsavelCarteirinha from "@/pages/responsavel/ResponsavelCarteirinha"
import { Navigate, Route, Routes } from "react-router-dom"

export default function ResponsavelLayout() {
  return (
    <Routes>
      <Route path="carteirinha" element={<ResponsavelCarteirinha />} />
      <Route path="selecionar" element={<ResponsavelSelecionarPassageiro />} />
      <Route path="*" element={<Navigate to="carteirinha" replace />} />
    </Routes>
  )
}
