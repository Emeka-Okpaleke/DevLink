import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Users, FolderKanban, UserCheck } from "lucide-react"

interface StatsCardsProps {
  projectCount: number
  skillCount: number
  followerCount: number
  followingCount: number
}

export function StatsCards({ projectCount, skillCount, followerCount, followingCount }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Projects",
      value: projectCount,
      description: "Projects in your portfolio",
      icon: <FolderKanban className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Skills",
      value: skillCount,
      description: "Technical skills showcased",
      icon: <Code className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Followers",
      value: followerCount,
      description: "Developers following you",
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Following",
      value: followingCount,
      description: "Developers you follow",
      icon: <UserCheck className="h-5 w-5 text-muted-foreground" />,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
