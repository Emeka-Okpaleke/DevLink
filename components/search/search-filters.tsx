"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"

interface SearchFiltersProps {
  skills: Array<{ id: string; name: string; count: number }>
  locations: Array<{ location: string; count: number }>
  selectedSkills: string[]
  selectedLocation: string
  query: string
}

export function SearchFilters({ skills, locations, selectedSkills, selectedLocation, query }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(query)
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [skillsFilter, setSkillsFilter] = useState<string[]>(selectedSkills)
  const [locationFilter, setLocationFilter] = useState(selectedLocation)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams)

    if (debouncedQuery) {
      params.set("q", debouncedQuery)
    } else {
      params.delete("q")
    }

    if (skillsFilter.length > 0) {
      params.delete("skills")
      skillsFilter.forEach((skill) => {
        params.append("skills", skill)
      })
    } else {
      params.delete("skills")
    }

    if (locationFilter) {
      params.set("location", locationFilter)
    } else {
      params.delete("location")
    }

    // Reset to page 1 when filters change
    params.delete("page")

    router.push(`/search?${params.toString()}`)
  }, [debouncedQuery, skillsFilter, locationFilter, router, searchParams])

  const handleSkillToggle = (skillId: string) => {
    setSkillsFilter((prev) => (prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]))
  }

  const handleLocationSelect = (location: string) => {
    setLocationFilter((prev) => (prev === location ? "" : location))
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSkillsFilter([])
    setLocationFilter("")
  }

  const hasActiveFilters = debouncedQuery || skillsFilter.length > 0 || locationFilter

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search developers..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Active filters</p>
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Skills filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill.id}
                  variant={skillsFilter.includes(skill.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleSkillToggle(skill.id)}
                >
                  {skill.name} ({skill.count})
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No skills available</p>
          )}
        </CardContent>
      </Card>

      {/* Location filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Locations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {locations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {locations.map((loc) => (
                <Badge
                  key={loc.location}
                  variant={locationFilter === loc.location ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleLocationSelect(loc.location)}
                >
                  {loc.location} ({loc.count})
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No locations available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
