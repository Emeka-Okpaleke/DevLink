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
import { ChatProvider } from "@/lib/chat-context"
import { ErrorBoundary } from "@/components/error-boundary"

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`} suppressHydrationWarning>
        <SupabaseProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <ChatProvider>
              <ErrorBoundary>
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <AuthDebug />
                <Toaster />
              </ErrorBoundary>
            </ChatProvider>
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
