"use server"

import { createServerClient } from "@/lib/supabase/server"

export type SearchResult = {
  developers: Array<{
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
    bio: string | null
    location: string | null
    skills: Array<{ id: string; name: string }>
  }>
  skills: Array<{ id: string; name: string; count: number }>
  locations: Array<{ location: string; count: number }>
}

export async function searchDevelopers(
  query = "",
  selectedSkills: string[] = [],
  selectedLocation = "",
  page = 1,
  limit = 12,
): Promise<SearchResult> {
  const supabase = createServerClient()
  const offset = (page - 1) * limit

  // Base query for developers
  let developersQuery = supabase
    .from("profiles")
    .select(`
      id,
      username,
      full_name,
      avatar_url,
      bio,
      location,
      user_skills!inner (
        skills (
          id,
          name
        )
      )
    `)
    .eq("is_public", true)

  // Apply search filters
  if (query) {
    developersQuery = developersQuery.or(`username.ilike.%${query}%,full_name.ilike.%${query}%,bio.ilike.%${query}%`)
  }

  if (selectedLocation) {
    developersQuery = developersQuery.ilike("location", `%${selectedLocation}%`)
  }

  if (selectedSkills.length > 0) {
    // For each skill, we need to ensure the user has that skill
    selectedSkills.forEach((skillId) => {
      developersQuery = developersQuery.filter("user_skills.skills.id", "eq", skillId)
    })
  }

  // Execute the query with pagination
  const { data: developers } = await developersQuery.order("username").range(offset, offset + limit - 1)

  // Process the results to extract unique skills for each developer
  const processedDevelopers =
    developers?.map((developer) => {
      const uniqueSkills = new Map()

      developer.user_skills.forEach((skillItem) => {
        if (skillItem.skills) {
          uniqueSkills.set(skillItem.skills.id, skillItem.skills)
        }
      })

      return {
        ...developer,
        skills: Array.from(uniqueSkills.values()),
      }
    }) || []

  // Get popular skills - using a simpler approach without grouping
  const { data: allUserSkills } = await supabase
    .from("user_skills")
    .select(`
      skill_id,
      skills (
        id,
        name
      ),
      profiles!inner (
        is_public
      )
    `)
    .eq("profiles.is_public", true)

  // Process skills data manually
  const skillsMap = new Map<string, { id: string; name: string; count: number }>()

  allUserSkills?.forEach((item) => {
    if (item.skills) {
      const skillId = item.skills.id
      const existing = skillsMap.get(skillId)

      if (existing) {
        skillsMap.set(skillId, { ...existing, count: existing.count + 1 })
      } else {
        skillsMap.set(skillId, { id: skillId, name: item.skills.name, count: 1 })
      }
    }
  })

  // Convert map to array and sort by count
  const skills = Array.from(skillsMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  // Get popular locations - using a simpler approach
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("location")
    .not("location", "is", null)
    .eq("is_public", true)

  // Process locations data manually
  const locationsMap = new Map<string, { location: string; count: number }>()

  allProfiles?.forEach((profile) => {
    if (profile.location) {
      const existing = locationsMap.get(profile.location)

      if (existing) {
        locationsMap.set(profile.location, { ...existing, count: existing.count + 1 })
      } else {
        locationsMap.set(profile.location, { location: profile.location, count: 1 })
      }
    }
  })

  // Convert map to array and sort by count
  const locations = Array.from(locationsMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  return {
    developers: processedDevelopers,
    skills,
    locations,
  }
}
