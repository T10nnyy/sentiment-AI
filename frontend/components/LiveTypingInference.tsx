"use client"

/**
 * Live typing inference component with debounced predictions
 */

import React, { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, ZapOff, TrendingUp, TrendingDown } from "lucide-react"
import { useSentimentStore } from "@/lib/store"
import { useSentimentPrediction } from "@/hooks/useSentiment"
import { getSentimentColor, isLiveTypingEnabled } from "@/lib/utils"
import Button from "@/components/ui/Button"

interface LiveTypingInferenceProps {
  text: string
}

const LiveTypingInference: React.FC<LiveTypingInferenceProps> = ({ text }) => {
  const { enableLiveTyping, setEnableLiveTyping } = useSentimentStore()
  const { predictLive, liveResult } = useSentimentPrediction()

  // Initialize live typing based on environment variable
  useEffect(() => {
    if (isLiveTypingEnabled() && !enableLiveTyping) {
      setEnableLiveTyping(true)
    }
  }, [enableLiveTyping, setEnableLiveTyping])

  // Trigger live prediction when text changes
  useEffect(() => {
    if (enableLiveTyping && text.trim().length > 3) {
      predictLive(text)
    }
  }, [text, enableLiveTyping, predictLive])

  const getSentimentIcon = (label: string) => {
    return label === "positive" ? TrendingUp : TrendingDown
  }

  return (
    <div className="space-y-4">
      {/* Toggle Switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Typing Inference</span>
        </div>

        <Button
          variant={enableLiveTyping ? "primary" : "outline"}
          size="sm"
          onClick={() => setEnableLiveTyping(!enableLiveTyping)}
          icon={enableLiveTyping ? <Zap className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
        >
          {enableLiveTyping ? "Enabled" : "Disabled"}
        </Button>
      </div>

      {/* Live Result Display */}
      <AnimatePresence>
        {enableLiveTyping && liveResult && text.trim().length > 3 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Live Preview</span>
              </div>

              <div className="flex items-center space-x-2">
                {React.createElement(getSentimentIcon(liveResult.label), {
                  className: `w-4 h-4 ${getSentimentColor(liveResult.label)}`,
                })}
                <span className={`text-sm font-medium ${getSentimentColor(liveResult.label)}`}>
                  {liveResult.label.charAt(0).toUpperCase() + liveResult.label.slice(1)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{(liveResult.score * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${liveResult.score * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className={`h-1 rounded-full ${liveResult.label === "positive" ? "bg-green-500" : "bg-red-500"}`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper Text */}
      {enableLiveTyping && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Type at least 4 characters to see live predictions. Results update with a 500ms delay.
        </p>
      )}
    </div>
  )
}

export default LiveTypingInference
