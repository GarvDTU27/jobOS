"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Briefcase, FileText, FileSpreadsheet, Settings } from "lucide-react"
import { cn } from "../../lib/utils/cn"

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Applications", href: "/applications", icon: FileSpreadsheet },
  { name: "Resumes", href: "/resumes", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
        const Icon = item.icon

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon
              className={cn(
                "mr-3 h-5 w-5 flex-shrink-0",
                isActive ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500"
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
