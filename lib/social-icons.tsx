import { Github, Twitter, Linkedin, Instagram, Youtube, Facebook, Twitch, Codepen, Dribbble, Globe } from "lucide-react"

export function getSocialIcon(platform: string) {
  const lowerPlatform = platform.toLowerCase()

  switch (lowerPlatform) {
    case "github":
      return Github
    case "twitter":
      return Twitter
    case "linkedin":
      return Linkedin
    case "instagram":
      return Instagram
    case "youtube":
      return Youtube
    case "facebook":
      return Facebook
    case "twitch":
      return Twitch
    case "codepen":
      return Codepen
    case "dribbble":
      return Dribbble
    default:
      return Globe
  }
}
