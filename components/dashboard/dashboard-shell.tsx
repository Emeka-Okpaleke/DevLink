import type React from "react"
interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">{children}</div>
}
