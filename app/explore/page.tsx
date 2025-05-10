import { createServerClient } from "@/lib/supabase/server"
import { DeveloperGrid } from "@/components/explore/developer-grid"
import { SearchFilters } from "@/components/explore/search-filters"

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createServerClient()

  const search = typeof searchParams.search === "string" ? searchParams.search : ""
  const skill = typeof searchParams.skill === "string" ? searchParams.skill : ""
  const location = typeof searchParams.location === "string" ? searchParams.location : ""

  let query = supabase
    .from("profiles")
    .select(`
      *,
      user_skills!inner (
        skills (*)
      )
    `)
    .eq("is_public", true)

  if (search) {
    query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  if (location) {
    query = query.ilike("location", `%${location}%`)
  }

  if (skill) {
    query = query.eq("user_skills.skills.name", skill)
  }

  const { data: developers } = await query.limit(20)

  // Get all skills for filter dropdown
  const { data: skills } = await supabase.from("skills").select("name").order("name")

  // Get all locations for filter dropdown
  const { data: locations } = await supabase
    .from("profiles")
    .select("location")
    .not("location", "is", null)
    .eq("is_public", true)
    .order("location")

  // Remove duplicates from locations
  const uniqueLocations = locations ? Array.from(new Set(locations.map((item) => item.location))) : []

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Developers</h1>

      <SearchFilters
        skills={skills?.map((skill) => skill.name) || []}
        locations={uniqueLocations as string[]}
        currentSkill={skill}
        currentLocation={location}
        currentSearch={search}
      />

      <DeveloperGrid developers={developers || []} />
    </div>
  )
}
