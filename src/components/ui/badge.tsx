import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[18px] border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#171717] text-[#fafafa]",
        primary:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-[#f5f5f5] text-[#171717]",
        tonal:
          "border-primary/20 bg-primary/10 text-primary border",
        soft:
          "border-primary/20 bg-primary/10 text-primary border",
        destructive:
          "border-[#e7000b]/20 bg-[#e7000b]/10 text-[#e7000b] border",
        success:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 border",
        warning:
          "border-amber-500/20 bg-amber-500/10 text-amber-700 border",
        outline: "border-[#e5e5e5] text-[#0a0a0a] bg-transparent border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

