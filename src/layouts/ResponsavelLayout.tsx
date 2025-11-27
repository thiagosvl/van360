import ResponsavelSelecionarPassageiro from "@/components/responsavel/ResponsavelSelecionarPassageiro"
import ResponsavelCarteirinha from "@/pages/responsavel/ResponsavelCarteirinha"
import { Navigate, Route, Routes } from "react-router-dom"
import { useSEO } from "@/hooks/useSEO"

export default function ResponsavelLayout() {
  // Bloquear indexação de todas as páginas de responsável (área logada)
  useSEO({
    noindex: true,
  });
  return (
    <Routes>
      <Route path="carteirinha" element={<ResponsavelCarteirinha />} />
      <Route path="selecionar" element={<ResponsavelSelecionarPassageiro />} />
      <Route path="*" element={<Navigate to="carteirinha" replace />} />
    </Routes>
  )
}
