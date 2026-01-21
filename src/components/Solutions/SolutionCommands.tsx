import React, { useState, useEffect, useRef } from "react"
import { HelpCircle, LogOut, Eye, EyeOff, Camera, Bug, RotateCcw, Command } from "lucide-react"

interface SolutionCommandsProps {
  extraScreenshots: any[]
  onTooltipVisibilityChange?: (visible: boolean, height: number) => void
}

const SolutionCommands: React.FC<SolutionCommandsProps> = ({
  extraScreenshots,
  onTooltipVisibilityChange
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (onTooltipVisibilityChange) {
      let tooltipHeight = 0
      if (tooltipRef.current && isTooltipVisible) {
        tooltipHeight = tooltipRef.current.offsetHeight + 10 // Adjust if necessary
      }
      onTooltipVisibilityChange(isTooltipVisible, tooltipHeight)
    }
  }, [isTooltipVisible, onTooltipVisibilityChange])

  const handleMouseEnter = () => {
    setIsTooltipVisible(true)
  }

  const handleMouseLeave = () => {
    setIsTooltipVisible(false)
  }

  return (
    <div className="pt-2 w-fit">
      <div className="flex items-center gap-1 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-full p-1 shadow-2xl">
        {/* Visibility Toggle - Minimal */}
        <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-full transition-all cursor-pointer interactive group">
          <Eye className="w-3.5 h-3.5 text-white/40 group-hover:text-white" />
          <div className="flex gap-1">
            <kbd className="bg-white/5 border border-white/5 rounded px-1.5 py-0.5 text-[9px] text-white/20 group-hover:text-white/40 font-mono">⌘B</kbd>
          </div>
        </div>

        <div className="w-px h-3 bg-white/5 mx-0.5" />

        {/* Screenshot Action - Minimal */}
        <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-full transition-all cursor-pointer interactive group">
          <Camera className="w-3.5 h-3.5 text-white/40 group-hover:text-white" />
          <div className="flex gap-1">
            <kbd className="bg-white/5 border border-white/5 rounded px-1.5 py-0.5 text-[9px] text-white/20 group-hover:text-white/40 font-mono">⌘H</kbd>
          </div>
        </div>

        {extraScreenshots.length > 0 && (
          <>
            <div className="w-px h-3 bg-white/5 mx-0.5" />
            {/* Debug Action - Minimal */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer interactive group">
              <Bug className="w-3.5 h-3.5 text-white" />
              <div className="flex gap-1">
                <kbd className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-white/60 font-mono">⌘↵</kbd>
              </div>
            </div>
          </>
        )}

        <div className="w-px h-3 bg-white/5 mx-0.5" />

        {/* Reset Action - Minimal */}
        <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-full transition-all cursor-pointer interactive group">
          <RotateCcw className="w-3.5 h-3.5 text-white/40 group-hover:text-white" />
          <div className="flex gap-1">
            <kbd className="bg-white/5 border border-white/5 rounded px-1.5 py-0.5 text-[9px] text-white/20 group-hover:text-white/40 font-mono">⌘R</kbd>
          </div>
        </div>

        <div className="w-px h-3 bg-white/5 mx-0.5" />

        {/* Shortcuts Help - Minimal */}
        <div
          className="relative flex items-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-white/20 hover:text-white hover:bg-white/5 transition-all">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {isTooltipVisible && (
            <div
              ref={tooltipRef}
              className="absolute bottom-full right-0 mb-3 w-48 pointer-events-none z-[100]"
            >
              <div className="p-3 bg-black/95 backdrop-blur-2xl rounded-2xl border border-white/10 text-white/40 text-[10px] shadow-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span>Toggle</span>
                  <span className="font-mono">⌘B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Capture</span>
                  <span className="font-mono">⌘H</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Reset</span>
                  <span className="font-mono">⌘R</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-3 bg-white/5 mx-0.5" />

        {/* Quit - Minimal */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full text-white/10 hover:text-red-400 hover:bg-red-400/10 transition-all"
          title="Sign Out"
          onClick={() => window.electronAPI.quitApp()}
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default SolutionCommands
