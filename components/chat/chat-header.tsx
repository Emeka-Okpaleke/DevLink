"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ChatHeaderProps {
  conversation: {
    participants: {
      user_id: string
      profile: {
        username: string
        avatar_url: string | null
        full_name: string | null
      }
    }[]
  }
  onBack?: () => void
}

export function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
  // Find the other participant (not the current user)
  const otherParticipant = conversation.participants.find((p, i) => i === 1)

  if (!otherParticipant) {
    return (
      <div className="p-4 border-b flex items-center">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h2 className="text-lg font-semibold">Unknown User</h2>
      </div>
    )
  }

  const { profile } = otherParticipant

  return (
    <div className="p-4 border-b flex items-center">
      {onBack && (
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      <Link href={`/profile/${profile.username}`} className="flex items-center hover:opacity-80 transition-opacity">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage
            src={
              profile.avatar_url ||
              `/placeholder.svg?height=32&width=32&query=${profile.username.charAt(0).toUpperCase()}`
            }
            alt={profile.username}
          />
          <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">{profile.full_name || profile.username}</h2>
          <p className="text-xs text-muted-foreground">@{profile.username}</p>
        </div>
      </Link>
    </div>
  )
}
