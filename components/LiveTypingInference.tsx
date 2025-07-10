"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Zap, TrendingUp, TrendingDown, MessageSquare } from "lucide-react"
import { useSentiment } from "@/hooks/useSentiment"
import { useDebounce } from "@/hooks/useDebounce"
import type { SentimentResult } from "@/types/sentiment"

export function LiveTypingInference() {
  const [text, setText] = useState("")
  const [result, setResult] = useState<SentimentResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { analyzeSentiment, error } = useSentiment()

  // Debounce the text input to avoid too many API calls
  const debouncedText = useDebounce(text, 1000)

  useEffect(() => {
    const analyzeText = async () => {
      if (!debouncedText.trim() || debouncedText.length < 10) {
        setResult(null)
        return
      }

      setIsAnalyzing(true)
      try {
        const analysisResult = await analyzeSentiment(debouncedText)
        setResult(analysisResult)
      } catch (err) {
        console.error("Live analysis failed:", err)
        setResult(null)
      } finally {
        setIsAnalyzing(false)
      }
    }

    analyzeText()
  }, [debouncedText, analyzeSentiment])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-500"
      case "negative":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return <TrendingUp className="h-4 w-4" />
      case "negative":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Live Sentiment Analysis
          </CardTitle>
          <CardDescription>Start typing to see real-time sentiment analysis (minimum 10 characters)</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Start typing your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px]"
          />

          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>Characters: {text.length}</span>
            {isAnalyzing && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Analyzing...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              {getSentimentIcon(result.sentiment)}
              Live Analysis Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sentiment:</span>
              <Badge className={`${getSentimentColor(result.sentiment)} text-white`}>
                {result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1)}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Confidence:</span>
                <span className="font-medium">{(result.confidence * 100).toFixed(1)}%</span>
              </div>
              <Progress value={result.confidence * 100} className="h-2" />
            </div>

            {result.scores && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Score Breakdown:</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(result.scores).map(([label, score]) => (
                    <div key={label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize font-medium">{label}</span>
                        <span>{(score * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={score * 100} className="h-1" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {text.length > 0 && text.length < 10 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <p className="text-yellow-600 dark:text-yellow-400 text-sm">
              Please enter at least 10 characters for analysis
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
