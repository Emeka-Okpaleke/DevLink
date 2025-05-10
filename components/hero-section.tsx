import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="py-20 md:py-32 flex flex-col items-center text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">Connect, Showcase, Grow</h1>
      <p className="text-xl text-muted-foreground mb-12 max-w-3xl">
        DevLink is the platform where developers showcase their work, build their portfolio, and connect with other
        talented professionals.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg">
          <Link href="/signup">Create Your Portfolio</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/explore">Explore Developers</Link>
        </Button>
      </div>
    </section>
  )
}
