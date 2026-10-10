import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatePresence, motion } from "framer-motion"

interface BaseDialogProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
  lockClose?: boolean
  description?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full"
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full"
};

const BaseDialogRoot = ({
  children,
  open,
  onOpenChange,
  className,
  lockClose = false,
  description,
  maxWidth = "md"
}: BaseDialogProps) => {
  const maxWidthClass = maxWidthMap[maxWidth];

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val && lockClose) return;
        onOpenChange(val);
      }}
    >
      <DialogContent
        className={cn(
          "w-[calc(100%-1.25rem)] sm:w-full p-0 overflow-hidden bg-white rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col max-h-[calc(100dvh-var(--safe-area-top)-var(--safe-area-bottom)-3rem)] gap-0",
          maxWidthClass,
          className
        )}
        onPointerDownOutside={(e) => lockClose && e.preventDefault()}
        onEscapeKeyDown={(e) => lockClose && e.preventDefault()}
        hideCloseButton // We'll handle our own close button in the header
      >
        <div className="sr-only">
          <DialogPrimitive.Title>
            Modal
          </DialogPrimitive.Title>
          <DialogPrimitive.Description>
            {description || "Dialog content"}
          </DialogPrimitive.Description>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  )
}

interface BaseDialogHeaderProps {
  title: string
  subtitle?: string
  subtitleClassName?: string
  icon?: React.ReactNode
  currentStep?: number
  totalSteps?: number
  hideCloseButton?: boolean
  onClose?: () => void
  showSteps?: boolean
  leftAction?: React.ReactNode
  className?: string
}

const BaseDialogHeader = ({
  title,
  subtitle,
  subtitleClassName,
  icon,
  currentStep,
  totalSteps,
  hideCloseButton = false,
  onClose,
  showSteps = false,
  leftAction,
  className
}: BaseDialogHeaderProps) => {
  return (
    <div className={cn(
      "p-5 sm:p-6 flex items-center justify-between bg-white border-b border-[#e5e5e5] shrink-0 pt-[calc(1.25rem+var(--safe-area-top)/2)]",
      className
    )}>
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        {leftAction ? (
          <div className="shrink-0">{leftAction}</div>
        ) : icon ? (
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] flex items-center justify-center shrink-0 bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] transition-all duration-300">
            {icon}
          </div>
        ) : null}
        <div className="flex flex-col min-w-0 flex-1">
          <DialogTitle className="text-base sm:text-lg font-semibold text-[#0a0a0a] tracking-tight leading-tight">
            {title}
          </DialogTitle>

          {(showSteps && currentStep !== undefined && totalSteps !== undefined) ? (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-[#737373] font-medium uppercase tracking-wider">
                ETAPA {currentStep} DE {totalSteps}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      (currentStep - 1) === i
                        ? "bg-primary w-4"
                        : (currentStep - 1) > i ? "bg-primary/40 w-2" : "bg-[#e5e5e5] w-2"
                    )}
                  />
                ))}
              </div>
            </div>
          ) : subtitle ? (
            <p className={cn("text-xs text-[#737373] font-normal leading-tight mt-0.5", subtitleClassName)}>
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      {!hideCloseButton && onClose && (
        <button
          onClick={onClose}
          className="ml-3 sm:ml-4 p-2 text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] rounded-[10px] transition-all active:scale-95 shrink-0"
        >
          <X className="w-5 h-5" />
          <span className="sr-only">Fechar</span>
        </button>
      )}
    </div>
  )
}

interface BaseDialogBodyProps {
  children: React.ReactNode
  className?: string
  animate?: boolean
  animationKey?: any
  containerRef?: React.Ref<HTMLDivElement>
}

const BaseDialogBody = ({
  children,
  className,
  animate = false,
  animationKey,
  containerRef
}: BaseDialogBodyProps) => {
  const content = (
    <div ref={containerRef} className={cn("p-5 sm:p-6 flex-1 overflow-y-auto min-h-[100px] [overflow-anchor:none]", className)}>
      {children}
    </div>
  )

  if (!animate) return content;

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 overflow-y-auto"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

interface BaseDialogFooterProps {
  children: React.ReactNode
  className?: string
}

const BaseDialogFooter = ({ children, className }: BaseDialogFooterProps) => {
  return (
    <div className={cn(
      "p-4 sm:p-5 bg-[#fafafa] flex gap-3 border-t border-[#e5e5e5] shrink-0 pb-[max(1rem,var(--safe-area-bottom))]",
      className
    )}>
      {children}
    </div>
  )
}

// Action button with standardized styles
interface BaseDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive"
  isLoading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
  type?: "button" | "submit"
}

const BaseDialogAction = ({
  label,
  onClick,
  variant = "primary",
  isLoading = false,
  disabled = false,
  icon,
  className,
  type = "button",
  ...props
}: BaseDialogActionProps) => {
  const styles = {
    primary: "bg-primary hover:bg-primary-hover text-primary-foreground shadow-xs",
    secondary: "bg-white border border-[#e5e5e5] text-[#0a0a0a] hover:bg-[#f5f5f5]",
    outline: "border border-[#e5e5e5] text-[#0a0a0a] bg-transparent hover:bg-[#f5f5f5]",
    ghost: "bg-transparent text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] border-0",
    destructive: "bg-[#e7000b] hover:bg-[#c80009] text-white shadow-xs disabled:bg-[#f5f5f5] disabled:text-[#a3a3a3] disabled:border disabled:border-[#e5e5e5] disabled:shadow-none disabled:hover:bg-[#f5f5f5]"
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "flex-1 h-11 rounded-[18px] font-medium text-xs sm:text-sm transition-all active:scale-95",
        styles[variant],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
      )}
    </Button>
  )
}

export const BaseDialog = Object.assign(BaseDialogRoot, {
  Header: BaseDialogHeader,
  Body: BaseDialogBody,
  Footer: BaseDialogFooter,
  Action: BaseDialogAction
})

export default BaseDialog;
