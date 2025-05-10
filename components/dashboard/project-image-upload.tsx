"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase/client"
import { Upload, X } from "lucide-react"

interface ProjectImageUploadProps {
  projectId: string
  currentImageUrl: string | null
  onImageUploaded: (url: string) => void
}

export function ProjectImageUpload({ projectId, currentImageUrl, onImageUploaded }: ProjectImageUploadProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setUploadError(null)

      if (!e.target.files || e.target.files.length === 0) {
        throw new Error("You must select an image to upload.")
      }

      const file = e.target.files[0]

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB")
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image")
      }

      const fileExt = file.name.split(".").pop()
      const fileName = `${projectId}-${Date.now()}`
      const filePath = `${fileName}.${fileExt}`

      // Upload directly to the project-images bucket
      // We assume the bucket exists since we created it via SQL
      console.log("Uploading file to path:", filePath)
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("project-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)

        // If the error is about the bucket not existing, provide a clearer message
        if (uploadError.message.includes("bucket") && uploadError.message.includes("not found")) {
          throw new Error("The project-images storage bucket doesn't exist. Please contact an administrator.")
        }

        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get the public URL
      const { data } = supabase.storage.from("project-images").getPublicUrl(filePath)

      if (!data || !data.publicUrl) {
        throw new Error("Failed to get public URL for uploaded image")
      }

      console.log("Upload successful, public URL:", data.publicUrl)
      onImageUploaded(data.publicUrl)

      toast({
        title: "Image uploaded",
        description: "Your project image has been uploaded successfully.",
      })
    } catch (error: any) {
      const errorMessage = error?.message || "There was an error uploading your image"
      console.error("Error uploading image:", error)
      setUploadError(errorMessage)
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    onImageUploaded("")
    setUploadError(null)
  }

  return (
    <div className="space-y-4">
      {currentImageUrl ? (
        <div className="relative">
          <img
            src={currentImageUrl || "/placeholder.svg"}
            alt="Project preview"
            className="w-full h-48 object-cover rounded-md"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center">
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">Drag and drop an image, or click to browse</p>
            <input
              type="file"
              id="project-image"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              disabled={uploading}
              onClick={() => document.getElementById("project-image")?.click()}
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </Button>
            {uploadError && <p className="text-sm text-destructive mt-2">{uploadError}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
