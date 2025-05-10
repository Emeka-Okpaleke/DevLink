import { Card, CardContent } from "@/components/ui/card"
import { Users, FolderKanban, Code, UserCheck } from "lucide-react"

interface DashboardStatsProps {
  projectCount: number
  skillCount: number
  followerCount: number
  followingCount: number
}

export function DashboardStats({ projectCount, skillCount, followerCount, followingCount }: DashboardStatsProps) {
  const stats = [
    {
      title: "Projects",
      value: projectCount,
      icon: <FolderKanban className="h-4 w-4" />,
    },
    {
      title: "Skills",
      value: skillCount,
      icon: <Code className="h-4 w-4" />,
    },
    {
      title: "Followers",
      value: followerCount,
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Following",
      value: followingCount,
      icon: <UserCheck className="h-4 w-4" />,
    },
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.title} className="flex flex-col items-center p-3 border rounded-lg">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary mb-2">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.title}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
