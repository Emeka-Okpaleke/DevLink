import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import Link from "next/link"

interface Skill {
  id: string
  name: string
}

interface SkillsOverviewProps {
  skills: Skill[]
  className?: string
}

export function SkillsOverview({ skills, className }: SkillsOverviewProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Your technical expertise</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/skills">
              <Plus className="h-4 w-4 mr-1" />
              Manage
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">No skills added yet</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/skills">Add Skills</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill.id} variant="secondary">
                {skill.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      {skills.length > 0 && (
        <CardFooter>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/dashboard/skills">Manage Skills</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
