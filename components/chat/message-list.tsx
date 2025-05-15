"use client"

import { useEffect, useRef } from "react"
import { useChat } from "@/lib/chat-context"
import { useSupabase } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

export function MessageList() {
  const { messages, loadingMessages } = useChat()
  const { session } = useSupabase()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (loadingMessages) {
    return (
      <div className="flex flex-col p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-2 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-10 w-3/4 bg-muted rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-muted-foreground">No messages yet</p>
        <p className="text-sm text-muted-foreground">Start the conversation by sending a message</p>
      </div>
    )
  }

  // Group messages by date
  const groupedMessages: { [date: string]: typeof messages } = {}
  messages.forEach((message) => {
    const date = new Date(message.created_at).toDateString()
    if (!groupedMessages[date]) {
      groupedMessages[date] = []
    }
    groupedMessages[date].push(message)
  })

  return (
    <div className="flex flex-col p-4 space-y-6">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="flex justify-center">
            <div className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full">
              {format(new Date(date), "MMMM d, yyyy")}
            </div>
          </div>
          {dateMessages.map((message) => {
            const isCurrentUser = message.sender_id === session?.user?.id
            return (
              <div key={message.id} className={`flex items-start gap-2 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        message.sender?.avatar_url ||
                        `/placeholder.svg?height=32&width=32&query=${message.sender?.username.charAt(0).toUpperCase() || "/placeholder.svg"}`
                      }
                      alt={message.sender?.username || ""}
                    />
                    <AvatarFallback>{message.sender?.username.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                  {!isCurrentUser && (
                    <span className="text-xs text-muted-foreground mb-1">{message.sender?.username}</span>
                  )}
                  <div
                    className={`px-3 py-2 rounded-lg max-w-[75%] break-words ${
                      isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {format(new Date(message.created_at), "h:mm a")}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
