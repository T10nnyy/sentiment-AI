"use client"

import type React from "react"
import { TrendingUp, TrendingDown, Meh } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { SentimentResult } from "@/types/sentiment"

interface ResultDisplayProps {
  result: SentimentResult
  isLive?: boolean
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLive = false }) => {
  const getSentimentIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "positive":
        return TrendingUp
      case "negative":
        return TrendingDown
      default:
        return Meh
    }
  }

  const getSentimentColor = (label: string) => {
    switch (label.toLowerCase()) {
      case "positive":
        return "text-green-600"
      case "negative":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getSentimentBg = (label: string) => {
    switch (label.toLowerCase()) {
      case "positive":
        return "bg-green-50 border-green-200"
      case "negative":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getProgressColor = (label: string) => {
    switch (label.toLowerCase()) {
      case "positive":
        return "bg-green-500"
      case "negative":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const Icon = getSentimentIcon(result.label)
  const confidence = Math.round(result.score * 100)

  return (
    <div className={`p-4 rounded-lg border ${getSentimentBg(result.label)} ${isLive ? "opacity-75" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className={`w-5 h-5 ${getSentimentColor(result.label)}`} />
          <span className={`font-semibold text-lg ${getSentimentColor(result.label)}`}>
            {result.label.charAt(0).toUpperCase() + result.label.slice(1)}
          </span>
          {isLive && <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">LIVE</span>}
        </div>
        <span className={`text-2xl font-bold ${getSentimentColor(result.label)}`}>{confidence}%</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Confidence</span>
          <span>{confidence}%</span>
        </div>
        <Progress value={confidence} className="h-2" />
      </div>

      {result.processing_time && (
        <div className="mt-3 text-xs text-gray-500">Processing time: {result.processing_time.toFixed(3)}s</div>
      )}
    </div>
  )
}

export default ResultDisplay
