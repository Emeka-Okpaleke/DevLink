"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

type SocialLink = Database["public"]["Tables"]["social_links"]["Row"]

interface SocialLinksManagerProps {
  userId: string
}

export function SocialLinksManager({ userId }: SocialLinksManagerProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [links, setLinks] = useState<SocialLink[]>([])
  const [platform, setPlatform] = useState("")
  const [url, setUrl] = useState("")

  const platforms = [
    "GitHub",
    "Twitter",
    "LinkedIn",
    "Instagram",
    "YouTube",
    "Facebook",
    "Twitch",
    "CodePen",
    "Dribbble",
    "Dev.to",
    "Medium",
    "Stack Overflow",
    "Other",
  ]

  useEffect(() => {
    async function fetchLinks() {
      if (!userId) return

      const { data } = await supabase.from("social_links").select("*").eq("user_id", userId).order("platform")

      if (data) {
        setLinks(data)
      }
    }

    fetchLinks()
  }, [supabase, userId])

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!platform || !url || !userId) return

    setLoading(true)

    try {
      // Check if platform already exists
      const existingLink = links.find((link) => link.platform.toLowerCase() === platform.toLowerCase())

      if (existingLink) {
        toast({
          title: "Platform already exists",
          description: "You already have a link for this platform",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const { error } = await supabase.from("social_links").insert({
        user_id: userId,
        platform,
        url,
      })

      if (error) throw error

      const { data } = await supabase
        .from("social_links")
        .select("*")
        .eq("user_id", userId)
        .eq("platform", platform)
        .single()

      if (data) {
        setLinks([...links, data])
      }

      setPlatform("")
      setUrl("")

      toast({
        title: "Link added",
        description: "Social link has been added to your profile",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add social link",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLink = async (id: string) => {
    setLoading(true)

    try {
      const { error } = await supabase.from("social_links").delete().eq("id", id)

      if (error) throw error

      setLinks(links.filter((link) => link.id !== id))

      toast({
        title: "Link removed",
        description: "Social link has been removed from your profile",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove social link",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
        <CardDescription>Add links to your social media profiles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {links.length === 0 ? (
          <p className="text-muted-foreground">No social links added yet</p>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <p className="font-medium">{link.platform}</p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    {link.url}
                  </a>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteLink(link.id)} disabled={loading}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddLink} className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <label htmlFor="platform" className="block text-sm font-medium">
              Platform
            </label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
              required
            >
              <option value="">Select a platform</option>
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="url" className="block text-sm font-medium">
              URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
              placeholder="https://example.com/profile"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
