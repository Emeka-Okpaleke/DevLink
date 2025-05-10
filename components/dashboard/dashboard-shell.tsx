import type React from "react"
interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return <div className="container mx-auto grid items-start gap-8 py-8">{children}</div>
}
