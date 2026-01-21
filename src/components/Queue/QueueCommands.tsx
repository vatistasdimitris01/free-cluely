import React, { useState, useEffect, useRef } from "react"
import { Sparkles, Settings, ChevronUp } from "lucide-react"

interface QueueCommandsProps {
  onTooltipVisibilityChange: (visible: boolean, height: number) => void
  screenshots: Array<{ path: string; preview: string }>
  onChatToggle: () => void
  onSettingsToggle: () => void
  isChatOpen: boolean
  isGenerating?: boolean
  onAbort?: () => void
}

  const QueueCommands: React.FC<QueueCommandsProps> = ({
  onTooltipVisibilityChange,
  screenshots: _screenshots,
  onChatToggle,
  onSettingsToggle,
  isChatOpen,
  isGenerating,
  onAbort
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let tooltipHeight = 0
    if (tooltipRef.current && isTooltipVisible) {
      tooltipHeight = tooltipRef.current.offsetHeight + 10
    }
    onTooltipVisibilityChange(isTooltipVisible, tooltipHeight)

    // Automatically hide tooltip after 2 seconds
    if (isTooltipVisible) {
      const timer = setTimeout(() => {
        setIsTooltipVisible(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isTooltipVisible])

  const handleDragStart = () => {
    window.electronAPI.invoke('start-drag')
  }

  return (
    <div className="w-fit flex flex-col items-center gap-2">
      {/* Main Control Bar - Unified Pill Design */}
      <div 
        className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-[#333333]/70 backdrop-blur-md border border-white/10 rounded-full p-1.5 shadow-2xl draggable-area h-[42px] transition-all duration-300"
      >
        {/* Settings Button (Icon) - Left */}
        <button 
          onClick={onSettingsToggle}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-transparent transition-colors duration-200 group"
          title="Settings"
        >
          <Settings className="w-4 h-4 text-white/60 group-hover:text-white transition-colors duration-200" />
        </button>

        {/* Middle Action: Ask or Hide */}
        <button 
          onClick={onChatToggle}
          className={`flex items-center gap-1.5 px-4 h-7 rounded-full font-bold text-[11px] shadow-lg border border-white/5 transition-all duration-200 ${
            !isChatOpen 
              ? "bg-[#0047AB] text-white hover:bg-[#005AE2]" 
              : "bg-[#2A2A2A] text-white/90 hover:bg-[#3A3A3A] hover:text-white"
          }`}
        >
          {!isChatOpen ? (
            <>
              <Sparkles className="w-3 h-3 fill-white" />
              <span>Ask</span>
            </>
          ) : (
            <>
              <ChevronUp className="w-3 h-3" />
              <span>Hide</span>
            </>
          )}
        </button>

        {/* Right Action: Abort */}
        {isGenerating && (
          <button 
            onClick={onAbort}
            className={`w-7 h-7 flex items-center justify-center rounded-full bg-[#2A2A2A] border border-white/5 transition-all duration-200 hover:bg-[#3A3A3A] group`}
            title="Abort Generation"
          >
            <div className={`w-2 h-2 rounded-sm bg-white/80 group-hover:bg-white transition-colors`} />
          </button>
        )}
      </div>
    </div>
  )
}

export default QueueCommands

