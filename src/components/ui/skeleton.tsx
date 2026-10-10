import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[14px] sm:rounded-[18px] bg-[#ebebeb]/80", className)}
      {...props}
    />
  )
}

export { Skeleton }
