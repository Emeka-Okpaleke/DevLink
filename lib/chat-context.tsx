"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
  sender?: {
    username: string
    avatar_url: string | null
  }
}

type Conversation = {
  id: string
  created_at: string
  updated_at: string
  participants: {
    id: string
    user_id: string
    last_read_at: string
    profile: {
      username: string
      avatar_url: string | null
      full_name: string | null
    }
  }[]
  last_message?: Message
  unread_count?: number
}

type ChatContextType = {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  loadingConversations: boolean
  loadingMessages: boolean
  fetchError: string | null
  retryFetch: () => void
  setCurrentConversationId: (id: string | null) => void
  sendMessage: (content: string) => Promise<void>
  markConversationAsRead: (conversationId: string) => Promise<void>
  startConversation: (userId: string) => Promise<string | null>
  searchConversations: (query: string) => void
  searchQuery: string
  filteredConversations: Conversation[]
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Use refs to prevent infinite loops
  const fetchingRef = useRef(false)
  const initialFetchDoneRef = useRef(false)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch conversations with error handling
  const fetchConversations = useCallback(async () => {
    // Prevent concurrent fetches
    if (!session?.user || fetchingRef.current) return

    fetchingRef.current = true
    setLoadingConversations(true)

    try {
      // Use our simplified function
      const { data: simpleConversations, error: conversationsError } = await supabase.rpc("get_simple_conversations", {
        p_user_id: session.user.id,
      })

      if (conversationsError) {
        console.error("Error fetching conversations:", conversationsError)
        setFetchError("Failed to load conversations. Please try again.")
        setLoadingConversations(false)
        fetchingRef.current = false
        return
      }

      if (!simpleConversations || simpleConversations.length === 0) {
        setConversations([])
        setFilteredConversations([])
        setLoadingConversations(false)
        fetchingRef.current = false
        initialFetchDoneRef.current = true
        return
      }

      // Build conversations array
      const conversationsArray: Conversation[] = []

      for (const conv of simpleConversations) {
        try {
          const conversationId = conv.conversation_id

          // Get last message
          const { data: lastMessages, error: lastMessageError } = await supabase.rpc("get_conversation_messages", {
            conv_id: conversationId,
          })

          if (lastMessageError) {
            console.error("Error fetching last message:", lastMessageError)
          }

          // Get the most recent message
          const lastMessage = lastMessages && lastMessages.length > 0 ? lastMessages[lastMessages.length - 1] : null

          // Get unread count - handle errors gracefully
          let unreadCount = 0
          try {
            const { data, error: unreadCountError } = await supabase.rpc("get_conversation_unread_count", {
              conv_id: conversationId,
              p_user_id: session.user.id,
            })

            if (!unreadCountError) {
              unreadCount = data || 0
            }
          } catch (error) {
            console.error("Error fetching unread count:", error)
          }

          // Get current user profile
          const { data: currentUserProfile, error: profileError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url, full_name")
            .eq("id", session.user.id)
            .single()

          if (profileError) {
            console.error("Error fetching current user profile:", profileError)
            continue
          }

          // Get participant's last_read_at using our new function
          const { data: participantData, error: participantError } = await supabase.rpc("get_participant_data", {
            conv_id: conversationId,
            p_user_id: session.user.id,
          })

          if (participantError) {
            console.error("Error fetching participant data:", participantError)
            continue
          }

          // Build conversation object
          const conversation: Conversation = {
            id: conversationId,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            participants: [
              // Current user
              {
                id: participantData[0]?.id || "current-user",
                user_id: session.user.id,
                last_read_at: participantData[0]?.last_read_at || new Date().toISOString(),
                profile: {
                  username: currentUserProfile.username,
                  avatar_url: currentUserProfile.avatar_url,
                  full_name: currentUserProfile.full_name,
                },
              },
              // Other user
              {
                id: "other-participant", // We don't have the actual ID, but it's not needed
                user_id: conv.other_user_id,
                last_read_at: new Date().toISOString(), // Placeholder
                profile: {
                  username: conv.other_username,
                  avatar_url: conv.other_avatar_url,
                  full_name: conv.other_full_name,
                },
              },
            ],
            unread_count: unreadCount,
          }

          // Add last message if it exists
          if (lastMessage) {
            conversation.last_message = {
              id: lastMessage.id,
              conversation_id: lastMessage.conversation_id,
              sender_id: lastMessage.sender_id,
              content: lastMessage.content,
              created_at: lastMessage.created_at,
              is_read: lastMessage.is_read,
              sender: {
                username: lastMessage.sender_username,
                avatar_url: lastMessage.sender_avatar_url,
              },
            }
          }

          // Check if this conversation is already in the array
          const existingIndex = conversationsArray.findIndex((c) => c.id === conversationId)
          if (existingIndex === -1) {
            conversationsArray.push(conversation)
          }
        } catch (error) {
          console.error("Error processing conversation:", error)
        }
      }

      // Sort by updated_at (most recent first)
      conversationsArray.sort((a, b) => {
        const aTime = a.last_message ? new Date(a.last_message.created_at).getTime() : new Date(a.updated_at).getTime()
        const bTime = b.last_message ? new Date(b.last_message.created_at).getTime() : new Date(b.updated_at).getTime()
        return bTime - aTime
      })

      setConversations(conversationsArray)
      setFilteredConversations(conversationsArray)
      setFetchError(null)
    } catch (error) {
      console.error("Unexpected error fetching conversations:", error)
      setFetchError("An unexpected error occurred. Please try again.")
    } finally {
      setLoadingConversations(false)
      fetchingRef.current = false
      initialFetchDoneRef.current = true
    }
  }, [session, supabase])

  // Retry fetch function
  const retryFetch = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }

    // Add a small delay before retrying
    retryTimeoutRef.current = setTimeout(() => {
      fetchConversations()
    }, 1000)
  }, [fetchConversations])

  // Initial fetch and subscription setup
  useEffect(() => {
    if (!session?.user) return

    // Only fetch if we haven't done the initial fetch yet
    if (!initialFetchDoneRef.current) {
      fetchConversations()
    }

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel("new_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          // If this message is for the current conversation, add it to messages
          if (payload.new && payload.new.conversation_id === currentConversationId) {
            fetchMessages(currentConversationId)
          }

          // Refresh conversations to update last message and unread count
          // But only if we're not already fetching
          if (!fetchingRef.current) {
            retryFetch()
          }
        },
      )
      .subscribe()

    return () => {
      messagesSubscription.unsubscribe()

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [session, supabase, fetchConversations, retryFetch, currentConversationId])

  // Update current conversation when ID changes
  useEffect(() => {
    if (!currentConversationId) {
      setMessages([])
      setCurrentConversation(null)
      return
    }

    const conversation = conversations.find((c) => c.id === currentConversationId) || null
    setCurrentConversation(conversation)

    if (conversation) {
      fetchMessages(currentConversationId)
      markConversationAsRead(currentConversationId)
    }
  }, [currentConversationId, conversations])

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    if (!session?.user) return

    setLoadingMessages(true)
    try {
      // Use our new function to get messages
      const { data, error } = await supabase.rpc("get_conversation_messages", {
        conv_id: conversationId,
      })

      if (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
        return
      }

      // Transform the data to match our Message type
      const formattedMessages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        content: msg.content,
        created_at: msg.created_at,
        is_read: msg.is_read,
        sender: {
          username: msg.sender_username,
          avatar_url: msg.sender_avatar_url,
        },
      }))

      setMessages(formattedMessages || [])
    } catch (error) {
      console.error("Unexpected error fetching messages:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoadingMessages(false)
    }
  }

  // Send a message
  const sendMessage = async (content: string) => {
    if (!session?.user || !currentConversationId || !content.trim()) return

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: currentConversationId,
        sender_id: session.user.id,
        content: content.trim(),
      })

      if (error) {
        console.error("Error sending message:", error)
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        })
        return
      }

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", currentConversationId)
    } catch (error) {
      console.error("Unexpected error sending message:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Mark conversation as read
  const markConversationAsRead = async (conversationId: string) => {
    if (!session?.user) return

    try {
      const { error } = await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", session.user.id)

      if (error) {
        console.error("Error marking conversation as read:", error)
        return
      }
    } catch (error) {
      console.error("Unexpected error marking conversation as read:", error)
    }
  }

  // Start a new conversation with a user
  const startConversation = async (userId: string): Promise<string | null> => {
    if (!session?.user) return null

    try {
      // Use the get_or_create_conversation function
      const { data, error } = await supabase.rpc("get_or_create_conversation", {
        user1_id: session.user.id,
        user2_id: userId,
      })

      if (error) {
        console.error("Error starting conversation:", error)
        toast({
          title: "Error",
          description: "Failed to start conversation",
          variant: "destructive",
        })
        return null
      }

      return data
    } catch (error) {
      console.error("Unexpected error starting conversation:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return null
    }
  }

  // Search conversations
  const searchConversations = useCallback(
    (query: string) => {
      setSearchQuery(query)

      if (!query.trim()) {
        setFilteredConversations(conversations)
        return
      }

      const lowerQuery = query.toLowerCase()
      const filtered = conversations.filter((conversation) => {
        // Find the other participant (not the current user)
        const otherParticipant = conversation.participants.find((p) => p.user_id !== session?.user?.id)

        if (!otherParticipant) return false

        const { profile } = otherParticipant

        return (
          profile.username.toLowerCase().includes(lowerQuery) ||
          (profile.full_name && profile.full_name.toLowerCase().includes(lowerQuery))
        )
      })

      setFilteredConversations(filtered)
    },
    [conversations, session?.user?.id],
  )

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        loadingConversations,
        loadingMessages,
        fetchError,
        retryFetch,
        setCurrentConversationId,
        sendMessage,
        markConversationAsRead,
        startConversation,
        searchConversations,
        searchQuery,
        filteredConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
