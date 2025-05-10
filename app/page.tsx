import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HeroSection } from "@/components/hero-section"
import { FeatureSection } from "@/components/feature-section"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />
      <FeatureSection />
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to showcase your skills?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join our community of developers, create your portfolio, and connect with like-minded professionals.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/explore">Explore Developers</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
