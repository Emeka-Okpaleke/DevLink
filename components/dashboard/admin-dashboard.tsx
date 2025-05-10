"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Code, Settings, BarChart3, Shield, ArrowRight } from "lucide-react"

export function AdminDashboard() {
  const adminFeatures = [
    {
      title: "User Management",
      description: "Manage user accounts, permissions, and access control.",
      icon: <Users className="h-8 w-8 text-blue-500" />,
      link: "/dashboard/admin/users",
      actions: [
        { label: "View All Users", link: "/dashboard/admin/users" },
        { label: "Manage Permissions", link: "/dashboard/admin/users" },
      ],
    },
    {
      title: "Skills Management",
      description: "Add, edit, and organize skills and technologies across the platform.",
      icon: <Code className="h-8 w-8 text-green-500" />,
      link: "/dashboard/admin/skills",
      actions: [
        { label: "Manage Skills", link: "/dashboard/admin/skills" },
        { label: "Add New Skills", link: "/dashboard/admin/skills" },
      ],
    },
    {
      title: "Site Settings",
      description: "Configure global settings and preferences for the platform.",
      icon: <Settings className="h-8 w-8 text-purple-500" />,
      link: "#",
      actions: [
        { label: "General Settings", link: "#" },
        { label: "Appearance", link: "#" },
      ],
      disabled: true,
    },
    {
      title: "Analytics",
      description: "View platform usage statistics and user engagement metrics.",
      icon: <BarChart3 className="h-8 w-8 text-amber-500" />,
      link: "#",
      actions: [
        { label: "View Reports", link: "#" },
        { label: "Export Data", link: "#" },
      ],
      disabled: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {adminFeatures.map((feature, index) => (
          <Card key={index} className={feature.disabled ? "opacity-60" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
              <div className="rounded-full bg-muted p-2">{feature.icon}</div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
            <CardFooter className="flex flex-col items-start space-y-2">
              <div className="flex flex-wrap gap-2 w-full">
                {feature.actions.map((action, actionIndex) => (
                  <Button
                    key={actionIndex}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    asChild={!feature.disabled}
                    disabled={feature.disabled}
                  >
                    {!feature.disabled ? (
                      <Link href={action.link}>
                        {action.label}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    ) : (
                      <span>
                        {action.label}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                ))}
              </div>
              {feature.disabled && <p className="text-xs text-muted-foreground mt-2">Coming soon</p>}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900">Admin Responsibilities</h3>
            <p className="text-sm text-blue-700 mt-1">
              As an administrator, you have elevated privileges. Please ensure you follow best practices when managing
              user data and platform settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
