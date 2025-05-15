export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          website: string | null
          location: string | null
          is_public: boolean
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website?: string | null
          location?: string | null
          is_public?: boolean
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website?: string | null
          location?: string | null
          is_public?: boolean
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          image_url: string | null
          github_url: string | null
          live_url: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          image_url?: string | null
          github_url?: string | null
          live_url?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          github_url?: string | null
          live_url?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      project_views: {
        Row: {
          id: string
          project_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          viewed_at: string
          view_date: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          viewed_at?: string
          view_date?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          viewed_at?: string
          view_date?: string
        }
      }
      project_comments: {
        Row: {
          id: string
          project_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_endorsements: {
        Row: {
          id: string
          project_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          created_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
      }
      user_skills: {
        Row: {
          id: string
          user_id: string
          skill_id: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_id: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_id?: string
        }
      }
      project_technologies: {
        Row: {
          id: string
          project_id: string
          skill_id: string
        }
        Insert: {
          id?: string
          project_id: string
          skill_id: string
        }
        Update: {
          id?: string
          project_id?: string
          skill_id?: string
        }
      }
      social_links: {
        Row: {
          id: string
          user_id: string
          platform: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          url?: string
          created_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
        }
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          created_at: string
          last_read_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          created_at?: string
          last_read_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          created_at?: string
          last_read_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          created_at: string
          is_read: boolean
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          created_at?: string
          is_read?: boolean
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          created_at?: string
          is_read?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_project_view_count: {
        Args: {
          project_id: string
        }
        Returns: number
      }
      get_project_unique_viewers: {
        Args: {
          project_id: string
        }
        Returns: number
      }
      track_project_view: {
        Args: {
          project_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Returns: number
      }
      get_project_endorsement_count: {
        Args: {
          project_id: string
        }
        Returns: number
      }
      has_user_endorsed_project: {
        Args: {
          project_id: string
          user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      get_profile_by_id: {
        Args: {
          user_id: string
        }
        Returns: {
          id: string
          username: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          website: string | null
          location: string | null
          is_public: boolean
          is_admin: boolean
          created_at: string
          updated_at: string
        }[]
      }
      get_service_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_or_create_conversation: {
        Args: {
          user1_id: string
          user2_id: string
        }
        Returns: string
      }
      get_unread_message_count: {
        Args: {
          user_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
