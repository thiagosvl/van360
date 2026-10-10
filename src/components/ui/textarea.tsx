import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[90px] w-full rounded-[18px] border border-[#e5e5e5] bg-[#f5f5f5] hover:bg-white focus:bg-white p-3.5 sm:p-4 text-sm font-normal text-[#0a0a0a] placeholder:text-[#737373] focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] transition-all outline-none shadow-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-[#e7000b] aria-[invalid=true]:focus:ring-[#e7000b]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
