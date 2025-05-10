import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface SkillsListProps {
  skills: {
    id: string
    name: string
  }[]
}

export function SkillsList({ skills }: SkillsListProps) {
  return (
    <Card>
      <CardHeader className="pb-2 flex justify-between items-start">
        <CardTitle>Skills</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/skills">
            <Plus className="h-4 w-4 mr-1" />
            Manage
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill.id} variant="secondary">
                {skill.name}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No skills added yet</p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/dashboard/skills">Add your first skill</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
