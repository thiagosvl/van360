import { ROUTES } from "@/constants/routes"
import { Navigate } from "react-router-dom"

export default function ResponsavelGate({ children }: { children: React.ReactNode }) {
  const isLogged = localStorage.getItem("responsavel_is_logged")
  if (!isLogged) return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />
  return <>{children}</>
}
