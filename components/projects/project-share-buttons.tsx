"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Share2, Copy, Twitter, Facebook, Linkedin } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ProjectShareButtonsProps {
  projectId: string
  projectTitle: string
}

export function ProjectShareButtons({ projectId, projectTitle }: ProjectShareButtonsProps) {
  const { toast } = useToast()
  const [isCopying, setIsCopying] = useState(false)

  const getShareUrl = () => {
    // Get the base URL dynamically
    const baseUrl =
      typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "https://yoursite.com"

    return `${baseUrl}/dashboard/projects/${projectId}`
  }

  const handleCopyLink = async () => {
    setIsCopying(true)

    try {
      await navigator.clipboard.writeText(getShareUrl())

      toast({
        title: "Link copied",
        description: "Project link copied to clipboard.",
      })
    } catch (error) {
      console.error("Error copying link:", error)
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCopying(false)
    }
  }

  const handleShareTwitter = () => {
    const url = getShareUrl()
    const text = `Check out this project: ${projectTitle}`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
    )
  }

  const handleShareFacebook = () => {
    const url = getShareUrl()
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
  }

  const handleShareLinkedIn = () => {
    const url = getShareUrl()
    const title = projectTitle
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      "_blank",
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleCopyLink} disabled={isCopying}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareTwitter}>
          <Twitter className="h-4 w-4 mr-2" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareFacebook}>
          <Facebook className="h-4 w-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareLinkedIn}>
          <Linkedin className="h-4 w-4 mr-2" />
          Share on LinkedIn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
