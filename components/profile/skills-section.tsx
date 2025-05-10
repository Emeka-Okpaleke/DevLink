import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Skill {
  id: string
  name: string
}

interface SkillsSectionProps {
  skills: Skill[]
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  if (skills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No skills to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill.id} variant="secondary">
              {skill.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
