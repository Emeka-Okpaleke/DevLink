"use client"

import type React from "react"
import { useChat } from "@/lib/chat-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatDistanceToNow } from "date-fns"
import { Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export function ConversationList() {
  const { filteredConversations, loadingConversations, searchConversations, searchQuery } = useChat()
  const pathname = usePathname()
  // Always initialize with an empty string to ensure it's controlled
  const [inputValue, setInputValue] = useState("")

  // Sync the input value with searchQuery from context, ensuring it's never undefined
  useEffect(() => {
    // Only update if searchQuery is defined and different from current inputValue
    if (searchQuery !== undefined && searchQuery !== inputValue) {
      setInputValue(searchQuery)
    }
  }, [searchQuery, inputValue])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    searchConversations(value)
  }

  if (loadingConversations) {
    return (
      <div className="p-4">
        <div className="flex items-center border rounded-md px-3 py-2 mb-4">
          <Search className="h-4 w-4 mr-2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            className="border-0 p-0 shadow-none focus-visible:ring-0"
            disabled
            // Always provide a string value
            value=""
          />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-3 w-32 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (filteredConversations.length === 0 && !searchQuery) {
    return (
      <div className="p-4">
        <div className="flex items-center border rounded-md px-3 py-2 mb-4">
          <Search className="h-4 w-4 mr-2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            className="border-0 p-0 shadow-none focus-visible:ring-0"
            value={inputValue}
            onChange={handleSearch}
          />
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No conversations yet</p>
          <p className="text-sm text-muted-foreground mt-1">Start a conversation from a user's profile</p>
        </div>
      </div>
    )
  }

  if (filteredConversations.length === 0 && searchQuery) {
    return (
      <div className="p-4">
        <div className="flex items-center border rounded-md px-3 py-2 mb-4">
          <Search className="h-4 w-4 mr-2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            className="border-0 p-0 shadow-none focus-visible:ring-0"
            value={inputValue}
            onChange={handleSearch}
          />
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No results found</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center border rounded-md px-3 py-2 mb-4">
        <Search className="h-4 w-4 mr-2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search conversations..."
          className="border-0 p-0 shadow-none focus-visible:ring-0"
          value={inputValue}
          onChange={handleSearch}
        />
      </div>
      <div className="space-y-1">
        {filteredConversations.map((conversation) => {
          // Find the other participant (not the current user)
          const otherParticipant = conversation.participants.find((p, i) => i === 1)
          if (!otherParticipant) return null

          const { profile } = otherParticipant
          const isActive = pathname === `/messages/${conversation.id}`

          return (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.id}`}
              className={`flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors ${
                isActive ? "bg-accent" : ""
              }`}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={
                    profile.avatar_url ||
                    `/placeholder.svg?height=40&width=40&query=${profile.username.charAt(0).toUpperCase() || "U"}`
                  }
                  alt={profile.username || "User"}
                />
                <AvatarFallback>{profile.username ? profile.username.charAt(0).toUpperCase() : "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium truncate">{profile.full_name || profile.username || "User"}</h3>
                  {conversation.last_message && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.last_message ? conversation.last_message.content : "No messages yet"}
                  </p>
                  {conversation.unread_count && conversation.unread_count > 0 ? (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
