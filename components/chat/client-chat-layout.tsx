"use client"

import { useState, useEffect } from "react"
import { ChatLayout } from "@/components/chat/chat-layout"

export function ClientChatLayout({ conversationId }: { conversationId: string }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Set ready state after component mounts to ensure client-side rendering
    setIsReady(true)
  }, [])

  if (!isReady) {
    return <div className="p-8 text-center">Loading chat...</div>
  }

  return <ChatLayout conversationId={conversationId} />
}
