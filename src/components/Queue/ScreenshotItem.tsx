import React from "react"
import { X, Loader2 } from "lucide-react"

interface Screenshot {
  path: string
  preview: string
}

interface ScreenshotItemProps {
  screenshot: Screenshot
  onDelete: (index: number) => void
  index: number
  isLoading: boolean
}

const ScreenshotItem: React.FC<ScreenshotItemProps> = ({
  screenshot,
  onDelete,
  index,
  isLoading
}) => {
  const handleDelete = async () => {
    await onDelete(index)
  }

  return (
    <div className={`relative group aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/20 shadow-lg transition-all duration-300 ${isLoading ? 'opacity-70' : 'hover:border-white/20 hover:scale-[1.02]'}`}>
      <div className="w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 bg-[#1a1b1e]/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
        <img
          src={screenshot.preview}
          alt={`Screenshot ${index + 1}`}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoading
              ? "scale-110 grayscale"
              : "cursor-default group-hover:scale-110"
          }`}
        />
        
        {/* Overlay gradient */}
        {!isLoading && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>

      {!isLoading && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 hover:scale-110 shadow-lg translate-y-[-4px] group-hover:translate-y-0"
          aria-label="Delete screenshot"
        >
          <X size={14} />
        </button>
      )}

      {/* Index indicator */}
      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-md text-[10px] text-white/70 font-medium border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        #{index + 1}
      </div>
    </div>
  )
}

export default ScreenshotItem
