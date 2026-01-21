import React from "react"
import ScreenshotItem from "./ScreenshotItem"

interface Screenshot {
  path: string
  preview: string
}

interface ScreenshotQueueProps {
  isLoading: boolean
  screenshots: Screenshot[]
  onDeleteScreenshot: (index: number) => void
}
const ScreenshotQueue: React.FC<ScreenshotQueueProps> = ({
  isLoading,
  screenshots,
  onDeleteScreenshot
}) => {
  if (screenshots.length === 0) {
    return <></>
  }

  const displayScreenshots = screenshots.slice(0, 5)

  return (
    <div className="flex flex-wrap gap-3">
      {displayScreenshots.map((screenshot, index) => (
        <div key={screenshot.path} className="w-[calc(20%-10px)] min-w-[120px]">
          <ScreenshotItem
            isLoading={isLoading}
            screenshot={screenshot}
            index={index}
            onDelete={onDeleteScreenshot}
          />
        </div>
      ))}
    </div>
  )
}

export default ScreenshotQueue
