import { Suspense } from "react"
import { SearchFilters } from "@/components/search/search-filters"
import { SearchResults } from "@/components/search/search-results"
import { SearchPagination } from "@/components/search/search-pagination"
import { SearchSkeleton } from "@/components/search/search-skeleton"
import { searchDevelopers } from "@/app/actions/search"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const query = typeof searchParams.q === "string" ? searchParams.q : ""
  const skills = Array.isArray(searchParams.skills)
    ? searchParams.skills
    : typeof searchParams.skills === "string"
      ? [searchParams.skills]
      : []
  const location = typeof searchParams.location === "string" ? searchParams.location : ""
  const page = typeof searchParams.page === "string" ? Number.parseInt(searchParams.page) : 1

  try {
    const searchResults = await searchDevelopers(query, skills, location, page)

    // Check if there was an error in the search results
    if ("error" in searchResults && searchResults.error) {
      return (
        <div className="container mx-auto py-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Find Developers</h1>
            <p className="text-red-500">
              {searchResults.error.includes("Too Many")
                ? "We're experiencing high traffic. Please try again in a moment."
                : "An error occurred while loading the search results. Please try again later."}
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Developers</h1>
          <p className="text-muted-foreground text-center max-w-2xl">
            Connect with talented developers based on skills, location, or name
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <SearchFilters
              skills={searchResults.skills}
              locations={searchResults.locations}
              selectedSkills={skills}
              selectedLocation={location}
              query={query}
            />
          </div>
          <div className="lg:col-span-3">
            <Suspense fallback={<SearchSkeleton />}>
              <SearchResults developers={searchResults.developers} />
              {searchResults.developers.length > 0 && (
                <SearchPagination
                  currentPage={page}
                  totalResults={searchResults.developers.length}
                  resultsPerPage={12}
                />
              )}
            </Suspense>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in SearchPage:", error)
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Developers</h1>
          <p className="text-red-500">
            {error instanceof Error && error.message.includes("Too Many")
              ? "We're experiencing high traffic. Please try again in a moment."
              : "An error occurred while loading the search results. Please try again later."}
          </p>
        </div>
      </div>
    )
  }
}
