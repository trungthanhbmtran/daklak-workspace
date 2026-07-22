import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

function Input({ className, type, iconStart, iconEnd, ...props }: InputProps) {
  if (!iconStart && !iconEnd) {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <div className="relative flex w-full items-center">
      {iconStart && (
        <div className="absolute left-3 flex items-center justify-center text-muted-foreground pointer-events-none [&_svg]:size-4">
          {iconStart}
        </div>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          iconStart && "pl-9",
          iconEnd && "pr-9",
          className
        )}
        {...props}
      />
      {iconEnd && (
        <div className="absolute right-3 flex items-center justify-center text-muted-foreground pointer-events-none [&_svg]:size-4">
          {iconEnd}
        </div>
      )}
    </div>
  )
}

export { Input }
