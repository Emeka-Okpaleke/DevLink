"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface SearchFiltersProps {
  skills: string[]
  locations: string[]
  currentSkill: string
  currentLocation: string
  currentSearch: string
}

export function SearchFilters({ skills, locations, currentSkill, currentLocation, currentSearch }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch)
  const [skill, setSkill] = useState(currentSkill)
  const [location, setLocation] = useState(currentLocation)
  const [debouncedSearch, setDebouncedSearch] = useState(currentSearch)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const params = new URLSearchParams(searchParams)

    if (debouncedSearch) {
      params.set("search", debouncedSearch)
    } else {
      params.delete("search")
    }

    if (skill) {
      params.set("skill", skill)
    } else {
      params.delete("skill")
    }

    if (location) {
      params.set("location", location)
    } else {
      params.delete("location")
    }

    router.push(`/explore?${params.toString()}`)
  }, [debouncedSearch, skill, location, router, searchParams])

  const handleClearFilters = () => {
    setSearch("")
    setSkill("")
    setLocation("")
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search developers..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={skill} onValueChange={setSkill}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            {skills.map((skill) => (
              <SelectItem key={skill} value={skill}>
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || skill || location) && (
          <Button variant="ghost" size="icon" onClick={handleClearFilters}>
            <X className="h-4 w-4" />
            <span className="sr-only">Clear filters</span>
          </Button>
        )}
      </div>
    </div>
  )
}
