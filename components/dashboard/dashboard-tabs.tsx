"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { ProjectsList } from "@/components/dashboard/projects-list"
import { SkillsManager } from "@/components/dashboard/skills-manager"
import { SocialLinksManager } from "@/components/dashboard/social-links-manager"
import { ConnectionsTab } from "@/components/dashboard/connections-tab"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Project = Database["public"]["Tables"]["projects"]["Row"]
type Skill = Database["public"]["Tables"]["skills"]["Row"]

interface DashboardTabsProps {
  profile: Profile | null
  projects: Project[]
  skills: Skill[]
  followers: number
  following: number
}

export function DashboardTabs({ profile, projects, skills, followers, following }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="social">Social Links</TabsTrigger>
        <TabsTrigger value="connections">Connections</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="space-y-4">
        <ProfileForm profile={profile} />
      </TabsContent>
      <TabsContent value="projects" className="space-y-4">
        <ProjectsList projects={projects} />
      </TabsContent>
      <TabsContent value="skills" className="space-y-4">
        <SkillsManager currentSkills={skills} />
      </TabsContent>
      <TabsContent value="social" className="space-y-4">
        <SocialLinksManager userId={profile?.id || ""} />
      </TabsContent>
      <TabsContent value="connections" className="space-y-4">
        <ConnectionsTab followers={followers} following={following} />
      </TabsContent>
    </Tabs>
  )
}
