import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import SupabaseProvider from "@/lib/supabase/client"
import { AuthDebug } from "@/components/auth-debug"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DevLink - Developer Portfolio & Networking",
  description: "Connect with developers and showcase your projects",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <SupabaseProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <AuthDebug />
            <Toaster />
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
