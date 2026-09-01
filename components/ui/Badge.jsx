import * as React from "react"
import { cn } from "../../lib/utils/cn"

const badgeVariants = {
  default: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  destructive: "bg-red-100 text-red-800 hover:bg-red-200",
  success: "bg-green-100 text-green-800 hover:bg-green-200",
  outline: "text-gray-900 border border-gray-300",
}

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
