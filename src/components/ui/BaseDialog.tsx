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
          "w-[calc(100%-1.25rem)] sm:w-full p-0 overflow-hidden bg-white rounded-[2rem] border border-slate-200/50 shadow-diff-shadow flex flex-col max-h-[calc(100dvh-var(--safe-area-top)-var(--safe-area-bottom)-3rem)] gap-0",
          maxWidthClass,
          className
        )}
        onPointerDownOutside={(e) => lockClose && e.preventDefault()}
        onEscapeKeyDown={(e) => lockClose && e.preventDefault()}
        hideCloseButton // We'll handle our own close button in the header
      >
        <div className="sr-only">
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
  icon?: React.ReactNode
  currentStep?: number
  totalSteps?: number
  hideCloseButton?: boolean
  onClose?: () => void
  showSteps?: boolean
  leftAction?: React.ReactNode
}

const BaseDialogHeader = ({
  title,
  subtitle,
  icon,
  currentStep,
  totalSteps,
  hideCloseButton = false,
  onClose,
  showSteps = false,
  leftAction
}: BaseDialogHeaderProps) => {
  return (
    <div className="p-5 sm:p-6 flex items-center justify-between bg-white border-b border-slate-100/60 shrink-0 pt-[calc(1.25rem+var(--safe-area-top)/2)]">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {leftAction ? (
          <div className="shrink-0">{leftAction}</div>
        ) : icon ? (
          <div className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 bg-slate-50/50 text-[#1a3a5c] border border-slate-100 shadow-sm transition-all duration-500">
            {icon}
          </div>
        ) : null}
        <div className="flex flex-col min-w-0 flex-1">
          <DialogTitle className="text-sm sm:text-lg font-headline font-black text-[#1a3a5c] uppercase tracking-tight line-clamp-2 leading-tight">
            {title}
          </DialogTitle>

          {(showSteps && currentStep !== undefined && totalSteps !== undefined) ? (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                ETAPA {currentStep} DE {totalSteps}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      (currentStep - 1) === i
                        ? "bg-[#1a3a5c] w-4"
                        : (currentStep - 1) > i ? "bg-[#1a3a5c]/40 w-2" : "bg-slate-100 w-2"
                    )}
                  />
                ))}
              </div>
            </div>
          ) : subtitle ? (
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-0.5 truncate">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      {!hideCloseButton && onClose && (
        <button
          onClick={onClose}
          className="ml-4 p-2 text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-50 rounded-xl transition-all active:scale-95 shrink-0"
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
    <div ref={containerRef} className={cn("p-6 pt-2 flex-1 overflow-y-auto min-h-[100px] [overflow-anchor:none]", className)}>
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
      "p-5 sm:p-6 bg-slate-50/40 flex gap-4 border-t border-slate-100/60 shrink-0 pb-[max(1.25rem,var(--safe-area-bottom))]",
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
  variant?: "primary" | "secondary" | "ghost" | "outline"
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
    primary: "bg-[#1a3a5c] hover:bg-[#1a3a5c]/95 text-white shadow-lg shadow-[#1a3a5c]/20",
    secondary: "bg-white border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-100",
    outline: "border border-slate-200 text-[#1a3a5c] bg-transparent hover:bg-slate-50",
    ghost: "bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100 border-0"
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "flex-1 h-12 rounded-2xl font-black uppercase text-[10.5px] tracking-wider transition-all active:scale-95",
        styles[variant],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
