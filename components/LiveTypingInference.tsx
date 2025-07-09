"use client"

import type React from "react"
import { useState } from "react"
import { Zap, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useSentimentPrediction } from "@/hooks/useSentiment"
import { useSentimentStore } from "@/lib/store"
import ResultDisplay from "./ResultDisplay"

const LiveTypingInference: React.FC = () => {
  const [text, setText] = useState("")
  const { predictLive, liveResult } = useSentimentPrediction()
  const { enableLiveTyping, toggleLiveTyping } = useSentimentStore()

  const handleTextChange = (value: string) => {
    setText(value)
    if (enableLiveTyping) {
      predictLive(value)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Zap className="w-6 h-6 text-blue-600 mr-2" />
              Live Typing Inference
            </CardTitle>
            <button
              onClick={toggleLiveTyping}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                enableLiveTyping
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-700 border border-gray-200"
              }`}
            >
              <Activity className={`w-4 h-4 ${enableLiveTyping ? "animate-pulse" : ""}`} />
              <span>{enableLiveTyping ? "Live" : "Disabled"}</span>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Start typing to see real-time sentiment analysis..."
              className="min-h-[150px]"
            />

            <div className="text-sm text-gray-500">
              {text.length} characters
              {enableLiveTyping && " • Analysis updates as you type"}
            </div>
          </div>
        </CardContent>
      </Card>

      {enableLiveTyping && liveResult && text.trim() && (
        <Card className="max-w-4xl mx-auto border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-700 flex items-center">
              <Activity className="w-5 h-5 mr-2 animate-pulse" />
              Live Analysis Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResultDisplay result={liveResult} isLive />
          </CardContent>
        </Card>
      )}

      {!enableLiveTyping && (
        <Card className="max-w-4xl mx-auto border-gray-200 bg-gray-50">
          <CardContent className="text-center py-8">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Live Typing Disabled</h3>
            <p className="text-gray-600">
              Enable live typing in the header to see real-time sentiment analysis as you type.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default LiveTypingInference
