"use client"

import { useState, useEffect } from "react"
import { useChat } from "@/lib/chat-context"
import { ConversationList } from "@/components/chat/conversation-list"
import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import { ChatHeader } from "@/components/chat/chat-header"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface ChatLayoutProps {
  conversationId?: string
}

export function ChatLayout({ conversationId }: ChatLayoutProps) {
  const { setCurrentConversationId, currentConversation, fetchError, retryFetch } = useChat()
  const [showConversations, setShowConversations] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Use useEffect to handle state updates after render
  useEffect(() => {
    if (conversationId) {
      setCurrentConversationId(conversationId)
      if (isMobile) {
        setShowConversations(false)
      }
    } else {
      setCurrentConversationId(null)
      setShowConversations(true)
    }
  }, [conversationId, isMobile, setCurrentConversationId])

  const toggleView = () => {
    setShowConversations(!showConversations)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Conversations sidebar */}
      <div
        className={`${
          isMobile ? (showConversations ? "flex" : "hidden") : "flex"
        } flex-col w-full md:w-80 border-r bg-background`}
      >
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
        <div className="flex-1 overflow-auto">
          {fetchError ? (
            <div className="p-4 text-center">
              <p className="text-sm text-red-500 mb-2">{fetchError}</p>
              <Button onClick={retryFetch} size="sm">
                Retry
              </Button>
            </div>
          ) : (
            <ConversationList />
          )}
        </div>
      </div>

      {/* Chat area */}
      <div
        className={`${
          isMobile ? (showConversations ? "hidden" : "flex") : "flex"
        } flex-col flex-1 h-full bg-background`}
      >
        {currentConversation ? (
          <>
            <ChatHeader conversation={currentConversation} onBack={isMobile ? toggleView : undefined} />
            <div className="flex-1 overflow-auto">
              <MessageList />
            </div>
            <MessageInput />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            {isMobile && showConversations === false && (
              <Button variant="ghost" size="icon" onClick={toggleView} className="absolute top-4 left-4">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
            <p className="text-muted-foreground">
              Choose a conversation from the list or start a new one from a user's profile.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
