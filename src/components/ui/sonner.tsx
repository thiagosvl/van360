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

  return (
    <Sonner
      key={isMobile ? "mobile" : "desktop"}
      theme="light"
      className="toaster group !z-[99999]"
      position={isMobile ? "top-center" : "top-right"}
      richColors
      closeButton
      swipeDirections={['left', 'right', 'bottom', 'top']}
      toastOptions={{
        classNames: {
          toast: "font-sans rounded-2xl shadow-lg border p-4 text-sm font-medium",
          description: "text-xs opacity-90 font-normal mt-0.5",
          actionButton: "font-semibold text-xs rounded-lg px-3 py-1.5",
          cancelButton: "text-xs rounded-lg px-3 py-1.5",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

