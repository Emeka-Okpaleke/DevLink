import type React from "react"
import { ChatProvider } from "@/lib/chat-context"

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <div className="container p-0 max-w-screen-2xl">{children}</div>
    </ChatProvider>
  )
}
