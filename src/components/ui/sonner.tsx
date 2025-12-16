import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

/**
 * Componente Toaster do Sonner
 * 
 * NOTA: Para usar toasts, importe de @/utils/notifications/toast
 * Este componente apenas renderiza o container de toasts
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 768px)").matches
      : false
  )

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)")
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)

    mql.addEventListener("change", onChange)
    setIsMobile(mql.matches)

    return () => mql.removeEventListener("change", onChange)
  }, [])

  const toastStyles = {
    classNames: {
      toast:
        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
      description: "group-[.toast]:text-muted-foreground",
      actionButton:
        "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
      cancelButton:
        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
    },
  }

  return (
    <Sonner
      key={isMobile ? "mobile" : "desktop"}
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={isMobile ? "bottom-center" : "top-right"}
      toastOptions={toastStyles}
      // Permitir arrastar para os lados para fechar, além de baixo/cima
      swipeDirections={['left', 'right', 'bottom', 'top']} 
      {...props}
    />
  )
}

export { Toaster }

