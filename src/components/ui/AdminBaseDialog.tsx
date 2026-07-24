import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

interface AdminBaseDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  lockClose?: boolean;
  description?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
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
  full: "max-w-full",
};

const AdminBaseDialogRoot = ({
  children,
  open,
  onOpenChange,
  className,
  lockClose = false,
  description,
  maxWidth = "md",
}: AdminBaseDialogProps) => {
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
          "w-[calc(100%-1.25rem)] sm:w-full p-0 overflow-hidden bg-[#131b2e] rounded-[2rem] border border-slate-800/80 shadow-2xl text-slate-100 flex flex-col max-h-[calc(100dvh-2.5rem)] gap-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-offset-0 outline-none ring-0 ring-offset-0",
          maxWidthClass,
          className
        )}
        onPointerDownOutside={(e) => lockClose && e.preventDefault()}
        onEscapeKeyDown={(e) => lockClose && e.preventDefault()}
        hideCloseButton
      >
        <div className="sr-only">
          <DialogPrimitive.Description>
            {description || "Admin Dialog content"}
          </DialogPrimitive.Description>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
};

interface AdminBaseDialogHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  hideCloseButton?: boolean;
  onClose?: () => void;
  leftAction?: React.ReactNode;
}

const AdminBaseDialogHeader = ({
  title,
  subtitle,
  icon,
  hideCloseButton = false,
  onClose,
  leftAction,
}: AdminBaseDialogHeaderProps) => {
  return (
    <div className="p-5 sm:p-6 flex items-center justify-between bg-slate-900/60 border-b border-slate-800/80 shrink-0 text-left">
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {leftAction ? (
          <div className="shrink-0">{leftAction}</div>
        ) : icon ? (
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
            {icon}
          </div>
        ) : null}
        <div className="flex flex-col min-w-0 flex-1">
          <DialogTitle className="text-sm sm:text-base font-headline font-black text-white uppercase tracking-tight line-clamp-2 leading-tight">
            {title}
          </DialogTitle>

          {subtitle && (
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {!hideCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all active:scale-95 shrink-0"
        >
          <X className="w-5 h-5" />
          <span className="sr-only">Fechar</span>
        </button>
      )}
    </div>
  );
};

interface AdminBaseDialogBodyProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  animationKey?: any;
  containerRef?: React.Ref<HTMLDivElement>;
}

const AdminBaseDialogBody = ({
  children,
  className,
  animate = false,
  animationKey,
  containerRef,
}: AdminBaseDialogBodyProps) => {
  const content = (
    <div
      ref={containerRef}
      className={cn(
        "p-5 sm:p-6 flex-1 overflow-y-auto min-h-[100px] scrollbar-thin scrollbar-thumb-slate-700/80 scrollbar-track-slate-900/50 [overflow-anchor:none] text-left space-y-4",
        className
      )}
    >
      {children}
    </div>
  );

  if (!animate) return content;

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-1 overflow-y-auto"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

interface AdminBaseDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

const AdminBaseDialogFooter = ({ children, className }: AdminBaseDialogFooterProps) => {
  return (
    <div
      className={cn(
        "p-4 sm:p-5 bg-slate-900/40 flex gap-3 border-t border-slate-800/80 shrink-0",
        className
      )}
    >
      {children}
    </div>
  );
};

interface AdminBaseDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
}

const AdminBaseDialogAction = ({
  label,
  onClick,
  variant = "primary",
  isLoading = false,
  disabled = false,
  icon,
  className,
  type = "button",
  ...props
}: AdminBaseDialogActionProps) => {
  const styles = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25",
    secondary: "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/80",
    outline: "border border-slate-700 text-slate-300 bg-transparent hover:bg-slate-800",
    ghost: "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border-0",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25",
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "flex-1 h-11 rounded-xl font-bold uppercase text-xs tracking-wider transition-all active:scale-95 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
        styles[variant],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="flex items-center gap-2 justify-center">
          {icon}
          <span>{label}</span>
        </div>
      )}
    </Button>
  );
};

export const AdminBaseDialog = Object.assign(AdminBaseDialogRoot, {
  Header: AdminBaseDialogHeader,
  Body: AdminBaseDialogBody,
  Footer: AdminBaseDialogFooter,
  Action: AdminBaseDialogAction,
});

export default AdminBaseDialog;
