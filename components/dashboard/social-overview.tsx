import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { getSocialIcon } from "@/lib/social-icons"

interface SocialLink {
  id: string
  platform: string
  url: string
}

interface SocialOverviewProps {
  socialLinks: SocialLink[]
  className?: string
}

export function SocialOverview({ socialLinks, className }: SocialOverviewProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Your online presence</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/social">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {socialLinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">No social links added yet</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/social">Add Social Links</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {socialLinks.map((link) => {
              const Icon = getSocialIcon(link.platform)
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium capitalize">{link.platform}</span>
                </a>
              )
            })}
          </div>
        )}
      </CardContent>
      {socialLinks.length > 0 && (
        <CardFooter>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/dashboard/social">Manage Social Links</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
