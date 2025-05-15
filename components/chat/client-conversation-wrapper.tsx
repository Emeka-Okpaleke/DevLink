"use client"

import { useState, useEffect } from "react"
import { ChatLayout } from "@/components/chat/chat-layout"

interface ClientConversationWrapperProps {
  conversationId: string
}

export function ClientConversationWrapper({ conversationId }: ClientConversationWrapperProps) {
  // Use state to store the ID
  const [id, setId] = useState<string | null>(null)

  // Set the ID after the component mounts
  useEffect(() => {
    setId(conversationId)
  }, [conversationId])

  // Only render the ChatLayout when we have an ID
  if (!id) return <div>Loading...</div>

  return <ChatLayout conversationId={id} />
}
