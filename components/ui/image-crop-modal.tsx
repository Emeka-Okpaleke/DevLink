"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, Move } from "lucide-react"

interface ImageCropModalProps {
  open: boolean
  onClose: () => void
  imageSrc: string
  onCropComplete: (croppedImageBlob: Blob) => void
}

export function ImageCropModal({ open, onClose, imageSrc, onCropComplete }: ImageCropModalProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [open])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    // Apply boundaries to prevent image from being dragged too far
    if (containerRef.current && imgRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const imgRect = imgRef.current.getBoundingClientRect()

      const scaledImgWidth = imgRect.width * scale
      const scaledImgHeight = imgRect.height * scale

      const maxX = Math.max(0, (scaledImgWidth - containerRect.width) / 2)
      const maxY = Math.max(0, (scaledImgHeight - containerRect.height) / 2)

      const boundedX = Math.max(-maxX, Math.min(maxX, newX))
      const boundedY = Math.max(-maxY, Math.min(maxY, newY))

      setPosition({ x: boundedX, y: boundedY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleComplete = () => {
    if (!imgRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Calculate dimensions
    const img = imgRef.current
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    // Set canvas size to match the visible cropped circle
    const size = Math.min(containerRect.width, containerRect.height)
    canvas.width = size
    canvas.height = size

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Create circular clip
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()

    // Calculate source dimensions and position
    const imgWidth = img.naturalWidth
    const imgHeight = img.naturalHeight
    const imgAspect = imgWidth / imgHeight
    const containerAspect = containerRect.width / containerRect.height

    let sourceWidth, sourceHeight

    if (imgAspect > containerAspect) {
      sourceHeight = imgHeight
      sourceWidth = imgHeight * containerAspect
    } else {
      sourceWidth = imgWidth
      sourceHeight = imgWidth / containerAspect
    }

    // Compensate for scaling and position
    const scaledSourceWidth = sourceWidth / scale
    const scaledSourceHeight = sourceHeight / scale

    // Center source coordinates
    const sourceX =
      (imgWidth - scaledSourceWidth) / 2 - (position.x / (containerRect.width / 2)) * (scaledSourceWidth / 2)
    const sourceY =
      (imgHeight - scaledSourceHeight) / 2 - (position.y / (containerRect.height / 2)) * (scaledSourceHeight / 2)

    // Draw the image on the canvas
    try {
      ctx.drawImage(img, sourceX, sourceY, scaledSourceWidth, scaledSourceHeight, 0, 0, size, size)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            onCropComplete(blob)
          }
        },
        "image/jpeg",
        0.9,
      )
    } catch (error) {
      console.error("Error drawing image to canvas:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crop Profile Photo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <div
            ref={containerRef}
            className="relative w-[300px] h-[300px] overflow-hidden rounded-full border-2 border-muted cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <img
                ref={imgRef}
                src={imageSrc || "/placeholder.svg"}
                alt="Crop preview"
                className="transform origin-center select-none pointer-events-none"
                style={{
                  transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                }}
                crossOrigin="anonymous"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute inset-0 border-[150px] border-black/50 rounded-full"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-50 pointer-events-none">
              <Move size={24} />
            </div>
          </div>

          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Zoom</span>
            </div>
            <div className="flex items-center space-x-2">
              <ZoomOut className="h-4 w-4" />
              <Slider
                value={[scale]}
                min={1}
                max={3}
                step={0.01}
                onValueChange={(value) => setScale(value[0])}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4" />
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleComplete}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
