'use client'

import { useState } from 'react'
import { Play, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoPlayerProps {
  videoUrl: string | null
  productName: string
}

export function VideoPlayer({ videoUrl, productName }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!videoUrl) {
    return null
  }

  const handlePlay = () => {
    setIsPlaying(true)
    setIsLoading(true)
    setError(null)
  }

  const handleLoadedData = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setError('Failed to load video')
    setIsLoading(false)
    setIsPlaying(false)
  }

  return (
    <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden">
      {!isPlaying ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={handlePlay}
            size="lg"
            className="rounded-full h-20 w-20"
          >
            <Play className="h-10 w-10 ml-1" />
          </Button>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
              <p className="text-destructive">{error}</p>
            </div>
          )}
          <video
            src={videoUrl}
            controls
            className="w-full h-full"
            onLoadedData={handleLoadedData}
            onError={handleError}
          >
            Your browser does not support the video tag.
          </video>
        </>
      )}
    </div>
  )
}

