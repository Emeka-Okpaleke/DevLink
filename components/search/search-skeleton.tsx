import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Skeleton className="h-20 w-20 rounded-full mb-4" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-4 w-40 mb-3" />
              <Skeleton className="h-12 w-full mb-4" />
              <div className="flex flex-wrap justify-center gap-1 mb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 px-6 py-3">
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
