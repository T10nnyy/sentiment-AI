"use client"

import type React from "react"
import { useState } from "react"
import { Send, Loader2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useSentimentPrediction } from "@/hooks/useSentiment"
import { useSentimentStore } from "@/lib/store"
import ResultDisplay from "./ResultDisplay"

const SentimentAnalyzer: React.FC = () => {
  const [text, setText] = useState("")
  const { predict, predictLive, liveResult, isLoading } = useSentimentPrediction()
  const { currentResult, enableLiveTyping } = useSentimentStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    try {
      await predict(text)
    } catch (error) {
      console.error("Prediction failed:", error)
    }
  }

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
          <CardTitle className="flex items-center">
            <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
            Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Enter text to analyze sentiment..."
                className="min-h-[120px]"
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {text.length} characters
                {enableLiveTyping && " • Live typing enabled"}
              </div>
              <Button type="submit" disabled={!text.trim() || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Live Result */}
      {enableLiveTyping && liveResult && (
        <Card className="max-w-4xl mx-auto border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-sm text-blue-700">Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultDisplay result={liveResult} isLive />
          </CardContent>
        </Card>
      )}

      {/* Main Result */}
      {currentResult && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultDisplay result={currentResult} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SentimentAnalyzer
