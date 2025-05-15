import { ClientChatLayout } from "@/components/chat/client-chat-layout"

export default function ConversationPage({ params }: { params: { id: string } }) {
  return (
    <div className="container p-0 max-w-screen-2xl">
      <ClientChatLayout conversationId={params.id} />
    </div>
  )
}
