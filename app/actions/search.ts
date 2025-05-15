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
  error?: string
}

export async function searchDevelopers(
  query = "",
  selectedSkills: string[] = [],
  selectedLocation = "",
  page = 1,
  limit = 12,
): Promise<SearchResult> {
  try {
    // Properly await the Supabase client initialization
    const supabase = await createServerClient()
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
    const { data: developers, error: developersError } = await developersQuery
      .order("username")
      .range(offset, offset + limit - 1)

    if (developersError) {
      console.error("Error fetching developers:", developersError)
      return { developers: [], skills: [], locations: [] }
    }

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

    // Instead of making separate queries for skills and locations, let's use cached data if available
    // or make simpler queries with limits to avoid rate limiting

    // Get popular skills with a simplified query and limit
    const { data: topSkills, error: skillsError } = await supabase
      .from("skills")
      .select(`
      id,
      name,
      user_skills_aggregate (
        count
      )
    `)
      .order("user_skills_aggregate(count)", { ascending: false })
      .limit(15)

    let skills = []
    if (skillsError) {
      console.error("Error fetching skills:", skillsError)
    } else {
      skills = topSkills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        count: skill.user_skills_aggregate?.count || 0,
      }))
    }

    // Get popular locations with a simplified query
    const { data: topLocations, error: locationsError } = await supabase
      .from("profiles")
      .select("location")
      .not("location", "is", null)
      .eq("is_public", true)
      .limit(100) // Get a reasonable sample size

    let locations = []
    if (locationsError) {
      console.error("Error fetching locations:", locationsError)
    } else {
      // Process locations data manually from the sample
      const locationsMap = new Map<string, { location: string; count: number }>()

      topLocations?.forEach((profile) => {
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
      locations = Array.from(locationsMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 15)
    }

    return {
      developers: processedDevelopers,
      skills,
      locations,
    }
  } catch (error) {
    // Improved error handling
    console.error("Error in searchDevelopers:", error)

    // Check if it's a rate limiting error
    if (error instanceof Error && error.message.includes("Too Many")) {
      console.error("Rate limiting detected. Please try again later.")
    }

    return {
      developers: [],
      skills: [],
      locations: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
