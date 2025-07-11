"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, RotateCcw } from "lucide-react"
import { useSentimentPrediction, useAnalysisHistory } from "@/hooks/useSentiment"
import { formatSentimentLabel, getSentimentColor, formatConfidence, formatProcessingTime } from "@/lib/utils"

export default function SentimentAnalyzer() {
  const [text, setText] = useState("")
  const [useGraphQL, setUseGraphQL] = useState(false)
  const { result, loading, error, predict, reset } = useSentimentPrediction()
  const { addToHistory } = useAnalysisHistory()

  const handleAnalyze = async () => {
    if (!text.trim()) return

    const analysisResult = await predict(text, useGraphQL)
    if (analysisResult) {
      addToHistory(analysisResult)
    }
  }

  const handleReset = () => {
    setText("")
    reset()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleAnalyze()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Sentiment Analysis
          </CardTitle>
          <CardDescription>Analyze the sentiment of your text using our advanced AI model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="text-input" className="text-sm font-medium">
              Enter your text
            </label>
            <Textarea
              id="text-input"
              placeholder="Type or paste your text here... (Ctrl+Enter to analyze)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[120px] resize-none"
              disabled={loading}
            />
            <div className="text-xs text-muted-foreground">{text.length} characters • Press Ctrl+Enter to analyze</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use-graphql"
                checked={useGraphQL}
                onChange={(e) => setUseGraphQL(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="use-graphql" className="text-sm">
                Use GraphQL API
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAnalyze} disabled={!text.trim() || loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Analyze Sentiment
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

          {result && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Analysis Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Sentiment</label>
                    <Badge className={getSentimentColor(result.sentiment.label)}>
                      {formatSentimentLabel(result.sentiment.label)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Confidence</label>
                    <div className="text-lg font-semibold">{formatConfidence(result.confidence)}</div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Processing Time</label>
                    <div className="text-sm text-muted-foreground">{formatProcessingTime(result.processing_time)}</div>
                  </div>
                </div>

                {result.scores && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">All Scores</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {Object.entries(result.scores).map(([label, score]) => (
                        <div key={label} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{formatSentimentLabel(label)}</span>
                          <span className="text-sm">{formatConfidence(score)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Analyzed Text</label>
                  <div className="p-3 bg-gray-50 rounded-md text-sm">{result.text}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
