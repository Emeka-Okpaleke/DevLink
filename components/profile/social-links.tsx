import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Github,
  Twitter,
  Linkedin,
  Globe,
  Instagram,
  Youtube,
  ExternalLink,
  Facebook,
  Twitch,
  Codepen,
  Dribbble,
} from "lucide-react"

interface SocialLink {
  id: string
  platform: string
  url: string
}

interface SocialLinksProps {
  links: SocialLink[]
  website: string | null
}

export function SocialLinks({ links, website }: SocialLinksProps) {
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "github":
        return <Github className="h-4 w-4" />
      case "twitter":
        return <Twitter className="h-4 w-4" />
      case "linkedin":
        return <Linkedin className="h-4 w-4" />
      case "instagram":
        return <Instagram className="h-4 w-4" />
      case "youtube":
        return <Youtube className="h-4 w-4" />
      case "facebook":
        return <Facebook className="h-4 w-4" />
      case "twitch":
        return <Twitch className="h-4 w-4" />
      case "codepen":
        return <Codepen className="h-4 w-4" />
      case "dribbble":
        return <Dribbble className="h-4 w-4" />
      default:
        return <ExternalLink className="h-4 w-4" />
    }
  }

  if (links.length === 0 && !website) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {website && (
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href={website} target="_blank" rel="noopener noreferrer">
              <Globe className="mr-2 h-4 w-4" />
              Website
            </Link>
          </Button>
        )}

        {links.map((link) => (
          <Button key={link.id} variant="outline" className="w-full justify-start" asChild>
            <Link href={link.url} target="_blank" rel="noopener noreferrer">
              {getPlatformIcon(link.platform)}
              <span className="ml-2 capitalize">{link.platform}</span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
