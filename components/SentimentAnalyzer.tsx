"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, MessageSquare, TrendingUp, TrendingDown } from "lucide-react"
import { useSentiment } from "@/hooks/useSentiment"
import type { SentimentResult } from "@/types/sentiment"

export function SentimentAnalyzer() {
  const [text, setText] = useState("")
  const [result, setResult] = useState<SentimentResult | null>(null)
  const { analyzeSentiment, loading, error } = useSentiment()

  const handleAnalyze = async () => {
    if (!text.trim()) return

    try {
      const analysisResult = await analyzeSentiment(text)
      setResult(analysisResult)
    } catch (err) {
      console.error("Analysis failed:", err)
    }
  }

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
      <div className="space-y-4">
        <Textarea
          placeholder="Enter text to analyze sentiment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[120px]"
        />

        <Button onClick={handleAnalyze} disabled={!text.trim() || loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <MessageSquare className="mr-2 h-4 w-4" />
              Analyze Sentiment
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getSentimentIcon(result.sentiment)}
              Analysis Result
            </CardTitle>
            <CardDescription>Sentiment analysis powered by siebert/sentiment-roberta-large-english</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Sentiment:</span>
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
                <h4 className="text-sm font-medium">Detailed Scores:</h4>
                <div className="space-y-2">
                  {Object.entries(result.scores).map(([label, score]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{label}:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={score * 100} className="h-1 w-20" />
                        <span className="font-medium w-12 text-right">{(score * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Analyzed text: "{result.text.substring(0, 100)}
                {result.text.length > 100 ? "..." : ""}"
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
