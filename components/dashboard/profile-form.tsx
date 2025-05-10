"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase/client"
import { ImageCropModal } from "@/components/ui/image-crop-modal"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface ProfileFormProps {
  profile: Profile | null
}

export function ProfileForm({ profile }: ProfileFormProps) {
  // Add this right after the ProfileForm function declaration, before the useState calls
  console.log("ProfileForm received profile:", profile)

  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    website: profile?.website || "",
    location: profile?.location || "",
    is_public: profile?.is_public ?? true,
  })
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_public: checked }))
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "File must be an image",
        variant: "destructive",
      })
      return
    }

    // Create a URL for the image to display in the crop modal
    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)
    setCropModalOpen(true)

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!profile) return

    setCropModalOpen(false)
    setUploadingImage(true)

    try {
      // Generate a unique file name
      const fileName = `${profile.id}-${Date.now()}.jpg`
      const filePath = `avatars/${fileName}`

      // Upload directly to Supabase Storage without trying to create the bucket
      const { error: uploadError, data } = await supabase.storage.from("profiles").upload(filePath, croppedImageBlob, {
        upsert: true,
        contentType: "image/jpeg",
      })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw new Error(uploadError.message || "Failed to upload image")
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("profiles").getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id)

      if (updateError) {
        console.error("Profile update error:", updateError)
        throw new Error(updateError.message || "Failed to update profile")
      }

      // Update local state
      setAvatarUrl(publicUrl)

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
        variant: "success",
      })

      // Force a full page refresh to update the navbar avatar
      window.location.reload()
    } catch (error: any) {
      console.error("Avatar update error:", error)

      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
      // Clean up the object URL
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage)
        setSelectedImage(null)
      }
    }
  }

  // New function to test basic file upload
  const testFileUpload = async () => {
    if (!profile) return

    setTestResult(null)
    setLoading(true)

    try {
      // Create a simple test file (1x1 transparent pixel)
      const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
      const byteCharacters = atob(base64Data)
      const byteArrays = []

      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i))
      }

      const byteArray = new Uint8Array(byteArrays)
      const testBlob = new Blob([byteArray], { type: "image/png" })

      // Generate a test file name
      const testFileName = `test-${profile.id}-${Date.now()}.png`
      const testFilePath = `test/${testFileName}`

      // Try to upload the test file
      const { data, error: uploadError } = await supabase.storage.from("profiles").upload(testFilePath, testBlob, {
        upsert: true,
        contentType: "image/png",
      })

      if (uploadError) {
        console.error("Test upload error:", uploadError)
        throw uploadError
      }

      // Try to get the URL
      const { data: urlData } = supabase.storage.from("profiles").getPublicUrl(testFilePath)

      setTestResult({
        success: true,
        message: `Test successful! File uploaded to: ${urlData.publicUrl}`,
      })

      toast({
        title: "Test successful",
        description: "Basic file upload works correctly",
        variant: "success",
      })
    } catch (error: any) {
      console.error("Test failed:", error)

      setTestResult({
        success: false,
        message: `Test failed: ${error.message || "Unknown error"}`,
      })

      toast({
        title: "Test failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!profile?.id) {
        throw new Error("Profile ID is missing")
      }

      // Check if username is available (if changed)
      if (formData.username !== profile?.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", formData.username)
          .neq("id", profile.id) // Exclude current user
          .single()

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Error checking username:", checkError)
          throw new Error("Error checking username availability")
        }

        if (existingUser) {
          toast({
            title: "Username already taken",
            description: "Please choose a different username",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
      }

      console.log("Updating profile with ID:", profile.id)
      console.log("Form data:", formData)

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
          website: formData.website,
          location: formData.location,
          is_public: formData.is_public,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) {
        console.error("Profile update error:", error)
        throw error
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
        variant: "success",
      })

      // Force a refresh to ensure the UI updates
      router.refresh()
    } catch (error: any) {
      console.error("Profile update error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your profile information visible to other developers</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={formData.username} />
                <AvatarFallback className="text-2xl">{formData.username.charAt(0).toUpperCase()}</AvatarFallback>
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                  <Camera className="h-4 w-4" />
                </div>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={uploadingImage}
              />
            </div>
            <p className="text-sm text-muted-foreground">Click to upload and crop a profile picture</p>
          </div>

          {/* Test Upload Button */}
          <div className="border border-dashed border-gray-300 rounded-md p-4 bg-gray-50 dark:bg-gray-900">
            <h3 className="text-sm font-medium mb-2">Storage Upload Test</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Click the button below to test basic file upload functionality
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={testFileUpload}
              disabled={loading || !profile}
              className="w-full"
            >
              {loading ? "Testing..." : "Run Storage Test"}
            </Button>

            {testResult && (
              <div
                className={`mt-3 p-3 text-sm rounded-md ${
                  testResult.success
                    ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              type="url"
              placeholder="https://yourwebsite.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="is_public" checked={formData.is_public} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="is_public">Public Profile</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>

      {/* Image Crop Modal */}
      {selectedImage && (
        <ImageCropModal
          open={cropModalOpen}
          onClose={() => {
            setCropModalOpen(false)
            if (selectedImage) {
              URL.revokeObjectURL(selectedImage)
              setSelectedImage(null)
            }
          }}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
        />
      )}
    </Card>
  )
}
