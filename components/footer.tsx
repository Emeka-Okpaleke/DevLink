import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} DevLink. All rights reserved.</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
